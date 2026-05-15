from typing import List
import random
from .base_scraper import BaseScraper, Product


class TaobaoScraper(BaseScraper):
    def __init__(self):
        super().__init__('taobao')

    async def search(self, keyword: str, limit: int = 20) -> List[Product]:
        products = []

        brands = ['Apple/苹果', '华为HUAWEI', '小米MI', 'Samsung/三星', 'OPPO', 'vivo', '一加OnePlus', '荣耀HONOR']
        brand = random.choice(brands)

        product_types = self._get_product_types(keyword)

        for i in range(limit):
            base_price = self._generate_price(keyword)
            variation = random.uniform(0.90, 1.20)
            price = round(base_price * variation, 2)

            shop = self._generate_shop_name('taobao', brand)
            sales = self._generate_sales(price, 'taobao')

            product = Product(
                id=self.generate_product_id('taobao', i),
                name=f"{brand} {product_types[i % len(product_types)]} {self._get_variant(i)}",
                price=price,
                sales=sales,
                rating=round(random.uniform(4.2, 4.8), 1),
                shop=shop,
                url=self.get_product_url(f"taobao_{keyword}_{i}"),
                platform='taobao',
                image_url=f"https://via.placeholder.com/200x200.png?text={keyword[:10]}"
            )
            products.append(product)

        return products

    def _get_product_types(self, keyword: str) -> List[str]:
        types_map = {
            '手机': ['智能手机', '5G全网通', '游戏手机', '学生手机', '商务手机'],
            '电脑': ['笔记本', '游戏本', '商务本', '超薄本', '台式机'],
            '耳机': ['蓝牙耳机', '无线耳机', '运动耳机', '游戏耳机', 'HIFI耳机'],
            '手表': ['智能手环', '运动手表', '儿童电话手表', '机械表', '电子表'],
            '相机': ['单反相机', '微单相机', '数码相机', '运动相机', '航拍无人机'],
        }

        for key, values in types_map.items():
            if key in keyword:
                return values

        return [
            f"热销爆款 {keyword}",
            f"新品上市 {keyword}",
            f"限时特惠 {keyword}",
            f"厂家直销 {keyword}",
            f"品质保证 {keyword}"
        ]

    def _get_variant(self, index: int) -> str:
        variants = ['套餐一', '套餐二', '套餐三', '官方标配', '豪华套餐', '基础款']
        return variants[index % len(variants)]

    def _generate_price(self, keyword: str) -> float:
        price_ranges = {
            '手机': (1599, 5999),
            '电脑': (2999, 11999),
            '笔记本': (2999, 13999),
            '耳机': (49, 1599),
            '手表': (199, 2999),
            '相机': (999, 17999),
        }

        for key, (min_p, max_p) in price_ranges.items():
            if key in keyword:
                return random.uniform(min_p, max_p)

        return random.uniform(49, 1999)

    def _generate_shop_name(self, platform: str, brand: str) -> str:
        prefixes = ['旗舰店', '专卖店', '直销店', '特卖店', '工厂店', '全球购']
        brand_clean = brand.split('/')[0] if '/' in brand else brand
        return f"{brand_clean} {random.choice(prefixes)}"

    def _generate_sales(self, price: float, platform: str) -> int:
        base_sales = int(random.expovariate(1/800))
        if price < 300:
            multiplier = random.randint(10, 50)
        elif price < 1500:
            multiplier = random.randint(5, 20)
        else:
            multiplier = random.randint(1, 8)

        return base_sales * multiplier
