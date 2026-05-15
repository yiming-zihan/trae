from typing import List, Dict, Set
from collections import defaultdict
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper.base_scraper import Product


class DataDeduplicator:
    @staticmethod
    def deduplicate(products: List[Product], strategy: str = 'price') -> List[Product]:
        if strategy == 'price':
            return DataDeduplicator._deduplicate_by_price(products)
        elif strategy == 'rating':
            return DataDeduplicator._deduplicate_by_rating(products)
        elif strategy == 'sales':
            return DataDeduplicator._deduplicate_by_sales(products)
        elif strategy == 'comprehensive':
            return DataDeduplicator._deduplicate_comprehensive(products)
        else:
            return products

    @staticmethod
    def _deduplicate_by_price(products: List[Product]) -> List[Product]:
        groups = defaultdict(list)

        for product in products:
            key = DataDeduplicator._normalize_key(product.name)
            groups[key].append(product)

        unique_products = []
        for key, group in groups.items():
            best = min(group, key=lambda p: (p.price, -p.rating))
            unique_products.append(best)

        return unique_products

    @staticmethod
    def _deduplicate_by_rating(products: List[Product]) -> List[Product]:
        groups = defaultdict(list)

        for product in products:
            key = DataDeduplicator._normalize_key(product.name)
            groups[key].append(product)

        unique_products = []
        for key, group in groups.items():
            best = max(group, key=lambda p: (p.rating, -p.price))
            unique_products.append(best)

        return unique_products

    @staticmethod
    def _deduplicate_by_sales(products: List[Product]) -> List[Product]:
        groups = defaultdict(list)

        for product in products:
            key = DataDeduplicator._normalize_key(product.name)
            groups[key].append(product)

        unique_products = []
        for key, group in groups.items():
            best = max(group, key=lambda p: p.sales)
            unique_products.append(best)

        return unique_products

    @staticmethod
    def _deduplicate_comprehensive(products: List[Product]) -> List[Product]:
        groups = defaultdict(list)

        for product in products:
            key = DataDeduplicator._normalize_key(product.name)
            groups[key].append(product)

        unique_products = []
        for key, group in groups.items():
            best = max(group, key=lambda p: DataDeduplicator._comprehensive_score(p))
            unique_products.append(best)

        return unique_products

    @staticmethod
    def _normalize_key(name: str) -> str:
        import re
        name = name.lower()
        name = re.sub(r'[^\w\s]', '', name)
        name = re.sub(r'\s+', '', name)
        name = ''.join(c for c in name if c.isalnum() or c.isspace())
        return name.strip()

    @staticmethod
    def _comprehensive_score(product: Product) -> float:
        price_score = 1000 / (product.price + 1)
        rating_score = product.rating * 100
        sales_score = min(product.sales / 1000, 100)

        return price_score * 0.4 + rating_score * 0.4 + sales_score * 0.2

    @staticmethod
    def deduplicate_by_url(products: List[Product]) -> List[Product]:
        seen_urls = set()
        unique_products = []

        for product in products:
            if product.url not in seen_urls:
                seen_urls.add(product.url)
                unique_products.append(product)

        return unique_products

    @staticmethod
    def get_duplicate_statistics(products: List[Product]) -> Dict:
        groups = defaultdict(list)
        for product in products:
            key = DataDeduplicator._normalize_key(product.name)
            groups[key].append(product)

        duplicate_groups = {k: v for k, v in groups.items() if len(v) > 1}

        return {
            'total_products': len(products),
            'unique_products': len(groups),
            'duplicate_count': len(products) - len(groups),
            'duplicate_groups': len(duplicate_groups),
            'max_duplicates': max((len(v) for v in groups.values()), default=0)
        }
