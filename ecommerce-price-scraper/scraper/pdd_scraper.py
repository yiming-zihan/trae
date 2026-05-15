from typing import List
import random
from .base_scraper import BaseScraper, Product


class PDDScraper(BaseScraper):
    def __init__(self):
        super().__init__('pdd')

    async def search(self, keyword: str, limit: int = 20) -> List[Product]:
        products = []

        brands = ['Apple', '华为', '小米', '三星', 'OPPO', 'vivo', '一加', '荣耀', 'realme', 'iQOO']
        brand = random.choice(brands)

        product_types = self._get_product_types(keyword)

        for i in range(limit):
            base_price = self._generate_price(keyword)
            variation = random.uniform(0.85, 1.10)
            price = round(base_price * variation, 2)

            shop = self._generate_shop_name('pdd', brand)
            sales = self._generate_sales(price, 'pdd')

            product = Product(
                id=self.generate_product_id('pdd', i),
                name=f"{brand} {product_types[i % len(product_types)]} {self._get_variant(i)}",
                price=price,
                sales=sales,
                rating=round(random.uniform(4.0, 4.7), 1),
                shop=shop,
                url=self.get_product_url(f"pdd_{keyword}_{i}"),
                platform='pdd',
                image_url=f"https://via.placeholder.com/200x200.png?text={keyword[:10]}"
            )
            products.append(product)

        return products

    def _get_product_types(self, keyword: str) -> List[str]:
        types_map = {
            '手机': ['智能手机', '5G手机', '游戏手机', '百元机', '千元机', '旗舰机'],
            '电脑': ['笔记本电脑', '游戏本', '办公本', '平板电脑', '台式机组装'],
            '耳机': ['蓝牙耳机', '无线耳机', '有线耳机', '运动耳机', '游戏耳机'],
            '手表': ['智能手表', '运动手环', '儿童手表', '电子表', '机械表'],
            '相机': ['数码相机', '微单', '单反', '运动相机', '拍照手机'],
        }

        for key, values in types_map.items():
            if key in keyword:
                return values

        return [
            f"爆款 {keyword}",
            f"特卖 {keyword}",
            f"亏本冲量 {keyword}",
            f"厂家发货 {keyword}",
            f"限时抢 {keyword}",
            f"拼团 {keyword}"
        ]

    def _get_variant(self, index: int) -> str:
        variants = ['1件装', '2件装', '3件装', '5件装', '10件装', '整箱']
        return variants[index % len(variants)]

    def _generate_price(self, keyword: str) -> float:
        price_ranges = {
            '手机': (899, 4999),
            '电脑': (1999, 8999),
            '笔记本': (1999, 9999),
            '耳机': (29, 999),
            '手表': (99, 1999),
            '相机': (599, 9999),
        }

        for key, (min_p, max_p) in price_ranges.items():
            if key in keyword:
                return random.uniform(min_p, max_p)

        return random.uniform(29, 999)

    def _generate_shop_name(self, platform: str, brand: str) -> str:
        prefixes = ['官方旗舰店', '品牌店', '工厂店', '特卖店', '拼品牌', '精选店', '源头工厂']
        return f"{brand}{random.choice(prefixes)}"

    def _generate_sales(self, price: float, platform: str) -> int:
        base_sales = int(random.expovariate(1/500))
        if price < 200:
            multiplier = random.randint(20, 100)
        elif price < 1000:
            multiplier = random.randint(10, 50)
        else:
            multiplier = random.randint(2, 15)

        return base_sales * multiplier
