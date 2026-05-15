"""
车书回复验证与打分系统
支持标准答案标注和智能评分
"""

import re
import json
import difflib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import Counter


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
    matched_content: str  # 车书中匹配的内容
    key_points_matched: List[str] = field(default_factory=list)  # 匹配的要点
    key_points_missed: List[str] = field(default_factory=list)  # 遗漏的要点
    errors: List[str] = field(default_factory=list)  # 错误信息
    suggestions: List[str] = field(default_factory=list)  # 改进建议

    def to_dict(self) -> dict:
        return {
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
            'suggestions': self.suggestions
        }


class ReplyScorer:
    """回复评分器"""

    def __init__(self, knowledge_base: Dict):
        self.knowledge_base = knowledge_base
        self.nodes = knowledge_base.get('nodes', [])

    def score_reply(self, query_data: Dict, llm_reply: str) -> EvaluationResult:
        """
        对LLM回复进行评分
        返回详细的评估结果
        """
        query_id = query_data.get('query_id', 'UNKNOWN')
        query_text = query_data.get('query_text', '')
        expected_answer = query_data.get('expected_answer', '')

        if not llm_reply or str(llm_reply).strip() == '' or str(llm_reply).lower() == 'nan':
            return self._create_empty_result(query_id, query_text, expected_answer)

        llm_reply_clean = str(llm_reply).strip()

        related_nodes = query_data.get('related_nodes', [])
        matched_content = self._find_matched_content(query_text, llm_reply_clean, related_nodes)

        expected_keywords = self._extract_key_points(expected_answer)
        reply_keywords = self._extract_key_points(llm_reply_clean)

        key_points_matched = self._find_matched_key_points(expected_keywords, reply_keywords)
        key_points_missed = self._find_missed_key_points(expected_keywords, reply_keywords)
        errors = self._find_errors(expected_answer, llm_reply_clean)

        score = self._calculate_score(expected_keywords, reply_keywords,
                                     key_points_matched, key_points_missed, errors)

        score_level = self._get_score_level(score)
        score_reason = self._generate_score_reason(score, key_points_matched,
                                                  key_points_missed, errors)
        suggestions = self._generate_suggestions(key_points_missed, errors)

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
            suggestions=suggestions
        )

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

    def _calculate_score(self, expected_keywords: List[str], reply_keywords: List[str],
                       matched: List[str], missed: List[str], errors: List[str]) -> int:
        """计算评分 (1-4分)"""
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
            return 4
        elif combined_score >= 0.7:
            return 3
        elif combined_score >= 0.5:
            return 2
        else:
            return 1

    def _get_score_level(self, score: int) -> str:
        """获取评分等级"""
        levels = {
            1: '不合格',
            2: '基本合格',
            3: '良好',
            4: '优秀'
        }
        return levels.get(score, '未知')

    def _generate_score_reason(self, score: int, matched: List[str],
                              missed: List[str], errors: List[str]) -> str:
        """生成评分理由"""
        reasons = []

        if score == 4:
            reasons.append("回复完全正确，内容完整准确")
        elif score == 3:
            reasons.append("回复基本正确，")
            if missed:
                reasons.append(f"但遗漏了{len(missed)}个关键要点")
            if errors:
                reasons.append(f"存在{len(errors)}处错误")
        elif score == 2:
            reasons.append("回复部分正确，")
            reasons.append(f"遗漏{len(missed)}个要点，")
            reasons.append(f"存在{len(errors)}处错误")
        else:
            reasons.append("回复与标准答案严重不符或完全错误")

        return ''.join(reasons)

    def _generate_suggestions(self, missed: List[str], errors: List[str]) -> List[str]:
        """生成改进建议"""
        suggestions = []

        if missed:
            suggestions.append(f"建议补充遗漏的关键信息: {'; '.join(missed[:3])}")

        if errors:
            suggestions.append(f"建议修正以下错误: {'; '.join(errors)}")

        if not suggestions:
            suggestions.append("当前回复质量良好，可继续保持")

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
            suggestions=['请检查LLM调用是否成功，确保返回了有效回复']
        )


class BatchEvaluator:
    """批量评估器"""

    def __init__(self, knowledge_base: Dict):
        self.scorer = ReplyScorer(knowledge_base)
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
            'excellent_rate': round(excellent / total * 100, 2)
        }

    def export_results(self, output_path: str):
        """导出评估结果"""
        results_data = [result.to_dict() for result in self.results]

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'statistics': self.get_statistics(),
                'results': results_data
            }, f, ensure_ascii=False, indent=2)

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

    scorer = ReplyScorer(sample_knowledge)

    test_cases = [
        {
            'query_data': {
                'query_id': 'Q_0001',
                'query_text': '如何调节空调温度？',
                'expected_answer': '通过中控屏幕调节空调温度，范围16-30℃',
                'related_nodes': ['KB_0001']
            },
            'llm_reply': '可以通过中控屏幕调节空调温度，支持16-30℃的温度范围。'
        },
        {
            'query_data': {
                'query_id': 'Q_0002',
                'query_text': '座椅加热怎么用？',
                'expected_answer': '座椅加热支持3档调节',
                'related_nodes': []
            },
            'llm_reply': '座椅加热功能使用很简单。'
        }
    ]

    print("\n=== 测试打分系统 ===\n")

    evaluator = BatchEvaluator(sample_knowledge)
    results = evaluator.evaluate_batch(test_cases)

    for result in results:
        print(f"Query: {result.query_text}")
        print(f"期望答案: {result.expected_answer}")
        print(f"LLM回复: {result.llm_reply}")
        print(f"评分: {result.score}分 ({result.score_level})")
        print(f"理由: {result.score_reason}")
        print(f"匹配要点: {result.key_points_matched}")
        print(f"遗漏要点: {result.key_points_missed}")
        print(f"错误: {result.errors}")
        print(f"建议: {result.suggestions}")
        print("-" * 60)

    stats = evaluator.get_statistics()
    print(f"\n统计信息: {stats}")


if __name__ == "__main__":
    main()
