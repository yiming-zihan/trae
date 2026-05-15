# 车辆知识库构建指南

## 📚 目录

1. [系统概述](#系统概述)
2. [构建流程](#构建流程)
3. [详细步骤](#详细步骤)
4. [使用示例](#使用示例)
5. [进阶功能](#进阶功能)
6. [常见问题](#常见问题)

---

## 🏗️ 系统概述

### 什么是车辆知识库？

车辆知识库是基于车书PDF文档构建的结构化知识系统，包含：

- **知识节点**: 从车书中提取的功能、操作、设置等信息
- **知识关系**: 节点之间的关联关系
- **测试Query**: 用于测试LLM的问答对
- **评估结果**: LLM回复的评分和反馈

### 核心能力

✅ **PDF解析**: 自动从车书PDF提取结构化知识
✅ **智能打分**: 支持整合型回复和图片链接验证
✅ **Query生成**: 自动生成测试用例
✅ **本地存储**: SQLite数据库，支持导出Excel

---

## 📝 构建流程

```
车书PDF → 知识提取 → 知识存储 → Query生成 → LLM测试 → 评估打分
```

### 流程说明

1. **知识提取**: 从PDF提取文本、分段、关键词、参数等
2. **知识存储**: 保存到SQLite数据库
3. **Query生成**: 基于知识节点生成测试问题
4. **LLM测试**: 用Query调用LLM获取回复
5. **评估打分**: 对比期望答案，评分并生成报告

---

## 🔨 详细步骤

### 步骤1: 准备车书PDF

将车书PDF文件放在一个固定位置，例如：

```
/Users/bytedance/Downloads/奔驰车书.pdf
```

### 步骤2: 安装依赖

```bash
cd /Users/bytedance/Desktop/trae/car_knowledge_base
pip install pdfplumber pandas openpyxl
```

### 步骤3: 构建知识库（Python脚本）

```python
from car_knowledge_base import (
    CarKnowledgeSystem,
    extract_knowledge_from_pdf,
    KnowledgeBaseDB
)

# 初始化系统
system = CarKnowledgeSystem({
    'pdf_path': '/path/to/your/car_manual.pdf',
    'db_path': 'car_knowledge.db',
    'output_dir': './output'
})

# 提取知识
system.extract_knowledge()

# 保存到数据库
system.save_to_database()
```

### 步骤4: 生成测试Query

```python
# 生成100条测试Query
queries = system.generate_queries(num_queries=100)
```

### 步骤5: 测试LLM

创建测试数据：

```python
test_data = []

for query in queries:
    # 这里调用你的LLM API
    llm_reply = call_your_llm(query['query_text'])

    test_data.append({
        'query_data': query,
        'llm_reply': llm_reply
    })
```

### 步骤6: 评估打分

```python
# 评估LLM回复
results = system.evaluate_replies(llm_replies=test_data)
```

### 步骤7: 查看报告

```python
# 导出到Excel
db = KnowledgeBaseDB('car_knowledge.db')
db.export_to_excel('evaluation_report.xlsx')

# 查看统计
stats = db.get_statistics()
print(stats)
```

---

## 💻 使用示例

### 示例1: 快速开始

```bash
python quick_start.py
```

这会自动：
1. 提取车书知识
2. 生成50条测试Query
3. 评估回复并生成报告

### 示例2: 命令行模式

```bash
# 完整流程
python main.py \
    --pdf /path/to/car_manual.pdf \
    --queries 100 \
    --db car_knowledge.db

# 交互模式
python main.py --mode interactive
```

### 示例3: 集成到你的系统

```python
from car_knowledge_base import CarKnowledgeSystem

# 初始化
system = CarKnowledgeSystem({
    'pdf_path': '/path/to/car_manual.pdf',
    'db_path': 'car_knowledge.db'
})

# 1. 构建知识库
system.extract_knowledge()
system.save_to_database()

# 2. 生成Query
queries = system.generate_queries(num_queries=200)

# 3. 测试你的LLM
your_replies = []
for query in queries:
    reply = your_llm_api(query['query_text'])
    your_replies.append({
        'query_data': query,
        'llm_reply': reply
    })

# 4. 评估结果
system.evaluate_replies(llm_replies=your_replies)
```

---

## 🎯 进阶功能

### 1. 图片链接验证

系统会自动验证LLM回复中的图片链接：

```python
from car_knowledge_base import ImageExtractor

# 提取PDF中的图片
image_extractor = ImageExtractor()
images = image_extractor.extract_images_from_pdf('car_manual.pdf')

# 验证LLM回复中的图片
scorer = ReplyScorer(knowledge_base, image_extractor)
result = scorer.score_reply(query_data, llm_reply)

print(result.image_verification)
# {
#     'has_images': True,
#     'verified_images': [...],
#     'verification_status': 'verified'
# }
```

### 2. 整合型回复认可

系统认可LLM的整合分析结果：

```python
# 自动检测整合型回复
result = scorer.score_reply(query_data, llm_reply)

print(result.is_integrated_reply)  # True/False
print(result.integration_score)   # 0.0-1.0
```

### 3. 自定义Query模板

```python
from car_knowledge_base import QueryGenerator

generator = QueryGenerator(knowledge_base)

# 添加自定义模板
generator.query_templates['custom'] = [
    "详细说明{title}的操作方法",
    "{title}有哪些注意事项？"
]

# 生成Query
queries = generator.generate_queries_from_nodes(
    num_queries=50,
    node_types=['function', 'setting']
)
```

### 4. 批量评估

```python
from car_knowledge_base import BatchEvaluator

evaluator = BatchEvaluator(knowledge_base, image_extractor)

# 批量评估
results = evaluator.evaluate_batch(test_data)

# 导出结果
evaluator.export_results('evaluation_results.json')

# 查看统计
stats = evaluator.get_statistics()
print(f"合格率: {stats['pass_rate']}%")
print(f"优秀率: {stats['excellent_rate']}%")
```

---

## 📊 评分体系

### 评分标准 (1-4分)

| 分数 | 等级 | 说明 | 标准 |
|------|------|------|------|
| 4分 | 优秀 | 完全正确 | 匹配度≥85% |
| 3分 | 良好 | 基本正确 | 匹配度≥70% |
| 2分 | 基本合格 | 部分正确 | 匹配度≥50% |
| 1分 | 不合格 | 错误或无回复 | 匹配度<50% |

### 整合型回复评分

对于整合型回复，系统采用更宽松的标准：

- **语义相似度**: 对比核心含义，不要求字面一致
- **要点匹配**: 检查关键信息是否涵盖
- **逻辑完整性**: 回答是否有逻辑
- **图片辅助**: 是否有相关图片支撑

---

## 🔍 常见问题

### Q1: PDF解析失败？

```bash
# 升级pdfplumber
pip install pdfplumber --upgrade

# 或尝试使用PyPDF2
pip install PyPDF2
```

### Q2: 数据库锁定？

确保同一时间只有一个进程访问数据库。

### Q3: 评分不准确？

可以调整 `reply_scorer_v2.py` 中的参数：
- 相似度阈值（默认0.4）
- 关键词匹配权重
- 句子匹配权重

### Q4: Query生成不足？

增加 `queries_per_type` 参数：
```python
queries = generator.generate_queries_from_nodes(num_queries=500)
```

### Q5: 如何导出报告？

```python
# Excel报告
db.export_to_excel('report.xlsx')

# JSON报告
evaluator.export_results('report.json')

# 查看统计
stats = db.get_statistics()
print(stats)
```

---

## 📂 输出文件

运行后在 `output/` 目录生成：

```
output/
├── knowledge_base.json      # 知识库JSON
├── generated_queries.json  # 生成的测试Query
└── evaluation_*.json       # 评估结果（带时间戳）
```

数据库文件：
```
car_knowledge.db  # SQLite数据库
```

---

## 🔗 相关文档

- [README.md](./README.md) - 系统完整文档
- [快速开始](./quick_start.py) - 运行示例
- [主程序](./main.py) - 命令行工具
- [配置文件](./config.json) - 系统配置

---

## 💡 下一步

1. **运行示例**: `python quick_start.py`
2. **查看代码**: 阅读各模块的源码
3. **自定义**: 根据需要修改评分逻辑
4. **集成**: 将系统集成到你的测试平台

祝你使用愉快！🎉
