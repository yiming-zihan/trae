"""
车书回复验证与打分系统 V2
支持整合型回复评分 + 图片链接验证
"""

import re
import json
import difflib
import hashlib
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass, field
from collections import Counter
from pathlib import Path


@dataclass
class ImageInfo:
    """图片信息"""
    image_id: str
    image_hash: str  # 内容哈希
    page_number: int
    position: str  # 位置描述
    caption: str  # 图片说明
    related_keywords: List[str] = field(default_factory=list)
    source_reference: str = ''  # 来源引用


@dataclass
class EvaluationResult:
    """评估结果"""
    query_id: str
    query_text: str
    llm_reply: str
    expected_answer: str
    score: int  # 1-4分
    score_level: str  # 不合格/基本合格/良好/优秀
    score_reason: str
    matched_content: str
    key_points_matched: List[str] = field(default_factory=list)
    key_points_missed: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)

    image_verification: Dict = field(default_factory=dict)

    is_integrated_reply: bool = False  # 是否为整合型回复
    integration_score: float = 0.0  # 整合质量得分

    def to_dict(self) -> dict:
        result = {
            'query_id': self.query_id,
            'query_text': self.query_text,
            'llm_reply': self.llm_reply,
            'expected_answer': self.expected_answer,
            'score': self.score,
            'score_level': self.score_level,
            'score_reason': self.score_reason,
            'matched_content': self.matched_content,
            'key_points_matched': self.key_points_matched,
            'key_points_missed': self.key_points_missed,
            'errors': self.errors,
            'suggestions': self.suggestions,
            'image_verification': self.image_verification,
            'is_integrated_reply': self.is_integrated_reply,
            'integration_score': self.integration_score
        }
        return result


class ImageExtractor:
    """车书图片提取器"""

    def __init__(self):
        self.images: Dict[str, ImageInfo] = {}

    def extract_images_from_pdf(self, pdf_path: str) -> Dict[str, ImageInfo]:
        """从PDF提取图片信息"""
        try:
            import pdfplumber
        except ImportError:
            print("请安装pdfplumber: pip install pdfplumber")
            return {}

        print(f"正在从PDF提取图片信息: {pdf_path}")

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    if hasattr(page, 'images'):
                        for img_idx, img in enumerate(page.images, 1):
                            image_id = f"IMG_P{page_num:03d}_{img_idx:02d}"

                            image_hash = self._generate_image_hash(img)
                            position = f"Page {page_num}, Position ({img.get('x0', 0):.1f}, {img.get('top', 0):.1f})"

                            img_info = ImageInfo(
                                image_id=image_id,
                                image_hash=image_hash,
                                page_number=page_num,
                                position=position,
                                caption=f"Page {page_num} Image {img_idx}",
                                related_keywords=[]
                            )

                            self.images[image_id] = img_info

            print(f"✓ 提取到 {len(self.images)} 张图片")
            return self.images

        except Exception as e:
            print(f"✗ 图片提取失败: {e}")
            return {}

    def _generate_image_hash(self, img_dict: Dict) -> str:
        """生成图片哈希"""
        key_attrs = [
            str(img_dict.get('x0', '')),
            str(img_dict.get('y0', '')),
            str(img_dict.get('width', '')),
            str(img_dict.get('height', ''))
        ]
        content = '_'.join(key_attrs)
        return hashlib.md5(content.encode()).hexdigest()[:16]

    def add_image_reference(self, image_id: str, keywords: List[str], caption: str = ''):
        """添加图片引用信息"""
        if image_id in self.images:
            self.images[image_id].related_keywords.extend(keywords)
            self.images[image_id].related_keywords = list(set(self.images[image_id].related_keywords))
            if caption:
                self.images[image_id].caption = caption

    def get_image_by_id(self, image_id: str) -> Optional[ImageInfo]:
        """获取图片信息"""
        return self.images.get(image_id)

    def match_image_from_text(self, text: str) -> List[ImageInfo]:
        """根据文本匹配相关图片"""
        matched_images = []
        text_lower = text.lower()

        for img_info in self.images.values():
            for keyword in img_info.related_keywords:
                if keyword.lower() in text_lower:
                    matched_images.append(img_info)
                    break

        return matched_images


class ReplyScorer:
    """回复评分器 V2 - 支持整合型回复"""

    def __init__(self, knowledge_base: Dict, image_extractor: ImageExtractor = None):
        self.knowledge_base = knowledge_base
        self.nodes = knowledge_base.get('nodes', [])
        self.image_extractor = image_extractor

    def extract_urls_from_text(self, text: str) -> List[str]:
        """提取文本中的URL"""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+|file://[^\s<>"{}|\\^`\[\]]+'
        return re.findall(url_pattern, text)

    def extract_image_references(self, text: str) -> List[Dict]:
        """提取图片引用"""
        image_refs = []

        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, text)

        for url in urls:
            if any(keyword in url.lower() for keyword in ['img', 'image', 'pic', 'photo', 'figure', 'fig', '图', '照片', '图片']):
                image_refs.append({
                    'url': url,
                    'type': 'url'
                })

        figure_patterns = [
            r'图\s*(\d+[.\d]*)',
            r'Fig\.?\s*(\d+[.\d]*)',
            r'figure\s*(\d+[.\d]*)',
            r'图\s*(\d+)',
        ]

        for pattern in figure_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                image_refs.append({
                    'reference': match,
                    'type': 'figure_reference',
                    'pattern': pattern
                })

        return image_refs

    def verify_image_links(self, llm_reply: str) -> Dict:
        """验证图片链接"""
        verification = {
            'has_images': False,
            'image_count': 0,
            'verified_images': [],
            'unverified_images': [],
            'image_sources': [],
            'page_references': [],
            'verification_status': 'unknown'
        }

        image_refs = self.extract_image_references(llm_reply)

        if not image_refs:
            return verification

        verification['has_images'] = True
        verification['image_count'] = len(image_refs)

        urls = [ref['url'] for ref in image_refs if ref.get('type') == 'url']

        if self.image_extractor and self.image_extractor.images:
            for img_id, img_info in self.image_extractor.images.items():
                for url in urls:
                    if any(kw.lower() in url.lower() for kw in img_info.related_keywords):
                        verification['verified_images'].append({
                            'image_id': img_id,
                            'page': img_info.page_number,
                            'caption': img_info.caption,
                            'keywords': img_info.related_keywords,
                            'match_type': 'keyword'
                        })
                    elif img_id.lower() in url.lower():
                        verification['verified_images'].append({
                            'image_id': img_id,
                            'page': img_info.page_number,
                            'caption': img_info.caption,
                            'match_type': 'id'
                        })

            unverified_urls = [url for ref in image_refs if ref.get('type') == 'url'
                             for url in [ref['url']]
                             if url not in [v['url'] for v in verification['verified_images']]]

            for url in unverified_urls:
                verification['unverified_images'].append({
                    'url': url,
                    'reason': '无法在车书中找到匹配的原始图片'
                })

        figure_refs = [ref for ref in image_refs if ref.get('type') == 'figure_reference']
        for ref in figure_refs:
            verification['page_references'].append({
                'reference': ref.get('reference', ''),
                'status': '需要验证'
            })

        if verification['verified_images']:
            verification['verification_status'] = 'verified'
        elif verification['unverified_images']:
            verification['verification_status'] = 'partial'
        else:
            verification['verification_status'] = 'no_images'

        return verification

    def detect_integrated_reply(self, text: str, expected: str) -> Tuple[bool, float]:
        """检测是否为整合型回复"""
        if not text or not expected:
            return False, 0.0

        text_clean = re.sub(r'\s+', '', text)
        expected_clean = re.sub(r'\s+', '', expected)

        if len(text_clean) < 20 or len(expected_clean) < 20:
            return False, 0.0

        semantic_similarity = difflib.SequenceMatcher(None, text_clean, expected_clean).ratio()

        text_sentences = re.split(r'[。！？；]', text_clean)
        expected_sentences = re.split(r'[。！？；]', expected_clean)

        sentence_overlap = 0
        for t_sent in text_sentences:
            if len(t_sent) >= 10:
                for e_sent in expected_sentences:
                    if len(e_sent) >= 10:
                        sim = difflib.SequenceMatcher(None, t_sent, e_sent).ratio()
                        if sim > 0.5:
                            sentence_overlap += 1
                            break

        total_sentences = max(len([s for s in text_sentences if len(s) >= 10]), 1)
        sentence_score = sentence_overlap / total_sentences

        text_keywords = set(re.findall(r'[\u4e00-\u9fa5]{2,}', text_clean))
        expected_keywords = set(re.findall(r'[\u4e00-\u9fa5]{2,}', expected_clean))

        keyword_overlap = len(text_keywords & expected_keywords) / len(expected_keywords) if expected_keywords else 0

        integration_score = (semantic_similarity * 0.3 + sentence_score * 0.4 + keyword_overlap * 0.3)

        is_integrated = integration_score >= 0.4 and semantic_similarity >= 0.3

        return is_integrated, integration_score

    def score_integrated_reply(self, llm_reply: str, expected: str,
                             key_points_matched: List[str],
                             key_points_missed: List[str],
                             errors: List[str],
                             image_verification: Dict) -> Tuple[int, str]:
        """对整合型回复进行评分"""

        semantic_similarity = difflib.SequenceMatcher(
            None,
            re.sub(r'\s+', '', llm_reply),
            re.sub(r'\s+', '', expected)
        ).ratio()

        match_ratio = len(key_points_matched) / len(expected) if expected else 0

        has_verified_images = image_verification.get('has_images', False) and \
                             image_verification.get('verified_images')

        score_components = {
            'semantic_similarity': semantic_similarity,
            'key_point_match': match_ratio,
            'error_count': len(errors),
            'image_verification': 1.0 if has_verified_images else 0.5
        }

        if len(errors) <= 2 and match_ratio >= 0.6:
            base_score = 3.5
            reason = f"整合型回复质量良好：语义相似度{semantic_similarity:.0%}，要点匹配{match_ratio:.0%}"
        elif len(errors) <= 4 and match_ratio >= 0.4:
            base_score = 3.0
            reason = f"整合型回复基本正确，但存在{len(errors)}处细节差异"
        elif len(errors) <= 2 and match_ratio >= 0.3:
            base_score = 2.5
            reason = f"整合型回复部分准确，建议补充更多细节"
        else:
            base_score = 2.0
            reason = f"整合型回复信息不足或存在明显错误"

        if has_verified_images:
            reason += f"，包含{len(image_verification['verified_images'])}张验证图片"

        score = 4 if base_score >= 3.5 else 3 if base_score >= 2.5 else 2

        return score, reason

    def score_reply(self, query_data: Dict, llm_reply: str) -> EvaluationResult:
        """对LLM回复进行评分 V2"""
        query_id = query_data.get('query_id', 'UNKNOWN')
        query_text = query_data.get('query_text', '')
        expected_answer = query_data.get('expected_answer', '')

        if not llm_reply or str(llm_reply).strip() == '' or str(llm_reply).lower() == 'nan':
            return self._create_empty_result(query_id, query_text, expected_answer)

        llm_reply_clean = str(llm_reply).strip()

        image_verification = self.verify_image_links(llm_reply_clean)

        is_integrated, integration_score = self.detect_integrated_reply(
            llm_reply_clean, expected_answer
        )

        expected_keywords = self._extract_key_points(expected_answer)
        reply_keywords = self._extract_key_points(llm_reply_clean)

        key_points_matched = self._find_matched_key_points(expected_keywords, reply_keywords)
        key_points_missed = self._find_missed_key_points(expected_keywords, reply_keywords)
        errors = self._find_errors(expected_answer, llm_reply_clean)

        if is_integrated:
            score, score_reason = self.score_integrated_reply(
                llm_reply_clean, expected_answer,
                key_points_matched, key_points_missed, errors,
                image_verification
            )
        else:
            score, score_reason = self._calculate_traditional_score(
                expected_keywords, reply_keywords,
                key_points_matched, key_points_missed, errors
            )

        score_level = self._get_score_level(score)
        suggestions = self._generate_suggestions(key_points_missed, errors, is_integrated)

        matched_content = self._find_matched_content(query_text, llm_reply_clean,
                                                     query_data.get('related_nodes', []))

        return EvaluationResult(
            query_id=query_id,
            query_text=query_text,
            llm_reply=llm_reply_clean,
            expected_answer=expected_answer,
            score=score,
            score_level=score_level,
            score_reason=score_reason,
            matched_content=matched_content,
            key_points_matched=key_points_matched,
            key_points_missed=key_points_missed,
            errors=errors,
            suggestions=suggestions,
            image_verification=image_verification,
            is_integrated_reply=is_integrated,
            integration_score=integration_score
        )

    def _calculate_traditional_score(self, expected_keywords: List[str], reply_keywords: List[str],
                                    matched: List[str], missed: List[str], errors: List[str]) -> Tuple[int, str]:
        """传统评分方法"""
        keyword_match_ratio = len(matched) / len(expected_keywords) if expected_keywords else 0

        similarity_score = 0
        if expected_keywords and reply_keywords:
            all_expected = ' '.join(expected_keywords)
            all_reply = ' '.join(reply_keywords)
            similarity_score = difflib.SequenceMatcher(None, all_expected, all_reply).ratio()

        combined_score = (keyword_match_ratio * 0.5 + similarity_score * 0.5)

        if len(errors) > 3:
            combined_score *= 0.7
        elif len(errors) > 1:
            combined_score *= 0.85

        if combined_score >= 0.85:
            return 4, f"回复完全正确（匹配度{combined_score:.0%}）"
        elif combined_score >= 0.7:
            return 3, f"回复基本正确（匹配度{combined_score:.0%}）"
        elif combined_score >= 0.5:
            return 2, f"回复部分正确，但有遗漏（匹配度{combined_score:.0%}）"
        else:
            return 1, f"回复与标准答案不符（匹配度{combined_score:.0%}）"

    def _extract_key_points(self, text: str) -> List[str]:
        """提取关键要点"""
        points = []

        sentences = re.split(r'[。！？；]', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) >= 5 and len(sentence) <= 100:
                points.append(sentence)

        numbers = re.findall(r'\d+(?:[.,]\d+)?\s*(?:℃|度|%|km|kW|kWh|km/h|升|L|米|m)', text)
        points.extend(numbers[:10])

        parameters = re.findall(r'[\u4e00-\u9fa5]{2,}[:：]\s*[^\n，。！？；]{2,30}', text)
        points.extend(parameters[:10])

        return points[:20]

    def _find_matched_key_points(self, expected: List[str], reply: List[str]) -> List[str]:
        """查找匹配的关键要点"""
        matched = []

        for exp_point in expected:
            exp_clean = re.sub(r'\s+', '', exp_point)
            for reply_point in reply:
                reply_clean = re.sub(r'\s+', '', reply_point)

                similarity = difflib.SequenceMatcher(None, exp_clean, reply_clean).ratio()

                if similarity > 0.6 or exp_clean in reply_clean or reply_clean in exp_clean:
                    matched.append(exp_point)
                    break

        return matched

    def _find_missed_key_points(self, expected: List[str], reply: List[str]) -> List[str]:
        """查找遗漏的关键要点"""
        matched = self._find_matched_key_points(expected, reply)
        return [point for point in expected if point not in matched]

    def _find_errors(self, expected: str, reply: str) -> List[str]:
        """查找错误信息"""
        errors = []

        expected_numbers = re.findall(r'\d+(?:[.,]\d+)?', expected)
        reply_numbers = re.findall(r'\d+(?:[.,]\d+)?', reply)

        for exp_num in expected_numbers:
            if exp_num not in reply_numbers:
                errors.append(f"遗漏数值: {exp_num}")

        expected_units = re.findall(r'(?:℃|度|%|km|kW|kWh|km/h|升|L|米|m)', expected)
        reply_units = re.findall(r'(?:℃|度|%|km|kW|kWh|km/h|升|L|米|m)', reply)

        for exp_unit in expected_units:
            if exp_unit not in reply_units:
                errors.append(f"遗漏单位: {exp_unit}")

        return errors[:5]

    def _find_matched_content(self, query: str, reply: str, related_nodes: List[str]) -> str:
        """查找匹配的车书内容"""
        query_keywords = self._extract_keywords(query)
        matched_content = []

        for node in self.nodes:
            node_id = node.get('node_id')
            node_title = node.get('title', '')
            node_content = node.get('content', '')

            if node_id in related_nodes or any(kw in node_title for kw in query_keywords):
                if len(node_content) > 20:
                    matched_content.append(node_content[:200])

        if not matched_content and self.nodes:
            for node in self.nodes[:10]:
                if any(kw in node.get('content', '') for kw in query_keywords[:3]):
                    matched_content.append(node.get('content', '')[:200])
                    break

        return matched_content[0] if matched_content else "未找到直接匹配的车书内容"

    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        chinese_terms = re.findall(r'[\u4e00-\u9fa5]{2,6}', text)
        numbers_with_unit = re.findall(r'\d+(?:[.,]\d+)?\s*(?:km|kW|kWh|km/h|%|℃|度|升|L|米)', text)
        return list(set(chinese_terms + numbers_with_unit))

    def _get_score_level(self, score: int) -> str:
        """获取评分等级"""
        levels = {
            1: '不合格',
            2: '基本合格',
            3: '良好',
            4: '优秀'
        }
        return levels.get(score, '未知')

    def _generate_suggestions(self, missed: List[str], errors: List[str],
                            is_integrated: bool) -> List[str]:
        """生成改进建议"""
        suggestions = []

        if is_integrated:
            suggestions.append("回复质量良好，已通过整合分析生成准确答案")

        if missed and not is_integrated:
            suggestions.append(f"建议补充遗漏的关键信息: {'; '.join(missed[:3])}")

        if errors:
            suggestions.append(f"建议修正以下错误: {'; '.join(errors)}")

        if not suggestions:
            suggestions.append("当前回复质量优秀，可继续保持")

        return suggestions

    def _create_empty_result(self, query_id: str, query_text: str,
                           expected_answer: str) -> EvaluationResult:
        """创建空回复结果"""
        return EvaluationResult(
            query_id=query_id,
            query_text=query_text,
            llm_reply='',
            expected_answer=expected_answer,
            score=1,
            score_level='不合格',
            score_reason='LLM未返回任何有效回复',
            matched_content='无',
            key_points_matched=[],
            key_points_missed=self._extract_key_points(expected_answer),
            errors=['无回复内容'],
            suggestions=['请检查LLM调用是否成功，确保返回了有效回复'],
            image_verification={'verification_status': 'no_reply'}
        )


class BatchEvaluator:
    """批量评估器 V2"""

    def __init__(self, knowledge_base: Dict, image_extractor: ImageExtractor = None):
        self.scorer = ReplyScorer(knowledge_base, image_extractor)
        self.results: List[EvaluationResult] = []

    def evaluate_batch(self, test_data: List[Dict]) -> List[EvaluationResult]:
        """批量评估"""
        results = []

        for i, item in enumerate(test_data):
            query_data = item.get('query_data', {})
            llm_reply = item.get('llm_reply', '')

            result = self.scorer.score_reply(query_data, llm_reply)
            results.append(result)

            if (i + 1) % 100 == 0:
                print(f"  已评估 {i + 1}/{len(test_data)} 条...")

        self.results = results
        return results

    def get_statistics(self) -> Dict:
        """获取统计信息"""
        if not self.results:
            return {}

        total = len(self.results)
        score_distribution = Counter([r.score for r in self.results])

        avg_score = sum(r.score for r in self.results) / total

        excellent = score_distribution.get(4, 0)
        good = score_distribution.get(3, 0)
        fair = score_distribution.get(2, 0)
        poor = score_distribution.get(1, 0)

        integrated_count = sum(1 for r in self.results if r.is_integrated_reply)
        images_count = sum(1 for r in self.results if r.image_verification.get('has_images'))

        return {
            'total_evaluated': total,
            'average_score': round(avg_score, 2),
            'score_distribution': {
                '优秀(4分)': excellent,
                '良好(3分)': good,
                '基本合格(2分)': fair,
                '不合格(1分)': poor
            },
            'pass_rate': round((excellent + good) / total * 100, 2),
            'excellent_rate': round(excellent / total * 100, 2),
            'integrated_replies': {
                'count': integrated_count,
                'percentage': round(integrated_count / total * 100, 2)
            },
            'image_verification': {
                'replies_with_images': images_count,
                'percentage': round(images_count / total * 100, 2)
            }
        }

    def export_results(self, output_path: str):
        """导出评估结果"""
        results_data = [result.to_dict() for result in self.results]

        output_data = {
            'statistics': self.get_statistics(),
            'results': results_data
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"✓ 评估结果已保存至: {output_path}")


def main():
    """测试函数"""
    sample_knowledge = {
        'nodes': [
            {
                'node_id': 'KB_0001',
                'node_type': 'function',
                'title': '空调温度调节',
                'content': '通过中控屏幕调节空调温度，支持16-30℃范围调节',
                'page_number': 10,
                'section_path': '3.1',
                'keywords': ['空调', '温度', '调节'],
                'parameters': {'温度范围': '16-30℃'},
                'examples': ['示例：将温度调至24度']
            }
        ]
    }

    image_extractor = ImageExtractor()

    scorer = ReplyScorer(sample_knowledge, image_extractor)

    test_cases = [
        {
            'query_data': {
                'query_id': 'Q_0001',
                'query_text': '如何调节空调温度？',
                'expected_answer': '通过中控屏幕调节空调温度，范围16-30℃',
                'related_nodes': ['KB_0001']
            },
            'llm_reply': '空调温度可以通过中控屏进行设置，支持从16到30摄氏度的调节范围。（图1展示了中控屏位置）'
        },
        {
            'query_data': {
                'query_id': 'Q_0002',
                'query_text': '座椅加热怎么用？',
                'expected_answer': '座椅加热支持3档调节',
                'related_nodes': []
            },
            'llm_reply': '座椅加热功能支持三档温度调节，可以通过座椅控制按钮进行操作。'
        }
    ]

    print("\n=== 测试V2打分系统 ===\n")

    evaluator = BatchEvaluator(sample_knowledge, image_extractor)
    results = evaluator.evaluate_batch(test_cases)

    for result in results:
        print(f"Query: {result.query_text}")
        print(f"期望答案: {result.expected_answer}")
        print(f"LLM回复: {result.llm_reply}")
        print(f"评分: {result.score}分 ({result.score_level})")
        print(f"理由: {result.score_reason}")
        print(f"是否为整合型回复: {result.is_integrated_reply}")
        print(f"整合质量得分: {result.integration_score:.2f}")
        print(f"匹配要点: {result.key_points_matched}")
        print(f"遗漏要点: {result.key_points_missed}")
        print(f"错误: {result.errors}")
        print(f"图片验证: {result.image_verification}")
        print(f"建议: {result.suggestions}")
        print("-" * 80)

    stats = evaluator.get_statistics()
    print(f"\n统计信息:")
    for key, value in stats.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
