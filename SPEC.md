# 电商商品价格采集与对比工具

## 1. Concept & Vision

一款实用的电商价格监控工具，帮助消费者快速获取多平台商品价格信息，做出明智的购买决策。工具以效率和清晰为核心，提供命令行批量采集和网页可视化对比两种使用方式，让价格比较变得简单高效。

## 2. System Architecture

### 2.1 架构分层

```
┌─────────────────────────────────────────┐
│      Frontend Layer (Web Interface)      │
│  - 搜索界面  - 价格对比表格  - 图表可视化  │
└────────────────┬────────────────────────┘
                 │ HTTP API
┌────────────────▼────────────────────────┐
│         API Service Layer (FastAPI)       │
│  - REST API  - 异步任务管理  - 数据聚合    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Data Processing Layer             │
│  - 数据清洗  - 去重  - 排序  - 性价比分析  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          Data Collection Layer           │
│  - 京东爬虫  - 淘宝爬虫  - 拼多多爬虫      │
└─────────────────────────────────────────┘
```

### 2.2 技术栈

- **数据采集**: Python + requests (模拟爬虫)
- **API服务**: FastAPI (异步高性能)
- **命令行工具**: Python Click
- **数据处理**: Pandas
- **前端展示**: HTML5 + Chart.js + Bootstrap
- **实时通信**: WebSocket (可选)

## 3. Core Features

### 3.1 数据采集功能

**支持的平台：**
- 京东 (JD.com)
- 淘宝 (Taobao.com)
- 拼多多 (Pinduoduo.com)

**采集数据字段：**
- 商品名称
- 价格（元）
- 销量
- 店铺评分
- 商品链接
- 平台来源
- 采集时间
- 商品图片（可选）

**搜索模式：**
- 关键词搜索
- 支持多平台同时采集
- 可配置采集数量限制

### 3.2 数据处理功能

**数据清洗：**
- 去除HTML标签和特殊字符
- 统一价格格式
- 规范化店铺名称
- 处理缺失值

**数据去重：**
- 基于商品名称相似度去重（编辑距离算法）
- 基于价格+店铺组合去重
- 保留最低价或最高评分

**数据排序：**
- 按价格升序/降序
- 按销量排序
- 按评分排序
- 按性价比指数排序

### 3.3 数据分析功能

**性价比推荐算法：**
```
性价比指数 = (评分 × 销量) / (价格 × 100)
```

**价格趋势分析：**
- 支持导入历史数据进行趋势分析
- 计算价格波动幅度
- 生成价格走势图

### 3.4 可视化展示

**图表类型：**
1. **价格分布直方图**: 展示价格区间分布
2. **平台价格对比柱状图**: 各平台同商品价格对比
3. **销量-价格散点图**: 分析销量与价格关系
4. **性价比排名条形图**: 推荐商品可视化

**数据表格：**
- 支持排序和筛选
- 高亮最低价商品
- 显示性价比标签

## 4. API Design

### 4.1 REST API Endpoints

```
POST /api/search
  Request: { keyword, platforms[], limit }
  Response: { success, data[], message }

GET /api/products/{product_id}
  Response: { product details }

GET /api/compare/{keyword}
  Response: { comparison data with charts }

POST /api/analyze
  Request: { products[] }
  Response: { analysis results with recommendations }
```

### 4.2 WebSocket Events

```
采集进度: progress_update
采集完成: collection_complete
错误通知: error_occurred
```

## 5. Command Line Interface

### 5.1 命令结构

```bash
# 基础搜索
price-scraper search "iPhone 15" --platforms jd taobao pdd

# 高级选项
price-scraper search "MacBook Pro" -p jd taobao -l 50 --sort price

# 导出数据
price-scraper search "AirPods" -o results.csv

# 查看帮助
price-scraper --help
```

### 5.2 CLI参数

- `--keyword`: 搜索关键词（必需）
- `--platforms`: 平台列表（jd/taobao/pdd）
- `--limit`: 每个平台采集数量
- `--sort`: 排序字段（price/sales/rating）
- `--output`: 输出文件路径
- `--format`: 输出格式（json/csv/table）

## 6. Frontend Design

### 6.1 页面结构

```
index.html
├── 搜索栏（关键词输入 + 平台选择 + 搜索按钮）
├── 结果统计卡片（总数、最低价、最高价、平均价）
├── 价格对比图表（主图表区域）
├── 商品对比表格（可排序表格）
└── 性价比推荐（推荐商品卡片）
```

### 6.2 视觉风格

- **设计语言**: 简洁实用主义
- **配色方案**:
  - Primary: #2563eb (蓝色)
  - Secondary: #10b981 (绿色，性价比高)
  - Accent: #f59e0b (橙色，价格警示)
  - Background: #f8fafc (浅灰白)
  - Text: #1e293b (深灰)
- **字体**: Inter, -apple-system, sans-serif
- **图表**: Chart.js，清晰的配色方案

### 6.3 交互设计

- 实时搜索加载动画
- 表格行悬停高亮
- 点击商品行展开详情
- 价格低于平均价自动高亮绿色
- 性价比TOP3商品标记"推荐"标签

## 7. Data Models

### 7.1 Product Schema

```python
{
    "id": "string",
    "name": "string",
    "price": float,
    "sales": int,
    "rating": float,
    "shop": "string",
    "url": "string",
    "platform": "jd|taobao|pdd",
    "image_url": "string",
    "crawled_at": "datetime",
    "cost_performance_score": float
}
```

### 7.2 SearchResult Schema

```python
{
    "keyword": "string",
    "total_count": int,
    "unique_count": int,
    "platforms": ["jd", "taobao", "pdd"],
    "products": [Product],
    "statistics": {
        "lowest_price": float,
        "highest_price": float,
        "average_price": float,
        "top_rated_shop": string
    },
    "recommendations": [Product]
}
```

## 8. Mock Data Strategy

由于无法直接爬取真实电商网站，采用以下策略：

### 8.1 模拟数据生成

**基于真实商品结构生成模拟数据：**
- 商品名称：使用真实产品名 + 随机变体
- 价格：根据品类生成合理价格区间
- 销量：模拟真实销量分布（长尾分布）
- 评分：模拟真实评分分布（4.0-5.0为主）

**数据规模：**
- 每个关键词生成 20-50 条模拟数据
- 覆盖多个平台
- 包含价格差异以展示对比价值

## 9. File Structure

```
ecommerce-price-scraper/
├── scraper/
│   ├── __init__.py
│   ├── base_scraper.py
│   ├── jd_scraper.py
│   ├── taobao_scraper.py
│   ├── pdd_scraper.py
│   └── data_generator.py
├── processor/
│   ├── __init__.py
│   ├── cleaner.py
│   ├── deduplicator.py
│   └── analyzer.py
├── api/
│   ├── __init__.py
│   ├── routes.py
│   └── models.py
├── cli/
│   ├── __init__.py
│   └── commands.py
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── main.py
├── requirements.txt
└── README.md
```

## 10. Acceptance Criteria

### 10.1 功能验收

✅ 支持从三个平台采集数据
✅ 数据包含所有必需字段
✅ 数据清洗后无缺失值和异常值
✅ 去重逻辑正确执行
✅ 排序功能正常工作
✅ 性价比计算准确
✅ CLI工具可独立运行
✅ Web界面可正常展示数据

### 10.2 性能验收

✅ 单次搜索响应时间 < 3秒（模拟数据）
✅ 支持并发采集多个平台
✅ API响应时间 < 500ms

### 10.3 界面验收

✅ 搜索界面简洁易用
✅ 图表清晰展示数据趋势
✅ 表格支持排序功能
✅ 响应式设计适配移动端
✅ 加载状态和错误提示友好
