#!/usr/bin/env python3
"""
快速开始示例 - 车辆知识库系统
"""

from pathlib import Path
import json

from knowledge_extractor import extract_knowledge_from_pdf
from knowledge_storage import KnowledgeBaseDB
from query_generator import QueryGenerator
from reply_scorer_v2 import BatchEvaluator, ImageExtractor


def quick_start():
    """快速开始示例"""

    PDF_PATH = "/Users/bytedance/Downloads/PDF Public (DIN A4 quer), Edition of DIBA 540.1 NA2026-06a IP_DIBA CN MA-CN HU-CN Gen20x.i3 PremPlusPlus, 1, zh_CN.pdf"

    print("=" * 70)
    print("车辆知识库系统 - 快速开始")
    print("=" * 70)

    print("\n[步骤1] 提取车书知识...")
    print(f"PDF路径: {PDF_PATH}")

    knowledge_base = extract_knowledge_from_pdf(PDF_PATH)

    if not knowledge_base:
        print("✗ 知识提取失败")
        return

    print(f"\n✓ 知识提取完成！")
    print(f"  - 总页数: {knowledge_base['metadata']['total_pages']}")
    print(f"  - 知识节点: {knowledge_base['metadata']['total_nodes']}")
    print(f"  - 知识关系: {knowledge_base['metadata']['total_relations']}")

    print("\n[步骤2] 保存到数据库...")

    db = KnowledgeBaseDB("car_knowledge.db")
    db.save_knowledge_base(knowledge_base)

    print("\n[步骤3] 提取图片信息...")

    image_extractor = ImageExtractor()
    images = image_extractor.extract_images_from_pdf(PDF_PATH)
    print(f"✓ 提取到 {len(images)} 张图片")

    print("\n[步骤4] 生成测试Query...")

    generator = QueryGenerator(knowledge_base)
    queries = generator.generate_queries_from_nodes(num_queries=50)

    for query in queries[:5]:
        db.save_query(
            query_id=query['query_id'],
            query_text=query['query_text'],
            expected_answer=query['expected_answer'],
            related_nodes=query.get('related_nodes', []),
            category=query.get('category', ''),
            difficulty=query.get('difficulty', 'medium'),
            tags=query.get('keywords', [])
        )

    print(f"✓ 已生成并保存 {len(queries)} 条测试Query")

    print("\n[步骤5] 评估LLM回复...")

    test_data = []
    for query in queries[:10]:
        test_data.append({
            'query_data': query,
            'llm_reply': query['expected_answer']
        })

    evaluator = BatchEvaluator(knowledge_base, image_extractor)
    results = evaluator.evaluate_batch(test_data)

    print(f"\n✓ 评估完成！")
    print(f"  - 评估数量: {len(results)}")
    print(f"  - 平均分: {sum(r.score for r in results) / len(results):.2f}")
    print(f"  - 整合型回复: {sum(1 for r in results if r.is_integrated_reply)}")
    print(f"  - 含图片回复: {sum(1 for r in results if r.image_verification.get('has_images'))}")

    print("\n[示例评估结果]")
    for i, result in enumerate(results[:3], 1):
        print(f"\n{i}. Query: {result.query_text}")
        print(f"   评分: {result.score}分 ({result.score_level})")
        print(f"   理由: {result.score_reason}")
        print(f"   整合型: {result.is_integrated_reply}")
        if result.image_verification.get('has_images'):
            print(f"   图片: {result.image_verification.get('image_count')}张")

    print("\n" + "=" * 70)
    print("✓ 快速开始完成！")
    print("=" * 70)

    stats = db.get_statistics()
    print("\n数据库统计:")
    print(f"  - 知识节点: {stats['total_nodes']}")
    print(f"  - 关系数: {stats['total_relations']}")
    print(f"  - 测试Query: {stats['total_queries']}")
    print(f"  - 测试结果: {stats['total_results']}")

    db.close()

    print("\n下一步建议:")
    print("1. 使用 python main.py --mode interactive 进入交互模式")
    print("2. 查看 output/ 目录下的生成文件")
    print("3. 导入实际LLM回复进行批量评估")
    print("4. 使用 db.export_to_excel('report.xlsx') 导出报告")


if __name__ == "__main__":
    try:
        quick_start()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
    except Exception as e:
        print(f"\n✗ 发生错误: {e}")
        import traceback
        traceback.print_exc()
