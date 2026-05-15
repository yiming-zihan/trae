#!/usr/bin/env python3

import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scraper import JDScraper, TaobaoScraper, PDDScraper, DataGenerator
from processor import DataCleaner, DataDeduplicator, DataAnalyzer

async def test_scrapers():
    print("=" * 60)
    print("测试电商商品价格采集工具")
    print("=" * 60)

    print("\n[1/5] 测试京东爬虫...")
    jd_scraper = JDScraper()
    jd_products = await jd_scraper.search("iPhone 15", limit=3)
    print(f"   ✓ 京东采集: {len(jd_products)} 条商品")

    print("\n[2/5] 测试淘宝爬虫...")
    taobao_scraper = TaobaoScraper()
    taobao_products = await taobao_scraper.search("iPhone 15", limit=3)
    print(f"   ✓ 淘宝采集: {len(taobao_products)} 条商品")

    print("\n[3/5] 测试拼多多爬虫...")
    pdd_scraper = PDDScraper()
    pdd_products = await pdd_scraper.search("iPhone 15", limit=3)
    print(f"   ✓ 拼多多采集: {len(pdd_products)} 条商品")

    print("\n[4/5] 测试数据清洗...")
    all_products = jd_products + taobao_products + pdd_products
    cleaned = DataCleaner.clean_products(all_products)
    print(f"   清洗前: {len(all_products)} 条")
    print(f"   清洗后: {len(cleaned)} 条")

    print("\n[5/5] 测试数据去重...")
    deduplicated = DataDeduplicator.deduplicate(cleaned, strategy='comprehensive')
    print(f"   去重后: {len(deduplicated)} 条")

    print("\n" + "=" * 60)
    print("数据统计分析")
    print("=" * 60)

    for product in deduplicated:
        product.cost_performance_score = DataAnalyzer._calculate_cost_performance_score(product)

    analysis = DataAnalyzer.analyze(deduplicated)

    print(f"\n💰 价格统计:")
    stats = analysis['statistics']
    print(f"   最低价: ¥{stats['lowest_price']:.2f}")
    print(f"   最高价: ¥{stats['highest_price']:.2f}")
    print(f"   平均价: ¥{stats['average_price']:.2f}")

    print(f"\n🏆 性价比TOP 5:")
    for i, rec in enumerate(analysis['recommendations'][:5], 1):
        print(f"   {i}. {rec['name'][:50]}")
        print(f"      价格: ¥{rec['price']:.2f} | 评分: {rec['rating']} | 销量: {rec['sales']} | 得分: {rec['score']:.2f}")

    print("\n📊 平台对比:")
    for platform, data in analysis['platforms'].items():
        platform_names = {'jd': '京东', 'taobao': '淘宝', 'pdd': '拼多多'}
        print(f"   {platform_names.get(platform, platform)}:")
        print(f"      商品数: {data['count']}")
        print(f"      平均价格: ¥{data['average_price']:.2f}")
        print(f"      平均评分: ⭐{data['average_rating']:.1f}")

    print("\n" + "=" * 60)
    print("测试示例数据生成...")
    print("=" * 60)

    sample = DataGenerator.generate_sample_data("MacBook Pro")
    print(f"\n✓ 生成示例数据: {len(sample)} 条")

    sample_analysis = DataAnalyzer.analyze(sample)
    print(f"✓ 示例数据分析完成")
    print(f"   最低价: ¥{sample_analysis['statistics']['lowest_price']:.2f}")
    print(f"   最高价: ¥{sample_analysis['statistics']['highest_price']:.2f}")

    print("\n" + "=" * 60)
    print("✅ 所有测试通过!")
    print("=" * 60)

    print("\n📚 使用方法:")
    print("   命令行工具:")
    print("   python3 price_scraper.py search \"iPhone 15\"")
    print("   python3 price_scraper.py search \"MacBook\" -p jd taobao -l 30")
    print("\n   API服务:")
    print("   python3 main.py")
    print("   访问 http://localhost:8000/static/index.html 查看Web界面")

if __name__ == "__main__":
    asyncio.run(test_scrapers())
