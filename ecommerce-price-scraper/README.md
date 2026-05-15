# 电商商品价格采集与对比工具

## 📖 项目概述

这是一个完整的电商商品价格采集与分析系统，支持从京东、淘宝、拼多多等主流电商平台批量抓取商品信息，提供数据清洗、去重、排序、性价比分析和可视化对比功能。

### ✨ 核心功能

- 🔍 **多平台采集**: 支持京东、淘宝、拼多多三大平台同时采集
- 🧹 **智能清洗**: 自动去除HTML标签、格式化价格、统一数据格式
- 🔄 **高效去重**: 基于商品名称相似度的智能去重算法
- 📊 **数据分析**: 价格统计、销量分析、评分排名
- 🏆 **性价比推荐**: 基于多维度因子的性价比评分算法
- 📈 **可视化展示**: 图表化呈现价格分布、平台对比
- 💻 **双模式使用**: CLI命令行工具 + Web可视化界面

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                        │
│              Web Interface (HTML5 + Chart.js)           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/JSON
┌───────────────────────▼─────────────────────────────────┐
│                    API Layer (FastAPI)                   │
│           REST API + Data Aggregation Service            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                Processing Layer                          │
│   DataCleaner │ DataDeduplicator │ DataAnalyzer         │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Collection Layer (Mock Scrapers)            │
│      JDScraper │ TaobaoScraper │ PDDScraper             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 1. 环境要求

- Python 3.8+
- pip 包管理器

### 2. 安装依赖

```bash
cd ecommerce-price-scraper
pip install -r requirements.txt
```

### 3. 命令行工具使用

#### 基础搜索
```bash
python3 price_scraper.py search "iPhone 15"
```

#### 指定平台
```bash
python3 price_scraper.py search "MacBook Pro" -p jd taobao
```

#### 设置采集数量
```bash
python3 price_scraper.py search "AirPods" -l 50
```

#### 导出CSV文件
```bash
python3 price_scraper.py search "iPhone 15" -o results.csv -f csv
```

#### 导出JSON文件
```bash
python3 price_scraper.py search "iPhone 15" -o results.json -f json
```

#### 其他命令
```bash
# 查看支持的平台
python3 price_scraper.py platforms

# 查看版本
python3 price_scraper.py version

# 分析已保存的数据
python3 price_scraper.py analyze results.json
```

### 4. Web界面使用

#### 启动API服务
```bash
python3 main.py
```

#### 访问Web界面
打开浏览器访问: http://localhost:8000/static/index.html

## 📊 功能详解

### 1. 数据采集

**支持的平台:**
- 京东 (JD.com) - 平台代码: `jd`
- 淘宝 (Taobao.com) - 平台代码: `taobao`
- 拼多多 (Pinduoduo.com) - 平台代码: `pdd`

**采集的数据字段:**
- 商品名称
- 价格（元）
- 销量
- 店铺评分
- 店铺名称
- 商品链接
- 平台来源
- 采集时间

### 2. 数据处理

#### 数据清洗 (DataCleaner)
- 去除HTML标签和特殊字符
- 统一价格格式（字符串→浮点数）
- 规范化销量表示（万/千/数字）
- 标准化评分范围（0-5）
- 过滤无效数据

#### 数据去重 (DataDeduplicator)
- 基于商品名称相似度去重
- 支持多种去重策略:
  - `price`: 保留最低价
  - `rating`: 保留最高评分
  - `sales`: 保留最高销量
  - `comprehensive`: 综合评分最高

#### 数据分析 (DataAnalyzer)
- 价格统计分析（最低、最高、平均、中位数）
- 平台对比分析
- 性价比评分计算
- 价格分布统计

### 3. 性价比推荐算法

**评分公式:**
```
性价比得分 = (评分因子 × 0.4 + 销量因子 × 0.3 + 价格因子 × 0.3) × 100

其中:
- 评分因子 = 评分 / 5.0
- 销量因子 = min(销量 / 10000, 1.0)
- 价格因子 = 1.0 / (1.0 + 价格 / 1000)
```

### 4. 可视化图表

#### 价格分布直方图
展示商品价格区间分布，帮助了解价格集中区间。

#### 平台价格对比柱状图
对比不同平台的平均价格差异。

#### 商品对比表格
支持排序的商品列表，高亮低价商品。

#### 性价比TOP推荐
基于算法的性价比TOP 5商品卡片展示。

## 💡 使用示例

### 示例1: 搜索iPhone 15

```bash
$ python3 price_scraper.py search "iPhone 15" -l 20

🔍 正在采集商品信息: iPhone 15
   平台: all
   数量: 20/平台

   ✓ 京东: 20 条
   ✓ 淘宝: 20 条
   ✓ 拼多多: 20 条

📊 数据统计:
   总计采集: 60 条
   数据清洗: 60 条
   去重处理: 48 条

💰 价格统计:
   最低价: ¥2999.00
   最高价: ¥13999.00
   平均价: ¥6899.00
   潜在节省: ¥11000.00

🏆 性价比TOP 5:
   1. Apple iPhone 15 128GB 官方标配
      💰 ¥5999.00 | ⭐ 4.9 | 📦 25800件
   2. Apple iPhone 15 Plus 256GB
      💰 ¥6999.00 | ⭐ 4.8 | 📦 18600件
   3. Apple iPhone 15 Pro 256GB
      💰 ¥8999.00 | ⭐ 4.9 | 📦 24500件
   ...
```

### 示例2: 对比不同平台的MacBook价格

```bash
$ python3 price_scraper.py search "MacBook Pro" -p jd taobao -l 30 -f table
```

### 示例3: 导出完整数据

```bash
$ python3 price_scraper.py search "AirPods Pro" -o airpods_data.csv -f csv
$ python3 price_scraper.py analyze airpods_data.csv
```

## 🔧 API接口

### POST /api/search

搜索商品

**请求体:**
```json
{
  "keyword": "iPhone 15",
  "platforms": ["jd", "taobao", "pdd"],
  "limit": 20,
  "sort_by": "price",
  "sort_order": "asc",
  "deduplicate": true
}
```

**响应:**
```json
{
  "success": true,
  "keyword": "iPhone 15",
  "total_count": 60,
  "unique_count": 48,
  "statistics": {
    "lowest_price": 2999.0,
    "highest_price": 13999.0,
    "average_price": 6899.0
  },
  "products": [...]
}
```

### GET /api/sample

获取示例数据

```
GET /api/sample?keyword=iPhone%2015
```

### GET /api/health

健康检查

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00",
  "version": "1.0.0"
}
```

## 📁 项目结构

```
ecommerce-price-scraper/
├── scraper/                    # 数据采集层
│   ├── __init__.py
│   ├── base_scraper.py        # 基类定义
│   ├── jd_scraper.py          # 京东爬虫
│   ├── taobao_scraper.py      # 淘宝爬虫
│   ├── pdd_scraper.py         # 拼多多爬虫
│   └── data_generator.py      # 示例数据生成
├── processor/                  # 数据处理层
│   ├── __init__.py
│   ├── cleaner.py             # 数据清洗
│   ├── deduplicator.py        # 数据去重
│   └── analyzer.py            # 数据分析
├── api/                        # API服务层
│   ├── __init__.py
│   ├── models.py              # Pydantic模型
│   └── routes.py              # 路由定义
├── cli/                        # 命令行工具
│   ├── __init__.py
│   └── commands.py            # CLI命令
├── web/                        # Web界面
│   └── index.html              # 主页面
├── main.py                     # 主入口
├── price_scraper.py            # CLI入口
├── test_system.py              # 测试脚本
├── requirements.txt            # 依赖列表
└── README.md                   # 说明文档
```

## ⚙️ 配置说明

### CLI参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--platforms, -p` | 平台选择 (jd/taobao/pdd/all) | all |
| `--limit, -l` | 每个平台采集数量 | 20 |
| `--sort` | 排序字段 (price/sales/rating/score) | price |
| `--order` | 排序方向 (asc/desc) | asc |
| `--deduplicate` | 是否去重 | True |
| `--output, -o` | 输出文件路径 | None |
| `--format, -f` | 输出格式 (table/json/csv) | table |

### API请求参数

| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 搜索关键词（必需） |
| platforms | string[] | 平台列表 |
| limit | int | 采集数量 (1-100) |
| sort_by | string | 排序字段 |
| sort_order | string | 排序方向 |
| deduplicate | boolean | 是否去重 |

## 🎯 适用场景

1. **购物前调研**: 在购买商品前对比不同平台的价格
2. **价格监控**: 定期采集数据监控价格变化
3. **性价比分析**: 通过算法找出最具性价比的商品
4. **竞品分析**: 了解同类商品在不同平台的定价策略
5. **数据报告**: 生成商品价格对比报告

## ⚠️ 注意事项

1. 本工具使用模拟数据进行演示，实际使用时需要遵守各平台的robots.txt和使用条款
2. 建议设置适当的请求间隔，避免对目标网站造成压力
3. 价格数据会有波动，建议多次采集取平均值
4. 模拟数据仅供演示和开发测试使用

## 🛠️ 故障排除

### 常见问题

**Q: 命令行工具报错 "Module not found"**
```bash
# 确保在项目根目录运行
cd ecommerce-price-scraper
python3 price_scraper.py --help
```

**Q: Web界面无法访问**
```bash
# 确保API服务已启动
python3 main.py
# 访问 http://localhost:8000/static/index.html
```

**Q: 采集数据为空**
检查网络连接，或尝试减少采集数量（--limit 参数）

## 📝 扩展开发

### 添加新平台

1. 在 `scraper/` 目录创建新的爬虫类
2. 继承 `BaseScraper` 基类
3. 实现 `search` 方法
4. 在 `cli/commands.py` 和 `api/routes.py` 中注册新平台

### 自定义去重策略

在 `processor/deduplicator.py` 中扩展 `deduplicate` 方法：

```python
@staticmethod
def deduplicate_custom(products: List[Product], strategy: str) -> List[Product]:
    # 实现自定义去重逻辑
    pass
```

### 添加新分析指标

在 `processor/analyzer.py` 中添加新的分析方法：

```python
@staticmethod
def calculate_custom_metric(products: List[Product]) -> Dict:
    # 实现自定义分析逻辑
    pass
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

**版本**: 1.0.0
**最后更新**: 2024年
