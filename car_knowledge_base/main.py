"""
车辆知识库系统 - 主程序
整合知识提取、存储、Query生成、回复打分
"""

import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

from knowledge_extractor import extract_knowledge_from_pdf, CarBookExtractor
from knowledge_storage import KnowledgeBaseDB
from query_generator import QueryGenerator
from reply_scorer_v2 import BatchEvaluator, ImageExtractor


class CarKnowledgeSystem:
    """车辆知识库系统"""

    def __init__(self, config: dict = None):
        self.config = config or self._default_config()
        self.db = None
        self.knowledge_base = None
        self.query_generator = None
        self.batch_evaluator = None
        self.image_extractor = None

    def _default_config(self) -> dict:
        """默认配置"""
        return {
            'pdf_path': None,
            'db_path': 'car_knowledge.db',
            'output_dir': './output',
            'queries_per_type': 20,
            'test_result_path': './output/test_results'
        }

    def initialize_database(self):
        """初始化数据库"""
        db_path = self.config['db_path']
        self.db = KnowledgeBaseDB(db_path)
        print(f"✓ 数据库已初始化: {db_path}")

    def extract_knowledge(self, pdf_path: str = None) -> dict:
        """从PDF提取知识"""
        if pdf_path:
            self.config['pdf_path'] = pdf_path

        if not self.config['pdf_path']:
            print("✗ 未指定PDF文件路径")
            return None

        print(f"\n{'='*60}")
        print("步骤1: 从PDF提取知识")
        print(f"{'='*60}")

        output_json = Path(self.config['output_dir']) / 'knowledge_base.json'
        output_json.parent.mkdir(parents=True, exist_ok=True)

        self.knowledge_base = extract_knowledge_from_pdf(
            self.config['pdf_path'],
            str(output_json)
        )

        print(f"\n{'='*60}")
        print("步骤1.5: 提取车书图片信息")
        print(f"{'='*60}")
        self.image_extractor = ImageExtractor()
        self.image_extractor.extract_images_from_pdf(self.config['pdf_path'])

        if self.knowledge_base:
            print(f"\n✓ 知识提取完成！")
            print(f"  - 总页数: {self.knowledge_base['metadata']['total_pages']}")
            print(f"  - 知识节点: {self.knowledge_base['metadata']['total_nodes']}")
            print(f"  - 知识关系: {self.knowledge_base['metadata']['total_relations']}")
            print(f"  - 节点类型分布: {self.knowledge_base['metadata']['node_types']}")

        return self.knowledge_base

    def save_to_database(self):
        """保存到数据库"""
        if not self.knowledge_base:
            print("✗ 知识库为空，请先提取知识")
            return

        print(f"\n{'='*60}")
        print("步骤2: 保存到数据库")
        print(f"{'='*60}")

        self.initialize_database()
        self.db.save_knowledge_base(self.knowledge_base)

        print(f"✓ 知识已保存到数据库")

    def generate_queries(self, num_queries: int = None) -> list:
        """生成测试查询"""
        if not self.knowledge_base:
            print("✗ 知识库为空，请先提取知识")
            return []

        print(f"\n{'='*60}")
        print("步骤3: 生成测试Query")
        print(f"{'='*60}")

        self.query_generator = QueryGenerator(self.knowledge_base)

        if not num_queries:
            num_queries = self.config.get('queries_per_type', 20)

        queries = self.query_generator.generate_queries_from_nodes(
            num_queries=num_queries
        )

        output_file = Path(self.config['output_dir']) / 'generated_queries.json'
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'generated_at': datetime.now().isoformat(),
                'total_queries': len(queries),
                'queries': queries
            }, f, ensure_ascii=False, indent=2)

        print(f"✓ 已生成 {len(queries)} 条测试Query")
        print(f"  - 保存位置: {output_file}")

        if self.db:
            for query in queries:
                self.db.save_query(
                    query_id=query['query_id'],
                    query_text=query['query_text'],
                    expected_answer=query['expected_answer'],
                    related_nodes=query.get('related_nodes', []),
                    category=query.get('category', ''),
                    difficulty=query.get('difficulty', 'medium'),
                    tags=query.get('keywords', [])
                )
            print(f"  - 已保存到数据库")

        return queries

    def evaluate_replies(self, llm_replies: list = None):
        """评估LLM回复"""
        if not self.knowledge_base:
            print("✗ 知识库为空，请先提取知识")
            return

        print(f"\n{'='*60}")
        print("步骤4: 评估LLM回复")
        print(f"{'='*60}")

        self.batch_evaluator = BatchEvaluator(self.knowledge_base, self.image_extractor)

        if llm_replies is None:
            queries = self.query_generator.generate_queries_from_nodes(num_queries=10) if self.query_generator else []
            llm_replies = []

            for query in queries:
                llm_replies.append({
                    'query_data': query,
                    'llm_reply': query['expected_answer']
                })

        results = self.batch_evaluator.evaluate_batch(llm_replies)

        output_file = Path(self.config['test_result_path']) / f'evaluation_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        output_file.parent.mkdir(parents=True, exist_ok=True)

        self.batch_evaluator.export_results(str(output_file))

        stats = self.batch_evaluator.get_statistics()
        print(f"\n✓ 评估完成！")
        print(f"  - 总评测量: {stats['total_evaluated']}")
        print(f"  - 平均分: {stats['average_score']}")
        print(f"  - 合格率: {stats['pass_rate']}%")
        print(f"  - 优秀率: {stats['excellent_rate']}%")

        if self.db:
            for result in results:
                self.db.save_test_result(
                    result_id=f"RES_{result.query_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    query_id=result.query_id,
                    llm_reply=result.llm_reply,
                    score=result.score,
                    score_reason=result.score_reason,
                    is_correct=(result.score >= 3)
                )
            print(f"  - 结果已保存到数据库")

        return results

    def run_full_pipeline(self, pdf_path: str, num_queries: int = 100):
        """运行完整流程"""
        print(f"\n{'='*60}")
        print("车辆知识库系统 - 完整流程")
        print(f"{'='*60}")

        self.extract_knowledge(pdf_path)
        self.save_to_database()
        queries = self.generate_queries(num_queries=num_queries)
        self.evaluate_replies()

        print(f"\n{'='*60}")
        print("✓ 完整流程执行完成！")
        print(f"{'='*60}")

        if self.db:
            stats = self.db.get_statistics()
            print(f"\n系统统计:")
            print(f"  - 知识节点总数: {stats['total_nodes']}")
            print(f"  - 测试Query总数: {stats['total_queries']}")
            print(f"  - 测试结果总数: {stats['total_results']}")

    def interactive_mode(self):
        """交互模式"""
        print(f"\n{'='*60}")
        print("车辆知识库系统 - 交互模式")
        print(f"{'='*60}")

        while True:
            print("\n请选择操作:")
            print("1. 从PDF提取知识")
            print("2. 生成测试Query")
            print("3. 评估LLM回复")
            print("4. 运行完整流程")
            print("5. 查看统计信息")
            print("6. 导出数据")
            print("0. 退出")

            choice = input("\n请输入选项 (0-6): ").strip()

            if choice == '1':
                pdf_path = input("请输入PDF文件路径: ").strip()
                if pdf_path:
                    self.extract_knowledge(pdf_path)
                    self.save_to_database()

            elif choice == '2':
                num = input("请输入生成Query数量 (默认100): ").strip()
                num = int(num) if num else 100
                self.query_generator = QueryGenerator(self.knowledge_base)
                self.generate_queries(num)

            elif choice == '3':
                if not self.knowledge_base:
                    print("✗ 请先提取知识库")
                    continue
                self.evaluate_replies()

            elif choice == '4':
                pdf_path = input("请输入PDF文件路径: ").strip()
                if pdf_path:
                    num = input("请输入生成Query数量 (默认100): ").strip()
                    num = int(num) if num else 100
                    self.run_full_pipeline(pdf_path, num)

            elif choice == '5':
                if self.db:
                    stats = self.db.get_statistics()
                    print("\n系统统计:")
                    for key, value in stats.items():
                        print(f"  {key}: {value}")

            elif choice == '6':
                if self.db:
                    output_file = input("请输入导出文件路径: ").strip()
                    if output_file:
                        self.db.export_to_excel(output_file)

            elif choice == '0':
                print("再见！")
                break

            else:
                print("无效选项，请重新输入")

    def close(self):
        """关闭系统"""
        if self.db:
            self.db.close()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='车辆知识库系统')
    parser.add_argument('--pdf', type=str, help='车书PDF文件路径')
    parser.add_argument('--db', type=str, default='car_knowledge.db', help='数据库路径')
    parser.add_argument('--queries', type=int, default=100, help='生成Query数量')
    parser.add_argument('--mode', type=str, choices=['full', 'interactive'], default='full', help='运行模式')
    parser.add_argument('--output', type=str, default='./output', help='输出目录')

    args = parser.parse_args()

    config = {
        'pdf_path': args.pdf,
        'db_path': args.db,
        'output_dir': args.output,
        'queries_per_type': args.queries
    }

    system = CarKnowledgeSystem(config)

    try:
        if args.mode == 'full' and args.pdf:
            system.run_full_pipeline(args.pdf, args.queries)
        else:
            system.interactive_mode()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
    except Exception as e:
        print(f"\n✗ 发生错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        system.close()


if __name__ == "__main__":
    main()
