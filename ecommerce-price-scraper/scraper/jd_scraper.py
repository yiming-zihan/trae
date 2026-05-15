from typing import List
import random
import hashlib
from .base_scraper import BaseScraper, Product


class JDScraper(BaseScraper):
    def __init__(self):
        super().__init__('jd')

    async def search(self, keyword: str, limit: int = 20) -> List[Product]:
        products = []

        brands = ['Apple', '华为', '小米', '三星', 'OPPO', 'vivo', '一加', '荣耀']
        brand = random.choice(brands)

        product_types = self._get_product_types(keyword)

        for i in range(limit):
            base_price = self._generate_price(keyword)
            variation = random.uniform(0.95, 1.15)
            price = round(base_price * variation, 2)

            shop = self._generate_shop_name('jd', brand)
            sales = self._generate_sales(price, 'jd')

            product = Product(
                id=self.generate_product_id('jd', i),
                name=f"{brand} {product_types[i % len(product_types)]} {self._get_variant(i)}",
                price=price,
                sales=sales,
                rating=round(random.uniform(4.3, 4.9), 1),
                shop=shop,
                url=self.get_product_url(f"jd_{keyword}_{i}"),
                platform='jd',
                image_url=f"https://via.placeholder.com/200x200.png?text={keyword[:10]}"
            )
            products.append(product)

        return products

    def _get_product_types(self, keyword: str) -> List[str]:
        types_map = {
            '手机': ['智能手机', '5G手机', '游戏手机', '拍照手机', '商务手机'],
            '电脑': ['笔记本电脑', '游戏本', '轻薄本', '台式机', '一体机'],
            '耳机': ['无线耳机', '降噪耳机', '运动耳机', '游戏耳机', '头戴式耳机'],
            '手表': ['智能手表', '运动手表', '儿童手表', '机械手表', '电子手表'],
            '相机': ['数码相机', '微单相机', '单反相机', '运动相机', '摄像机'],
        }

        for key, values in types_map.items():
            if key in keyword:
                return values

        return [
            f"标准版 {keyword}",
            f"升级版 {keyword}",
            f"旗舰版 {keyword}",
            f"尊享版 {keyword}",
            f"青春版 {keyword}"
        ]

    def _get_variant(self, index: int) -> str:
        variants = ['128GB', '256GB', '512GB', '1TB', '8GB+128GB', '12GB+256GB']
        return variants[index % len(variants)]

    def _generate_price(self, keyword: str) -> float:
        price_ranges = {
            '手机': (1999, 6999),
            '电脑': (3999, 12999),
            '笔记本': (3999, 15999),
            '耳机': (99, 1999),
            '手表': (299, 3999),
            '相机': (1999, 19999),
        }

        for key, (min_p, max_p) in price_ranges.items():
            if key in keyword:
                return random.uniform(min_p, max_p)

        return random.uniform(99, 2999)

    def _generate_shop_name(self, platform: str, brand: str) -> str:
        prefixes = ['官方旗舰店', '专卖店', '自营店', '授权店', '官方直营']
        return f"{brand}{random.choice(prefixes)}"

    def _generate_sales(self, price: float, platform: str) -> int:
        base_sales = int(random.expovariate(1/1000))
        if price < 500:
            multiplier = random.randint(5, 20)
        elif price < 2000:
            multiplier = random.randint(2, 10)
        else:
            multiplier = random.randint(1, 5)

        return base_sales * multiplier
