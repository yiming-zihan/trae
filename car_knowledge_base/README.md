# 车辆知识库系统

基于车书PDF的车辆知识库系统，用于自动化测试和LLM回复验证。

## 功能特性

- **PDF知识提取**: 从车书PDF自动提取结构化知识
- **知识库存储**: SQLite本地数据库，支持CRUD操作
- **Query生成**: 基于知识库自动生成测试用例
- **智能打分**: 标准答案标注，1-4分评分体系
- **批量评估**: 批量评估LLM回复，生成详细报告

## 系统架构

```
car_knowledge_base/
├── knowledge_extractor.py   # PDF解析与知识提取
├── knowledge_storage.py     # 数据库存储管理
├── query_generator.py      # 测试Query生成器
├── reply_scorer.py          # 回复评分系统
├── main.py                  # 主程序入口
└── README.md                # 使用说明
```

## 安装依赖

```bash
pip install pdfplumber pandas openpyxl
```

## 使用方法

### 方法1: 命令行模式

```bash
# 完整流程（提取知识 + 生成Query + 评估回复）
python main.py --pdf /path/to/car_manual.pdf --queries 100

# 仅提取知识
python main.py --pdf /path/to/car_manual.pdf --mode interactive
```

### 方法2: 交互模式

```bash
python main.py --mode interactive
```

### 方法3: Python脚本中使用

```python
from car_knowledge_base import (
    CarKnowledgeSystem,
    extract_knowledge_from_pdf,
    KnowledgeBaseDB,
    QueryGenerator,
    ReplyScorer
)

# 初始化系统
system = CarKnowledgeSystem({
    'pdf_path': '/path/to/car_manual.pdf',
    'db_path': 'car_knowledge.db'
})

# 提取知识
system.extract_knowledge()

# 保存到数据库
system.save_to_database()

# 生成测试Query
queries = system.generate_queries(num_queries=100)

# 评估LLM回复
results = system.evaluate_replies(llm_replies)
```

## 评分体系

系统采用1-4分评分标准：

| 分数 | 等级 | 说明 |
|------|------|------|
| 4分 | 优秀 | 回复完全正确，内容完整准确 |
| 3分 | 良好 | 回复基本正确，遗漏少量要点 |
| 2分 | 基本合格 | 回复部分正确，存在明显错误 |
| 1分 | 不合格 | 回复与标准答案严重不符或完全错误 |

## 数据结构

### 知识节点 (Knowledge Node)

```json
{
  "node_id": "KB_0001",
  "node_type": "function",
  "title": "空调温度调节",
  "content": "通过中控屏幕调节空调温度...",
  "page_number": 10,
  "section_path": "3.1",
  "keywords": ["空调", "温度", "调节"],
  "parameters": {"温度范围": "16-30℃"},
  "examples": ["示例：将温度调至24度"],
  "related_nodes": ["KB_0002"]
}
```

### 测试Query

```json
{
  "query_id": "Q_0001",
  "query_text": "如何调节空调温度？",
  "expected_answer": "通过中控屏幕调节空调温度，范围16-30℃",
  "related_nodes": ["KB_0001"],
  "category": "function",
  "difficulty": "easy",
  "keywords": ["空调", "温度"]
}
```

### 评估结果

```json
{
  "query_id": "Q_0001",
  "query_text": "如何调节空调温度？",
  "llm_reply": "可以通过中控屏幕调节空调...",
  "expected_answer": "通过中控屏幕调节空调温度，范围16-30℃",
  "score": 4,
  "score_level": "优秀",
  "key_points_matched": ["中控屏幕调节", "16-30℃"],
  "key_points_missed": [],
  "errors": [],
  "suggestions": ["当前回复质量良好"]
}
```

## 数据库表结构

### knowledge_nodes
- `node_id`: 节点ID (主键)
- `node_type`: 节点类型
- `title`: 标题
- `content`: 内容
- `page_number`: 页码
- `section_path`: 章节路径
- `keywords`: 关键词
- `parameters`: 参数
- `examples`: 示例
- `related_nodes`: 关联节点

### test_queries
- `query_id`: 查询ID (主键)
- `query_text`: 查询文本
- `expected_answer`: 期望答案
- `related_nodes`: 关联节点
- `category`: 分类
- `difficulty`: 难度
- `tags`: 标签

### test_results
- `result_id`: 结果ID (主键)
- `query_id`: 查询ID
- `llm_reply`: LLM回复
- `score`: 评分
- `score_reason`: 评分理由
- `is_correct`: 是否正确
- `test_date`: 测试日期

## 输出文件

运行后会在 `output/` 目录下生成：

- `knowledge_base.json`: 知识库JSON
- `generated_queries.json`: 生成的测试Query
- `evaluation_*.json`: 评估结果

## 扩展功能

### 导出到Excel

```python
from car_knowledge_base import KnowledgeBaseDB

db = KnowledgeBaseDB('car_knowledge.db')
db.export_to_excel('knowledge_base_export.xlsx')
```

### 搜索知识

```python
db = KnowledgeBaseDB('car_knowledge.db')
results = db.search_nodes('空调')
```

### 获取相关节点

```python
db = KnowledgeBaseDB('car_knowledge.db')
related = db.get_related_nodes('KB_0001')
```

## 配置说明

可以在初始化时配置以下参数：

```python
config = {
    'pdf_path': '/path/to/car_manual.pdf',  # PDF文件路径
    'db_path': 'car_knowledge.db',           # 数据库路径
    'output_dir': './output',                # 输出目录
    'queries_per_type': 20,                  # 每类型生成Query数量
    'test_result_path': './output/test_results'  # 测试结果目录
}

system = CarKnowledgeSystem(config)
```

## 注意事项

1. **PDF格式**: 系统支持大多数标准PDF格式，但复杂排版可能影响提取效果
2. **数据库**: SQLite适合中小规模数据，大规模使用建议迁移到PostgreSQL
3. **评分**: 评分基于关键词匹配和相似度计算，可能存在误差
4. **Query生成**: 自动生成的Query可能需要人工审核和调整

## 故障排除

### PDF加载失败
```bash
pip install pdfplumber --upgrade
```

### 数据库锁定
确保同一时间只有一个进程访问数据库

### 评分不准确
可以调整reply_scorer.py中的相似度阈值

## License

MIT License
