"""
车书PDF解析与知识提取模块
从车辆用户手册PDF中提取结构化知识
"""

import re
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Set, Optional
from collections import defaultdict

try:
    import pdfplumber
    PDF_PARSER = "pdfplumber"
except ImportError:
    try:
        from PyPDF2 import PdfReader
        PDF_PARSER = "PyPDF2"
    except ImportError:
        PDF_PARSER = None


@dataclass
class KnowledgeNode:
    """知识节点"""
    node_id: str
    node_type: str  # function/setting/operation/parameter/condition/warning/tip
    title: str
    content: str
    page_number: int
    section_path: str  # 章节路径，如 "2.1.3"
    keywords: List[str] = field(default_factory=list)
    parameters: Dict[str, str] = field(default_factory=dict)  # 参数名称: 参数值
    related_nodes: List[str] = field(default_factory=list)  # 关联节点ID
    examples: List[str] = field(default_factory=list)  # 示例内容

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'KnowledgeNode':
        return cls(**data)


@dataclass
class KnowledgeRelation:
    """知识关系"""
    relation_id: str
    source_id: str
    target_id: str
    relation_type: str  # contains/depends_on/conflicts_with/similar_to/part_of
    description: str

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'KnowledgeRelation':
        return cls(**data)


class CarBookExtractor:
    """车书PDF提取器"""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.pages = []
        self.section_pattern = re.compile(r'^(\d+(?:\.\d+)*)\s+(.+)$')
        self.keyword_patterns = {
            'parameter': re.compile(r'([\u4e00-\u9fa5]{2,}?)(?::|：|=)\s*([^\n，。！？；]{2,50})'),
            'condition': re.compile(r'(?:前提条件?|注意|警告|须知)[:：]\s*([^\n]{10,100})'),
            'step': re.compile(r'(?:步骤?|操作|方法)[:：]?\s*(\d+[.、]\s*[^\n]+)'),
            'range': re.compile(r'(\d+(?:[.,]\d+)?)\s*(?:km|kW|kWh|km/h|%|度|℃|升|L|米|m|秒|s|分钟|min|小时|h|%))'),
        }

    def load_pdf(self) -> bool:
        """加载PDF文件"""
        print(f"正在加载PDF: {self.pdf_path}")

        if PDF_PARSER == "pdfplumber":
            try:
                import pdfplumber
                with pdfplumber.open(self.pdf_path) as pdf:
                    self.pages = []
                    for i, page in enumerate(pdf.pages):
                        text = page.extract_text()
                        if text:
                            self.pages.append({
                                'page_num': i + 1,
                                'text': text,
                                'width': page.width,
                                'height': page.height
                            })
                print(f"✓ 使用pdfplumber加载成功，共 {len(self.pages)} 页")
                return True
            except Exception as e:
                print(f"pdfplumber加载失败: {e}")

        if PDF_PARSER == "PyPDF2":
            try:
                reader = PdfReader(self.pdf_path)
                self.pages = []
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text:
                        self.pages.append({
                            'page_num': i + 1,
                            'text': text,
                            'width': 0,
                            'height': 0
                        })
                print(f"✓ 使用PyPDF2加载成功，共 {len(self.pages)} 页")
                return True
            except Exception as e:
                print(f"PyPDF2加载失败: {e}")

        print("✗ 无法加载PDF，请安装: pip install pdfplumber")
        return False

    def extract_sections(self) -> List[Dict]:
        """提取章节结构"""
        sections = []
        current_section = None

        for page in self.pages:
            lines = page['text'].split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    continue

                match = self.section_pattern.match(line)
                if match:
                    section_num = match.group(1)
                    section_title = match.group(2)

                    if current_section:
                        sections.append(current_section)

                    current_section = {
                        'section_num': section_num,
                        'title': section_title,
                        'page_num': page['page_num'],
                        'content': [],
                        'level': len(section_num.split('.'))
                    }
                elif current_section and len(line) > 10:
                    current_section['content'].append(line)

        if current_section:
            sections.append(current_section)

        print(f"✓ 提取到 {len(sections)} 个章节")
        return sections

    def extract_functional_blocks(self, sections: List[Dict]) -> List[KnowledgeNode]:
        """提取功能块"""
        nodes = []
        node_id_counter = 1

        for section in sections:
            if section['level'] <= 2:
                continue

            content_text = ' '.join(section['content'])
            if len(content_text) < 20:
                continue

            node_type = self._classify_node_type(section['title'], content_text)
            keywords = self._extract_keywords(section['title'] + ' ' + content_text)
            parameters = self._extract_parameters(content_text)
            examples = self._extract_examples(content_text)

            node = KnowledgeNode(
                node_id=f"KB_{node_id_counter:04d}",
                node_type=node_type,
                title=section['title'],
                content=content_text[:500],
                page_number=section['page_num'],
                section_path=section['section_num'],
                keywords=keywords[:10],
                parameters=parameters,
                examples=examples[:3]
            )

            nodes.append(node)
            node_id_counter += 1

        print(f"✓ 提取到 {len(nodes)} 个知识节点")
        return nodes

    def _classify_node_type(self, title: str, content: str) -> str:
        """分类节点类型"""
        title_lower = title.lower()
        content_lower = content.lower()

        if any(kw in title_lower for kw in ['警告', '注意', '危险', '提醒']):
            return 'warning'
        elif any(kw in title_lower for kw in ['示例', '例子', '案例']):
            return 'example'
        elif any(kw in title_lower for kw in ['提示', '技巧', '小贴士']):
            return 'tip'
        elif any(kw in title_lower for kw in ['设置', '调节', '调整', '配置']):
            return 'setting'
        elif any(kw in title_lower for kw in ['操作', '使用方法', '如何使用']):
            return 'operation'
        elif any(kw in title_lower for kw in ['模式', '功能', '系统']):
            return 'function'
        elif self.keyword_patterns['parameter'].search(content):
            return 'parameter'
        elif self.keyword_patterns['condition'].search(content):
            return 'condition'
        else:
            return 'general'

    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        keywords = []

        chinese_terms = re.findall(r'[\u4e00-\u9fa5]{2,6}', text)
        keywords.extend(chinese_terms[:20])

        numbers_with_unit = re.findall(r'\d+(?:[.,]\d+)?\s*(?:km|kW|kWh|km/h|%|℃|度|升|L|米|m)', text)
        keywords.extend(numbers_with_unit[:10])

        return list(set(keywords))

    def _extract_parameters(self, text: str) -> Dict[str, str]:
        """提取参数"""
        params = {}
        matches = self.keyword_patterns['parameter'].findall(text)

        for param_name, param_value in matches[:10]:
            if len(param_name) >= 2 and len(param_value) >= 2:
                params[param_name.strip()] = param_value.strip()

        return params

    def _extract_examples(self, text: str) -> List[str]:
        """提取示例"""
        examples = []
        example_pattern = re.compile(r'示例[:：]\s*([^\n。！？]{10,100})')
        matches = example_pattern.findall(text)

        for example in matches[:3]:
            examples.append(example.strip())

        return examples

    def build_relations(self, nodes: List[KnowledgeNode]) -> List[KnowledgeRelation]:
        """构建知识关系"""
        relations = []
        relation_id = 1

        keywords_index = defaultdict(list)
        for node in nodes:
            for keyword in node.keywords[:5]:
                keywords_index[keyword].append(node.node_id)

        for node in nodes:
            for keyword in node.keywords[:5]:
                related_ids = keywords_index[keyword]
                for related_id in related_ids:
                    if related_id != node.node_id and related_id not in node.related_nodes:
                        node.related_nodes.append(related_id)

                        relation = KnowledgeRelation(
                            relation_id=f"REL_{relation_id:04d}",
                            source_id=node.node_id,
                            target_id=related_id,
                            relation_type='related_to',
                            description=f'共享关键词: {keyword}'
                        )
                        relations.append(relation)
                        relation_id += 1

        print(f"✓ 构建了 {len(relations)} 个知识关系")
        return relations

    def extract_all(self) -> Dict:
        """提取所有知识"""
        if not self.load_pdf():
            return None

        print("\n开始知识提取...")

        sections = self.extract_sections()
        nodes = self.extract_functional_blocks(sections)
        relations = self.build_relations(nodes)

        knowledge_base = {
            'metadata': {
                'pdf_path': self.pdf_path,
                'total_pages': len(self.pages),
                'total_nodes': len(nodes),
                'total_relations': len(relations),
                'node_types': self._count_node_types(nodes)
            },
            'nodes': [node.to_dict() for node in nodes],
            'relations': [rel.to_dict() for rel in relations],
            'sections': sections
        }

        print("\n✓ 知识提取完成！")
        return knowledge_base

    def _count_node_types(self, nodes: List[KnowledgeNode]) -> Dict[str, int]:
        """统计节点类型"""
        counts = defaultdict(int)
        for node in nodes:
            counts[node.node_type] += 1
        return dict(counts)


def extract_knowledge_from_pdf(pdf_path: str, output_json: Optional[str] = None) -> Dict:
    """从PDF提取知识的便捷函数"""
    extractor = CarBookExtractor(pdf_path)
    knowledge_base = extractor.extract_all()

    if knowledge_base and output_json:
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        print(f"✓ 知识库已保存至: {output_json}")

    return knowledge_base


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法: python knowledge_extractor.py <pdf_path> [output_json]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    extract_knowledge_from_pdf(pdf_path, output_path)
