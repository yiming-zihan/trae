import click
import asyncio
import json
import csv
import sys
import os
from typing import List
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import JDScraper, TaobaoScraper, PDDScraper
from processor import DataCleaner, DataDeduplicator, DataAnalyzer


@click.group()
@click.version_option(version='1.0.0')
def cli():
    """电商商品价格采集与对比工具

    支持从京东、淘宝、拼多多等主流电商平台采集商品信息，
    进行数据清洗、去重、排序和性价比分析。
    """
    pass


@cli.command()
@click.argument('keyword')
@click.option('--platforms', '-p',
              type=click.Choice(['jd', 'taobao', 'pdd', 'all']),
              default='all',
              help='要采集的平台（默认全部平台）')
@click.option('--limit', '-l',
              type=int,
              default=20,
              help='每个平台采集的商品数量（默认20）')
@click.option('--sort',
              type=click.Choice(['price', 'sales', 'rating', 'score']),
              default='price',
              help='排序字段（默认按价格）')
@click.option('--order',
              type=click.Choice(['asc', 'desc']),
              default='asc',
              help='排序方向（默认升序）')
@click.option('--deduplicate/--no-deduplicate',
              default=True,
              help='是否去重（默认去重）')
@click.option('--output', '-o',
              type=click.Path(),
              default=None,
              help='输出文件路径（可选）')
@click.option('--format', '-f',
              type=click.Choice(['table', 'json', 'csv']),
              default='table',
              help='输出格式（默认表格）')
def search(keyword: str, platforms: str, limit: int, sort: str,
           order: str, deduplicate: bool, output: str, format: str):
    """搜索并采集商品信息

    示例:
        price-scraper search "iPhone 15"
        price-scraper search "MacBook Pro" -p jd taobao -l 50
        price-scraper search "AirPods" -o results.csv -f csv
    """
    asyncio.run(_search_products(
        keyword, platforms, limit, sort, order,
        deduplicate, output, format
    ))


async def _search_products(keyword: str, platforms: str, limit: int,
                           sort: str, order: str, deduplicate: bool,
                           output: str, format: str):
    click.echo(f"\n🔍 正在采集商品信息: {keyword}")
    click.echo(f"   平台: {platforms}")
    click.echo(f"   数量: {limit}/平台\n")

    platform_map = {
        'jd': JDScraper(),
        'taobao': TaobaoScraper(),
        'pdd': PDDScraper()
    }

    if platforms == 'all':
        platform_list = ['jd', 'taobao', 'pdd']
    else:
        platform_list = [platforms]

    all_products = []
    platform_counts = {}

    with click.progressbar(
        length=len(platform_list),
        label='采集进度',
        show_eta=True
    ) as bar:
        for platform in platform_list:
            if platform in platform_map:
                scraper = platform_map[platform]
                products = await scraper.search(keyword, limit)
                all_products.extend(products)
                platform_counts[platform] = len(products)

                platform_names = {'jd': '京东', 'taobao': '淘宝', 'pdd': '拼多多'}
                click.echo(f"   ✓ {platform_names[platform]}: {len(products)} 条")

            bar.update(1)

    click.echo(f"\n📊 数据统计:")
    click.echo(f"   总计采集: {len(all_products)} 条")

    cleaned_products = DataCleaner.clean_products(all_products)
    click.echo(f"   数据清洗: {len(cleaned_products)} 条")

    if deduplicate:
        deduplicated = DataDeduplicator.deduplicate(cleaned_products, strategy='comprehensive')
        click.echo(f"   去重处理: {len(deduplicated)} 条")
    else:
        deduplicated = cleaned_products

    sorted_products = _sort_products_cli(deduplicated, sort, order)

    for product in sorted_products:
        product.cost_performance_score = DataAnalyzer._calculate_cost_performance_score(product)

    analysis = DataAnalyzer.analyze(sorted_products)

    click.echo(f"\n💰 价格统计:")
    stats = analysis['statistics']
    click.echo(f"   最低价: ¥{stats['lowest_price']:.2f}")
    click.echo(f"   最高价: ¥{stats['highest_price']:.2f}")
    click.echo(f"   平均价: ¥{stats['average_price']:.2f}")
    click.echo(f"   潜在节省: ¥{stats['price_range']:.2f}")

    click.echo(f"\n🏆 性价比TOP 5:")
    recommendations = analysis['recommendations'][:5]
    for i, rec in enumerate(recommendations, 1):
        click.echo(f"   {i}. {rec['name'][:40]}")
        click.echo(f"      💰 ¥{rec['price']:.2f} | ⭐ {rec['rating']} | 📦 {rec['sales']}件")

    if output:
        _save_results(sorted_products, output, format)
        click.echo(f"\n💾 结果已保存至: {output}")
    else:
        if format == 'table':
            _display_table(sorted_products)
        elif format == 'json':
            click.echo(json.dumps([p.to_dict() for p in sorted_products], ensure_ascii=False, indent=2))
        elif format == 'csv':
            click.echo("CSV格式需要指定输出文件: -o results.csv")


def _sort_products_cli(products: List, sort_by: str, sort_order: str):
    reverse = sort_order == 'desc'

    if sort_by == 'price':
        return sorted(products, key=lambda p: p.price, reverse=reverse)
    elif sort_by == 'sales':
        return sorted(products, key=lambda p: p.sales, reverse=reverse)
    elif sort_by == 'rating':
        return sorted(products, key=lambda p: p.rating, reverse=reverse)
    elif sort_by == 'score':
        return sorted(
            products,
            key=lambda p: DataAnalyzer._calculate_cost_performance_score(p),
            reverse=True
        )
    else:
        return products


def _display_table(products: List):
    click.echo("\n📋 商品列表:")
    click.echo("-" * 120)
    click.echo(f"{'序号':^4} | {'商品名称':^45} | {'价格':^10} | {'销量':^8} | {'评分':^5} | {'平台':^6}")
    click.echo("-" * 120)

    for i, product in enumerate(products[:20], 1):
        name = product.name[:42] + '...' if len(product.name) > 42 else product.name
        click.echo(
            f"{i:^4} | {name:<45} | ¥{product.price:>8.2f} | {product.sales:>6} | {product.rating:>4.1f} | {product.platform:^6}"
        )

    if len(products) > 20:
        click.echo(f"\n... 还有 {len(products) - 20} 条数据，使用 -o 导出查看全部")


def _save_results(products: List, output: str, format: str):
    if format == 'json':
        with open(output, 'w', encoding='utf-8') as f:
            json.dump([p.to_dict() for p in products], f, ensure_ascii=False, indent=2)

    elif format == 'csv':
        with open(output, 'w', newline='', encoding='utf-8-sig') as f:
            fieldnames = ['id', 'name', 'price', 'sales', 'rating', 'shop', 'platform', 'url']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for product in products:
                writer.writerow({
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'sales': product.sales,
                    'rating': product.rating,
                    'shop': product.shop,
                    'platform': product.platform,
                    'url': product.url
                })


@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
def analyze(file_path: str):
    """分析已保存的商品数据文件

    示例:
        price-scraper analyze results.json
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            if file_path.endswith('.json'):
                data = json.load(f)
            else:
                click.echo("仅支持JSON格式文件")
                return

        from ..scraper.base_scraper import Product
        from datetime import datetime

        products = []
        for item in data:
            product = Product(
                id=item.get('id', ''),
                name=item.get('name', ''),
                price=float(item.get('price', 0)),
                sales=int(item.get('sales', 0)),
                rating=float(item.get('rating', 0)),
                shop=item.get('shop', ''),
                url=item.get('url', ''),
                platform=item.get('platform', '')
            )
            products.append(product)

        analysis = DataAnalyzer.analyze(products)

        click.echo("\n📊 数据分析结果:")
        click.echo(f"   商品总数: {analysis['total_count']}")
        click.echo(f"   去重后: {analysis['unique_count']}")

        stats = analysis['statistics']
        click.echo(f"\n💰 价格统计:")
        click.echo(f"   最低价: ¥{stats['lowest_price']:.2f}")
        click.echo(f"   最高价: ¥{stats['highest_price']:.2f}")
        click.echo(f"   平均价: ¥{stats['average_price']:.2f}")
        click.echo(f"   中位价: ¥{stats['median_price']:.2f}")

        click.echo(f"\n🏆 性价比TOP 5:")
        for i, rec in enumerate(analysis['recommendations'][:5], 1):
            click.echo(f"   {i}. {rec['name'][:50]}")
            click.echo(f"      价格: ¥{rec['price']:.2f} | 评分: {rec['rating']} | 销量: {rec['sales']} | 得分: {rec['score']:.2f}")

    except Exception as e:
        click.echo(f"❌ 分析失败: {str(e)}", err=True)


@cli.command()
def platforms():
    """显示支持的电商平台列表"""
    click.echo("\n支持的电商平台:")
    click.echo("-" * 50)
    click.echo("   京东 (JD.com)      - jd")
    click.echo("   淘宝 (Taobao.com)  - taobao")
    click.echo("   拼多多 (Pinduoduo) - pdd")
    click.echo("\n使用示例:")
    click.echo("   price-scraper search \"iPhone 15\" -p jd taobao")


@cli.command()
def version():
    """显示版本信息"""
    click.echo("price-scraper v1.0.0")
    click.echo("电商商品价格采集与对比工具")
