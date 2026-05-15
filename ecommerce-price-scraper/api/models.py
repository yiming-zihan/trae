from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class ProductSchema(BaseModel):
    id: str
    name: str
    price: float
    sales: int
    rating: float
    shop: str
    url: str
    platform: str
    image_url: Optional[str] = None
    crawled_at: Optional[str] = None
    cost_performance_score: Optional[float] = None

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    keyword: str = Field(..., min_length=1, description="搜索关键词")
    platforms: List[str] = Field(default=["jd", "taobao", "pdd"], description="平台列表")
    limit: int = Field(default=20, ge=1, le=100, description="每个平台采集数量")
    sort_by: str = Field(default="price", description="排序字段: price, sales, rating, score")
    deduplicate: bool = Field(default=True, description="是否去重")
    sort_order: str = Field(default="asc", description="排序方向: asc, desc")


class SearchResponse(BaseModel):
    success: bool
    keyword: str
    total_count: int
    unique_count: int
    platforms: Dict[str, int]
    statistics: Dict
    recommendations: List[Dict]
    products: List[ProductSchema]
    price_distribution: Dict
    platform_comparison: Dict
    savings_potential: Optional[Dict] = None
    message: str = ""


class AnalysisRequest(BaseModel):
    products: List[ProductSchema]


class AnalysisResponse(BaseModel):
    success: bool
    statistics: Dict
    cost_performance_ranking: List[Dict]
    platform_comparison: Dict
    price_trends: List[Dict]
    recommendations: List[Dict]


class ProductCompareRequest(BaseModel):
    product_ids: List[str]


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
