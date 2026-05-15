#!/usr/bin/env python3
"""
系统测试脚本 - 验证车辆知识库系统是否正常工作
"""

import sys
from pathlib import Path
import importlib.util

# 添加当前目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """测试模块导入"""
    print("\n[测试1] 测试模块导入...")
    try:
        from knowledge_extractor import CarBookExtractor
        from knowledge_storage import KnowledgeBaseDB
        from query_generator import QueryGenerator
        from reply_scorer_v2 import ReplyScorer, BatchEvaluator, ImageExtractor
        from main import CarKnowledgeSystem
        print("✓ 所有模块导入成功")
        return True
    except ImportError as e:
        print(f"✗ 模块导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database():
    """测试数据库初始化"""
    print("\n[测试2] 测试数据库初始化...")
    try:
        from knowledge_storage import KnowledgeBaseDB

        test_db_path = "test_verification.db"
        db = KnowledgeBaseDB(test_db_path)

        stats = db.get_statistics()
        print(f"✓ 数据库初始化成功")
        print(f"  - 路径: {test_db_path}")
        print(f"  - 节点数: {stats['total_nodes']}")

        db.close()

        Path(test_db_path).unlink(missing_ok=True)
        return True
    except Exception as e:
        print(f"✗ 数据库测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_knowledge_base_structure():
    """测试知识库结构"""
    print("\n[测试3] 测试知识库结构...")
    try:
        sample_knowledge = {
            'metadata': {
                'total_pages': 100,
                'total_nodes': 50,
                'total_relations': 20
            },
            'nodes': [
                {
                    'node_id': 'KB_0001',
                    'node_type': 'function',
                    'title': '空调温度调节',
                    'content': '通过中控屏幕调节空调温度',
                    'page_number': 10,
                    'section_path': '3.1',
                    'keywords': ['空调', '温度'],
                    'parameters': {'温度范围': '16-30℃'},
                    'examples': [],
                    'related_nodes': []
                }
            ],
            'relations': []
        }

        from car_knowledge_base import KnowledgeBaseDB
        db = KnowledgeBaseDB("test_structure.db")
        db.save_knowledge_base(sample_knowledge)

        node = db.get_node('KB_0001')
        if node and node['title'] == '空调温度调节':
            print("✓ 知识库结构测试通过")
            db.close()
            Path("test_structure.db").unlink(missing_ok=True)
            return True
        else:
            print("✗ 知识库数据不一致")
            return False

    except Exception as e:
        print(f"✗ 知识库结构测试失败: {e}")
        return False

def test_query_generation():
    """测试Query生成"""
    print("\n[测试4] 测试Query生成...")
    try:
        from car_knowledge_base import QueryGenerator

        knowledge_base = {
            'nodes': [
                {
                    'node_id': 'KB_0001',
                    'node_type': 'function',
                    'title': '空调温度调节',
                    'content': '通过中控屏幕调节空调温度',
                    'page_number': 10,
                    'section_path': '3.1',
                    'keywords': ['空调', '温度'],
                    'parameters': {'温度范围': '16-30℃'},
                    'examples': ['示例：将温度调至24度'],
                    'related_nodes': []
                }
            ]
        }

        generator = QueryGenerator(knowledge_base)
        queries = generator.generate_queries_from_nodes(num_queries=10)

        if len(queries) >= 10:
            print(f"✓ Query生成成功，共 {len(queries)} 条")
            print(f"  - 示例Query: {queries[0]['query_text']}")
            return True
        else:
            print(f"✗ Query生成数量不足: {len(queries)}")
            return False

    except Exception as e:
        print(f"✗ Query生成测试失败: {e}")
        return False

def test_scoring():
    """测试评分系统"""
    print("\n[测试5] 测试评分系统...")
    try:
        from car_knowledge_base import ReplyScorer, ImageExtractor

        knowledge_base = {
            'nodes': [
                {
                    'node_id': 'KB_0001',
                    'node_type': 'function',
                    'title': '空调温度调节',
                    'content': '通过中控屏幕调节空调温度',
                    'page_number': 10,
                    'section_path': '3.1',
                    'keywords': ['空调', '温度'],
                    'parameters': {'温度范围': '16-30℃'},
                    'examples': [],
                    'related_nodes': []
                }
            ]
        }

        image_extractor = ImageExtractor()
        scorer = ReplyScorer(knowledge_base, image_extractor)

        query_data = {
            'query_id': 'Q_TEST',
            'query_text': '如何调节空调温度？',
            'expected_answer': '通过中控屏幕调节空调温度，支持16-30℃范围',
            'related_nodes': ['KB_0001']
        }

        llm_reply = '空调温度可以通过中控屏幕进行调节，支持16-30℃范围。'

        result = scorer.score_reply(query_data, llm_reply)

        if result.score >= 3:
            print(f"✓ 评分系统工作正常")
            print(f"  - 评分: {result.score}分 ({result.score_level})")
            print(f"  - 整合型回复: {result.is_integrated_reply}")
            return True
        else:
            print(f"✗ 评分结果异常: {result.score}")
            return False

    except Exception as e:
        print(f"✗ 评分系统测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试函数"""
    print("=" * 70)
    print("车辆知识库系统 - 功能测试")
    print("=" * 70)

    tests = [
        ("模块导入", test_imports),
        ("数据库初始化", test_database),
        ("知识库结构", test_knowledge_base_structure),
        ("Query生成", test_query_generation),
        ("评分系统", test_scoring)
    ]

    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"✗ {name}测试异常: {e}")
            results.append((name, False))

    print("\n" + "=" * 70)
    print("测试结果汇总")
    print("=" * 70)

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{status:10s} | {name}")

    print(f"\n总计: {passed_count}/{total_count} 通过")

    if passed_count == total_count:
        print("\n🎉 所有测试通过！系统可以正常使用。")
        print("\n下一步:")
        print("1. 运行 python quick_start.py 快速开始")
        print("2. 查看 BUILD_GUIDE.md 详细文档")
        print("3. 使用 python main.py --mode interactive 进入交互模式")
        return 0
    else:
        print(f"\n⚠️  {total_count - passed_count} 项测试失败，请检查错误。")
        return 1

if __name__ == "__main__":
    sys.exit(main())
