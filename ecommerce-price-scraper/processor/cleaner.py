import re
from typing import List, Dict, Any
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper.base_scraper import Product


class DataCleaner:
    @staticmethod
    def clean_products(products: List[Product]) -> List[Product]:
        cleaned = []

        for product in products:
            cleaned_product = DataCleaner._clean_product(product)
            if cleaned_product:
                cleaned.append(cleaned_product)

        return cleaned

    @staticmethod
    def _clean_product(product: Product) -> Product:
        product.name = DataCleaner._clean_text(product.name)
        product.shop = DataCleaner._clean_text(product.shop)
        product.price = DataCleaner._clean_price(product.price)
        product.sales = DataCleaner._clean_sales(product.sales)
        product.rating = DataCleaner._clean_rating(product.rating)

        if DataCleaner._is_valid_product(product):
            return product
        return None

    @staticmethod
    def _clean_text(text: str) -> str:
        if not text:
            return ""

        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        return text

    @staticmethod
    def _clean_price(price: Any) -> float:
        if isinstance(price, (int, float)):
            return float(price)

        if isinstance(price, str):
            price_str = re.sub(r'[^\d.]', '', price)
            try:
                return float(price_str)
            except ValueError:
                return 0.0

        return 0.0

    @staticmethod
    def _clean_sales(sales: Any) -> int:
        if isinstance(sales, int):
            return max(0, sales)

        if isinstance(sales, str):
            sales_str = sales.strip()
            multipliers = {'万': 10000, '千': 1000, 'k': 1000, 'w': 10000}

            for unit, mult in multipliers.items():
                if unit in sales_str:
                    num_str = re.sub(r'[^\d.]', '', sales_str.replace(unit, ''))
                    try:
                        return int(float(num_str) * mult)
                    except ValueError:
                        return 0

            num_str = re.sub(r'[^\d]', '', sales_str)
            try:
                return int(num_str)
            except ValueError:
                return 0

        return 0

    @staticmethod
    def _clean_rating(rating: Any) -> float:
        if isinstance(rating, (int, float)):
            return max(0.0, min(5.0, float(rating)))

        if isinstance(rating, str):
            rating_str = re.sub(r'[^\d.]', '', rating)
            try:
                rating_float = float(rating_str)
                return max(0.0, min(5.0, rating_float))
            except ValueError:
                return 0.0

        return 0.0

    @staticmethod
    def _is_valid_product(product: Product) -> bool:
        if not product.name or len(product.name) < 3:
            return False
        if product.price <= 0:
            return False
        if product.price > 1000000:
            return False
        if product.rating < 0 or product.rating > 5:
            return False
        if product.sales < 0:
            return False

        return True

    @staticmethod
    def remove_duplicates_by_name(products: List[Product], threshold: float = 0.85) -> List[Product]:
        unique_products = []
        seen_names = []

        for product in products:
            is_duplicate = False
            for seen_name in seen_names:
                similarity = DataCleaner._calculate_similarity(product.name, seen_name)
                if similarity >= threshold:
                    is_duplicate = True
                    break

            if not is_duplicate:
                unique_products.append(product)
                seen_names.append(product.name)

        return unique_products

    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        str1 = str1.lower()
        str2 = str2.lower()

        if str1 == str2:
            return 1.0

        len1, len2 = len(str1), len(str2)
        if len1 == 0 or len2 == 0:
            return 0.0

        common_chars = 0
        str2_chars = list(str2)

        for char in str1:
            if char in str2_chars:
                common_chars += 1
                str2_chars.remove(char)

        return 2.0 * common_chars / (len1 + len2)
