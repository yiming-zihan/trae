from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Dict
import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .models import (
    SearchRequest, SearchResponse, AnalysisRequest, AnalysisResponse,
    ProductSchema, ProductCompareRequest, HealthResponse
)
from scraper import JDScraper, TaobaoScraper, PDDScraper, DataGenerator
from processor import DataCleaner, DataDeduplicator, DataAnalyzer

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )


@router.post("/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    try:
        scrapers = {
            'jd': JDScraper(),
            'taobao': TaobaoScraper(),
            'pdd': PDDScraper()
        }

        all_products = []
        platform_counts = {}

        tasks = []
        for platform in request.platforms:
            if platform in scrapers:
                tasks.append((platform, scrapers[platform].search(request.keyword, request.limit)))

        results = await asyncio.gather(*[task for _, task in tasks])

        for i, (platform, _) in enumerate(tasks):
            platform_products = results[i]
            all_products.extend(platform_products)
            platform_counts[platform] = len(platform_products)

        cleaned_products = DataCleaner.clean_products(all_products)

        if request.deduplicate:
            deduplicated_products = DataDeduplicator.deduplicate(
                cleaned_products,
                strategy='comprehensive'
            )
        else:
            deduplicated_products = cleaned_products

        sorted_products = _sort_products(
            deduplicated_products,
            request.sort_by,
            request.sort_order
        )

        for product in sorted_products:
            product.cost_performance_score = DataAnalyzer._calculate_cost_performance_score(product)

        analysis = DataAnalyzer.analyze(sorted_products)

        price_distribution = DataAnalyzer.generate_price_distribution(sorted_products)
        platform_comparison = DataAnalyzer.compare_platforms(sorted_products)
        savings_potential = DataAnalyzer.calculate_savings_potential(sorted_products)

        product_schemas = [
            ProductSchema(
                id=p.id,
                name=p.name,
                price=p.price,
                sales=p.sales,
                rating=p.rating,
                shop=p.shop,
                url=p.url,
                platform=p.platform,
                image_url=p.image_url,
                crawled_at=p.crawled_at.isoformat() if p.crawled_at else None,
                cost_performance_score=getattr(p, 'cost_performance_score', None)
            )
            for p in sorted_products
        ]

        return SearchResponse(
            success=True,
            keyword=request.keyword,
            total_count=len(all_products),
            unique_count=len(sorted_products),
            platforms=platform_counts,
            statistics=analysis['statistics'],
            recommendations=analysis['recommendations'][:5],
            products=product_schemas,
            price_distribution=price_distribution,
            platform_comparison=platform_comparison,
            savings_potential=savings_potential,
            message=f"成功采集并处理 {len(sorted_products)} 条商品数据"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_products(request: AnalysisRequest):
    try:
        products = [
            ProductSchema(**p.model_dump()) if isinstance(p, dict) else p
            for p in request.products
        ]

        statistics = DataAnalyzer.analyze(products)
        platform_comparison = DataAnalyzer.compare_platforms(products)
        price_trends = DataAnalyzer.calculate_price_trends(products)
        recommendations = statistics['recommendations']

        return AnalysisResponse(
            success=True,
            statistics=statistics['statistics'],
            cost_performance_ranking=statistics['cost_performance_ranking'],
            platform_comparison=platform_comparison,
            price_trends=price_trends,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.get("/sample")
async def get_sample_data(keyword: str = "iPhone 15"):
    try:
        sample_products = DataGenerator.generate_sample_data(keyword)

        analysis = DataAnalyzer.analyze(sample_products)
        price_distribution = DataAnalyzer.generate_price_distribution(sample_products)
        platform_comparison = DataAnalyzer.compare_platforms(sample_products)
        savings_potential = DataAnalyzer.calculate_savings_potential(sample_products)

        product_schemas = [
            ProductSchema(
                id=p.id,
                name=p.name,
                price=p.price,
                sales=p.sales,
                rating=p.rating,
                shop=p.shop,
                url=p.url,
                platform=p.platform,
                image_url=p.image_url,
                crawled_at=p.crawled_at.isoformat() if p.crawled_at else None,
                cost_performance_score=DataAnalyzer._calculate_cost_performance_score(p)
            )
            for p in sample_products
        ]

        return {
            'success': True,
            'keyword': keyword,
            'products': [p.model_dump() for p in product_schemas],
            'total_count': len(sample_products),
            'unique_count': len(sample_products),
            'statistics': analysis['statistics'],
            'platforms': {
                'jd': len([p for p in sample_products if p.platform == 'jd']),
                'taobao': len([p for p in sample_products if p.platform == 'taobao']),
                'pdd': len([p for p in sample_products if p.platform == 'pdd'])
            },
            'recommendations': analysis['recommendations'][:5],
            'price_distribution': price_distribution,
            'platform_comparison': platform_comparison,
            'savings_potential': savings_potential
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取示例数据失败: {str(e)}")


@router.get("/compare/{keyword}")
async def compare_products(keyword: str):
    try:
        sample_products = DataGenerator.generate_sample_data(keyword)

        analysis = DataAnalyzer.analyze(sample_products)
        price_distribution = DataAnalyzer.generate_price_distribution(sample_products)
        platform_comparison = DataAnalyzer.compare_platforms(sample_products)

        return {
            'success': True,
            'keyword': keyword,
            'comparison': {
                'products': [p.to_dict() for p in sample_products],
                'platforms': platform_comparison,
                'price_distribution': price_distribution,
                'statistics': analysis['statistics']
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"对比失败: {str(e)}")


@router.get("/suggestions")
async def get_suggestions():
    suggestions = DataGenerator.generate_keyword_suggestions()
    return {
        'success': True,
        'suggestions': suggestions
    }


def _sort_products(products: List, sort_by: str, sort_order: str):
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
