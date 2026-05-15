import random
from typing import List, Dict
from datetime import datetime, timedelta
from .base_scraper import Product


class DataGenerator:
    @staticmethod
    def generate_sample_data(keyword: str = "iPhone 15") -> List[Product]:
        products = []

        sample_products = [
            {"name": "Apple iPhone 15 128GB 黑色 5G全网通", "price": 5999, "sales": 25800, "rating": 4.8, "shop": "Apple官方旗舰店", "platform": "jd"},
            {"name": "Apple iPhone 15 256GB 蓝色 支持以旧换新", "price": 6999, "sales": 18600, "rating": 4.7, "shop": "京东自营店", "platform": "jd"},
            {"name": "Apple/苹果 iPhone 15 128GB 粉色 限时特惠", "price": 5899, "sales": 32100, "rating": 4.9, "shop": "苹果旗舰店", "platform": "taobao"},
            {"name": "Apple iPhone 15 256GB 黑色 学生优惠", "price": 6799, "sales": 15400, "rating": 4.6, "shop": "Apple授权专卖店", "platform": "taobao"},
            {"name": "Apple iPhone 15 128GB 黑色 官方标配", "price": 5999, "sales": 45600, "rating": 4.8, "shop": "Apple官方旗舰店", "platform": "pdd"},
            {"name": "Apple iPhone 15 256GB 蓝色 拼团价", "price": 6499, "sales": 28900, "rating": 4.7, "shop": "苹果拼品牌店", "platform": "pdd"},
            {"name": "Apple iPhone 15 Plus 128GB 绿色 大屏优惠", "price": 6999, "sales": 12300, "rating": 4.7, "shop": "Apple官方旗舰店", "platform": "jd"},
            {"name": "Apple/苹果 iPhone 15 Plus 256GB 黄色", "price": 7199, "sales": 9800, "rating": 4.6, "shop": "苹果专卖店", "platform": "taobao"},
            {"name": "Apple iPhone 15 Pro 128GB 钛金色 旗舰手机", "price": 7999, "sales": 18700, "rating": 4.9, "shop": "Apple官方旗舰店", "platform": "jd"},
            {"name": "Apple iPhone 15 Pro 256GB 原色 现货速发", "price": 8999, "sales": 24500, "rating": 4.9, "shop": "Apple官方直营店", "platform": "jd"},
            {"name": "Apple/苹果 iPhone 15 Pro 256GB 蓝色 官方标配", "price": 8799, "sales": 31200, "rating": 4.8, "shop": "苹果全球购旗舰店", "platform": "taobao"},
            {"name": "Apple iPhone 15 Pro Max 256GB 钛金色 高端旗舰", "price": 9999, "sales": 15600, "rating": 4.9, "shop": "Apple官方旗舰店", "platform": "jd"},
            {"name": "Apple iPhone 15 Pro Max 512GB 黑色 以旧换新", "price": 11999, "sales": 8900, "rating": 4.8, "shop": "Apple授权店", "platform": "taobao"},
            {"name": "Apple iPhone 15 Pro Max 1TB 顶配版", "price": 13999, "sales": 4500, "rating": 4.7, "shop": "Apple官方旗舰店", "platform": "pdd"},
        ]

        platform_domains = {
            'jd': 'jd.com',
            'taobao': 'taobao.com',
            'pdd': 'pinduoduo.com'
        }

        for i, item in enumerate(sample_products):
            domain = platform_domains.get(item['platform'], 'unknown.com')
            product = Product(
                id=f"sample_{item['platform']}_{i}",
                name=item['name'],
                price=item['price'],
                sales=item['sales'],
                rating=item['rating'],
                shop=item['shop'],
                url=f"https://www.{domain}/product/{item['platform']}_{i}",
                platform=item['platform'],
                image_url=f"https://via.placeholder.com/200x200.png?text=iPhone15",
                crawled_at=datetime.now() - timedelta(minutes=random.randint(1, 60))
            )
            products.append(product)

        return products

    @staticmethod
    def generate_keyword_suggestions() -> Dict[str, List[str]]:
        return {
            'categories': ['手机', '电脑', '耳机', '手表', '相机', '平板', '路由器', '移动电源'],
            'popular': [
                'iPhone 15', 'MacBook Pro', 'AirPods Pro', 'Apple Watch',
                '华为Mate60', '小米14', 'OPPO Find X7', 'vivo X100',
                '游戏本', '机械键盘', '电竞鼠标', '显示器'
            ],
            'platforms': ['京东', '淘宝', '拼多多']
        }

    @staticmethod
    def generate_price_trend(days: int = 30) -> List[Dict]:
        trend = []
        base_price = 5999
        for day in range(days):
            date = datetime.now() - timedelta(days=days-day)
            variation = random.uniform(-0.05, 0.05)
            price = base_price * (1 + variation)
            trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(price, 2),
                'platform': 'average'
            })
        return trend
