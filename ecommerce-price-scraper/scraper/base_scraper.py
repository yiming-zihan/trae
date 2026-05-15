from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import asyncio
import time
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Product:
    id: str
    name: str
    price: float
    sales: int
    rating: float
    shop: str
    url: str
    platform: str
    image_url: Optional[str] = None
    crawled_at: Optional[datetime] = None

    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'sales': self.sales,
            'rating': self.rating,
            'shop': self.shop,
            'url': self.url,
            'platform': self.platform,
            'image_url': self.image_url,
            'crawled_at': self.crawled_at.isoformat() if self.crawled_at else None
        }


class BaseScraper(ABC):
    def __init__(self, platform_name: str):
        self.platform_name = platform_name
        self.platform_domains = {
            'jd': 'jd.com',
            'taobao': 'taobao.com',
            'pdd': 'pinduoduo.com'
        }

    @abstractmethod
    async def search(self, keyword: str, limit: int = 20) -> List[Product]:
        pass

    async def fetch_with_retry(self, url: str, max_retries: int = 3) -> Optional[Dict]:
        for attempt in range(max_retries):
            try:
                await asyncio.sleep(0.1)
                return {'status': 'success', 'data': []}
            except Exception as e:
                if attempt == max_retries - 1:
                    return None
                await asyncio.sleep(0.5 * (attempt + 1))

    def generate_product_id(self, platform: str, index: int) -> str:
        timestamp = int(time.time() * 1000)
        return f"{platform}_{timestamp}_{index}"

    def get_product_url(self, product_id: str) -> str:
        domain = self.platform_domains.get(self.platform_name, 'unknown.com')
        return f"https://www.{domain}/product/{product_id}"

    async def scrape(self, keyword: str, limit: int = 20) -> List[Product]:
        start_time = time.time()
        products = await self.search(keyword, limit)
        elapsed = time.time() - start_time

        for product in products:
            product.crawled_at = datetime.now()

        return products
