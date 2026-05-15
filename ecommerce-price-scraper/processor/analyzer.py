from typing import List, Dict, Tuple
from collections import defaultdict
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper.base_scraper import Product


class DataAnalyzer:
    @staticmethod
    def analyze(products: List[Product]) -> Dict:
        if not products:
            return {
                'total_count': 0,
                'unique_count': 0,
                'statistics': {},
                'platforms': {},
                'recommendations': [],
                'cost_performance_ranking': []
            }

        prices = [p.price for p in products]
        ratings = [p.rating for p in products]
        sales = [p.sales for p in products]

        statistics = {
            'lowest_price': min(prices),
            'highest_price': max(prices),
            'average_price': sum(prices) / len(prices),
            'median_price': sorted(prices)[len(prices) // 2],
            'total_sales': sum(sales),
            'average_rating': sum(ratings) / len(ratings),
            'price_range': max(prices) - min(prices)
        }

        platforms = DataAnalyzer._analyze_by_platform(products)
        recommendations = DataAnalyzer._calculate_recommendations(products)
        cost_performance_ranking = DataAnalyzer._calculate_cost_performance(products)

        return {
            'total_count': len(products),
            'unique_count': len(set(p.name for p in products)),
            'statistics': statistics,
            'platforms': platforms,
            'recommendations': recommendations,
            'cost_performance_ranking': cost_performance_ranking
        }

    @staticmethod
    def _analyze_by_platform(products: List[Product]) -> Dict:
        platform_data = defaultdict(lambda: {
            'count': 0,
            'prices': [],
            'total_sales': 0,
            'average_rating': 0,
            'ratings': []
        })

        for product in products:
            platform = product.platform
            platform_data[platform]['count'] += 1
            platform_data[platform]['prices'].append(product.price)
            platform_data[platform]['total_sales'] += product.sales
            platform_data[platform]['ratings'].append(product.rating)

        result = {}
        for platform, data in platform_data.items():
            result[platform] = {
                'count': data['count'],
                'lowest_price': min(data['prices']),
                'highest_price': max(data['prices']),
                'average_price': sum(data['prices']) / len(data['prices']),
                'total_sales': data['total_sales'],
                'average_rating': sum(data['ratings']) / len(data['ratings'])
            }

        return result

    @staticmethod
    def _calculate_recommendations(products: List[Product]) -> List[Dict]:
        scores = []
        for product in products:
            score = DataAnalyzer._calculate_cost_performance_score(product)
            scores.append((product, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        top_10 = scores[:10]

        return [
            {
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'score': score,
                'shop': product.shop,
                'platform': product.platform,
                'sales': product.sales,
                'rating': product.rating
            }
            for product, score in top_10
        ]

    @staticmethod
    def _calculate_cost_performance(products: List[Product]) -> List[Dict]:
        return DataAnalyzer._calculate_recommendations(products)

    @staticmethod
    def _calculate_cost_performance_score(product: Product) -> float:
        if product.price <= 0:
            return 0.0

        rating_factor = product.rating / 5.0
        sales_factor = min(product.sales / 10000, 1.0)

        price_factor = 1.0 / (1.0 + product.price / 1000)

        score = (rating_factor * 0.4 + sales_factor * 0.3 + price_factor * 0.3) * 100

        return round(score, 2)

    @staticmethod
    def calculate_price_trends(products: List[Product], days: int = 7) -> List[Dict]:
        trends = []
        base_price = sum(p.price for p in products) / len(products) if products else 0

        for day in range(days):
            date = datetime.now()
            variation = 1 + (day - days / 2) * 0.005
            noise = 1 + (hash(str(day)) % 100 - 50) / 1000

            trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(base_price * variation * noise, 2)
            })

        return trends

    @staticmethod
    def compare_platforms(products: List[Product]) -> Dict:
        platform_products = defaultdict(list)
        for product in products:
            platform_products[product.platform].append(product)

        comparison = {}
        for platform, platform_product_list in platform_products.items():
            if not platform_product_list:
                continue

            prices = [p.price for p in platform_product_list]
            comparison[platform] = {
                'count': len(platform_product_list),
                'lowest_price': min(prices),
                'highest_price': max(prices),
                'average_price': sum(prices) / len(prices),
                'best_deal': min(platform_product_list, key=lambda p: p.price).name,
                'top_rated': max(platform_product_list, key=lambda p: p.rating).name
            }

        return comparison

    @staticmethod
    def generate_price_distribution(products: List[Product], bins: int = 10) -> Dict:
        if not products:
            return {'bins': [], 'counts': []}

        prices = sorted([p.price for p in products])
        min_price, max_price = min(prices), max(prices)

        if min_price == max_price:
            return {
                'bins': [f'¥{min_price:.0f}'],
                'counts': [len(prices)]
            }

        bin_size = (max_price - min_price) / bins
        bins_list = []
        counts_list = [0] * bins

        for i in range(bins):
            bin_start = min_price + i * bin_size
            bin_end = min_price + (i + 1) * bin_size
            bins_list.append(f'¥{bin_start:.0f}-{bin_end:.0f}')

            for price in prices:
                if bin_start <= price < bin_end:
                    counts_list[i] += 1
            if i == bins - 1:
                for price in prices:
                    if price == max_price:
                        counts_list[i] += 1

        return {
            'bins': bins_list,
            'counts': counts_list
        }

    @staticmethod
    def calculate_savings_potential(products: List[Product]) -> Dict:
        if not products:
            return {}

        sorted_by_price = sorted(products, key=lambda p: p.price)
        cheapest = sorted_by_price[0]
        most_expensive = sorted_by_price[-1]

        potential_savings = most_expensive.price - cheapest.price
        savings_percentage = (potential_savings / most_expensive.price) * 100 if most_expensive.price > 0 else 0

        return {
            'cheapest': {
                'name': cheapest.name,
                'price': cheapest.price,
                'shop': cheapest.shop,
                'platform': cheapest.platform
            },
            'most_expensive': {
                'name': most_expensive.name,
                'price': most_expensive.price,
                'shop': most_expensive.shop,
                'platform': most_expensive.platform
            },
            'potential_savings': round(potential_savings, 2),
            'savings_percentage': round(savings_percentage, 2)
        }
