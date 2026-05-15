"""
车书测试Query生成器
基于知识库自动生成测试用例
"""

import random
import re
import json
from typing import List, Dict, Optional, Tuple
from pathlib import Path
from collections import defaultdict


class QueryGenerator:
    """测试Query生成器"""

    def __init__(self, knowledge_base: Dict):
        self.knowledge_base = knowledge_base
        self.nodes = knowledge_base.get('nodes', [])
        self.query_templates = self._load_query_templates()

    def _load_query_templates(self) -> Dict:
        """加载查询模板"""
        return {
            'function': [
                "{title}怎么使用？",
                "如何使用{title}？",
                "{title}在哪里？",
                "怎么操作{title}？",
                "告诉我关于{title}的信息",
            ],
            'setting': [
                "{title}怎么设置？",
                "如何调节{title}？",
                "{title}在哪里调整？",
                "{title}的设置方法",
                "怎么配置{title}？",
            ],
            'operation': [
                "{title}的操作步骤是什么？",
                "请说明{title}的流程",
                "{title}怎么做？",
                "{title}的具体步骤",
                "完整的{title}流程",
            ],
            'parameter': [
                "{title}的参数范围是多少？",
                "{title}有哪些参数？",
                "{title}的数值范围",
                "{title}可以调节到多少？",
                "{title}的参数说明",
            ],
            'condition': [
                "{title}的前提条件是什么？",
                "使用{title}需要注意什么？",
                "{title}的注意事项",
                "什么情况下需要{title}？",
                "{title}的使用条件",
            ],
            'warning': [
                "{title}的警告信息",
                "{title}有哪些需要注意的？",
                "{title}的危险提示",
                "使用{title}的警告",
                "{title}的安全提示",
            ],
            'tip': [
                "{title}的小技巧",
                "{title}的使用建议",
                "{title}的小贴士",
                "{title}有什么技巧？",
                "{title}的实用建议",
            ],
            'example': [
                "{title}的使用示例",
                "{title}的案例",
                "{title}的具体例子",
                "{title}的示例场景",
                "{title}怎么用？",
            ],
            'general': [
                "{title}是什么？",
                "{title}的功能",
                "关于{title}的说明",
                "{title}的相关信息",
                "{title}的基本介绍",
            ]
        }

    def generate_queries_from_nodes(self, num_queries: int = 100,
                                    node_types: Optional[List[str]] = None) -> List[Dict]:
        """从知识节点生成查询"""
        queries = []

        if node_types:
            filtered_nodes = [n for n in self.nodes if n.get('node_type') in node_types]
        else:
            filtered_nodes = self.nodes

        for i in range(num_queries):
            node = random.choice(filtered_nodes)
            node_type = node.get('node_type', 'general')

            templates = self.query_templates.get(node_type, self.query_templates['general'])
            template = random.choice(templates)

            query_text = template.format(title=node.get('title', ''))

            related_nodes = node.get('related_nodes', [])
            expected_answer = self._generate_expected_answer(node)

            query_data = {
                'query_id': f"Q_{i+1:04d}",
                'query_text': query_text,
                'expected_answer': expected_answer,
                'related_nodes': related_nodes,
                'related_node_titles': [self._get_node_title(nid) for nid in related_nodes],
                'category': node_type,
                'difficulty': self._assess_difficulty(node),
                'keywords': node.get('keywords', [])[:5],
                'source_node': node.get('node_id')
            }

            queries.append(query_data)

        return queries

    def _generate_expected_answer(self, node: Dict) -> str:
        """生成期望答案"""
        parts = []

        title = node.get('title', '')
        if title:
            parts.append(title)

        content = node.get('content', '')
        if content:
            parts.append(content)

        parameters = node.get('parameters', {})
        if parameters:
            param_str = '，'.join([f"{k}: {v}" for k, v in parameters.items()])
            parts.append(f"参数信息: {param_str}")

        examples = node.get('examples', [])
        if examples:
            parts.append(f"示例: {examples[0]}")

        return '。'.join(parts[:3])

    def _get_node_title(self, node_id: str) -> str:
        """获取节点标题"""
        for node in self.nodes:
            if node.get('node_id') == node_id:
                return node.get('title', '')
        return ''

    def _assess_difficulty(self, node: Dict) -> str:
        """评估问题难度"""
        content_length = len(node.get('content', ''))
        num_parameters = len(node.get('parameters', {}))
        num_related = len(node.get('related_nodes', []))

        score = 0
        if content_length > 200:
            score += 2
        elif content_length > 100:
            score += 1

        if num_parameters > 3:
            score += 1
        if num_related > 2:
            score += 1

        if score <= 1:
            return 'easy'
        elif score <= 3:
            return 'medium'
        else:
            return 'hard'

    def generate_variant_queries(self, base_query: Dict, num_variants: int = 5) -> List[Dict]:
        """生成查询变体"""
        variants = []

        question_words = ['怎么', '如何', '什么', '多少', '哪里', '哪个']
        connectors = ['请问', '我想知道', '能否告诉我', '想了解']

        for i in range(num_variants):
            query_text = base_query['query_text']

            if i % 3 == 0:
                for word in question_words[:3]:
                    if word not in query_text:
                        query_text = f"{connectors[i % len(connectors)]}{query_text}"
                        break

            variant = {
                'query_id': f"{base_query['query_id']}_V{i+1}",
                'query_text': query_text,
                'expected_answer': base_query['expected_answer'],
                'related_nodes': base_query['related_nodes'],
                'category': base_query['category'],
                'difficulty': base_query['difficulty'],
                'keywords': base_query['keywords'],
                'source_node': base_query.get('source_node'),
                'parent_query': base_query['query_id']
            }

            variants.append(variant)

        return variants

    def generate_comprehensive_test_set(self, queries_per_type: int = 20) -> Dict:
        """生成综合测试集"""
        all_queries = []

        node_types = ['function', 'setting', 'operation', 'parameter',
                     'condition', 'warning', 'tip', 'example']

        for node_type in node_types:
            type_queries = self.generate_queries_from_nodes(
                num_queries=queries_per_type,
                node_types=[node_type]
            )

            for query in type_queries:
                all_queries.append(query)

            variants = []
            for query in type_queries[:3]:
                variants.extend(self.generate_variant_queries(query, num_variants=2))
            all_queries.extend(variants)

        random.shuffle(all_queries)

        return {
            'total_queries': len(all_queries),
            'queries_by_category': self._count_by_category(all_queries),
            'queries_by_difficulty': self._count_by_difficulty(all_queries),
            'queries': all_queries
        }

    def _count_by_category(self, queries: List[Dict]) -> Dict[str, int]:
        """按类别统计"""
        counts = defaultdict(int)
        for query in queries:
            category = query.get('category', 'unknown')
            counts[category] += 1
        return dict(counts)

    def _count_by_difficulty(self, queries: List[Dict]) -> Dict[str, int]:
        """按难度统计"""
        counts = defaultdict(int)
        for query in queries:
            difficulty = query.get('difficulty', 'medium')
            counts[difficulty] += 1
        return dict(counts)

    def export_queries_to_json(self, output_path: str, num_queries: int = 100):
        """导出查询到JSON"""
        queries = self.generate_queries_from_nodes(num_queries=num_queries)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(queries, f, ensure_ascii=False, indent=2)

        print(f"✓ 已生成 {len(queries)} 条查询，保存至: {output_path}")
        return queries

    def export_comprehensive_test_set(self, output_path: str, queries_per_type: int = 20):
        """导出综合测试集"""
        test_set = self.generate_comprehensive_test_set(queries_per_type=queries_per_type)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(test_set, f, ensure_ascii=False, indent=2)

        print(f"✓ 综合测试集已生成:")
        print(f"  - 总查询数: {test_set['total_queries']}")
        print(f"  - 按类别: {test_set['queries_by_category']}")
        print(f"  - 按难度: {test_set['queries_by_difficulty']}")
        print(f"  - 保存至: {output_path}")

        return test_set


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
                'keywords': ['空调', '温度', '调节', '16-30℃'],
                'parameters': {'温度范围': '16-30℃'},
                'examples': ['示例：将温度调至24度'],
                'related_nodes': ['KB_0002']
            },
            {
                'node_id': 'KB_0002',
                'node_type': 'setting',
                'title': '座椅加热',
                'content': '座椅加热功能，支持3档调节',
                'page_number': 15,
                'section_path': '3.2',
                'keywords': ['座椅', '加热', '3档'],
                'parameters': {'档位': '1-3档'},
                'examples': [],
                'related_nodes': ['KB_0001']
            }
        ]
    }

    generator = QueryGenerator(sample_knowledge)

    print("\n=== 生成10条查询 ===")
    queries = generator.generate_queries_from_nodes(num_queries=10)
    for i, q in enumerate(queries[:3], 1):
        print(f"\n{i}. {q['query_text']}")
        print(f"   期望答案: {q['expected_answer']}")
        print(f"   类别: {q['category']}, 难度: {q['difficulty']}")

    print("\n=== 生成变体查询 ===")
    variants = generator.generate_variant_queries(queries[0], num_variants=3)
    for v in variants:
        print(f"  - {v['query_text']}")

    print("\n=== 导出测试集 ===")
    generator.export_comprehensive_test_set('test_queries.json', queries_per_type=5)


if __name__ == "__main__":
    main()
