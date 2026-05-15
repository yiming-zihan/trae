"""
车辆知识库存储与管理模块
使用SQLite存储结构化知识，支持CRUD操作
"""

import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import asdict
import pandas as pd


class KnowledgeBaseDB:
    """知识库数据库管理器"""

    def __init__(self, db_path: str = "car_knowledge.db"):
        self.db_path = db_path
        self.conn = None
        self._init_database()

    def _init_database(self):
        """初始化数据库"""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self):
        """创建数据表"""
        cursor = self.conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_nodes (
                node_id TEXT PRIMARY KEY,
                node_type TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                page_number INTEGER,
                section_path TEXT,
                keywords TEXT,
                parameters TEXT,
                examples TEXT,
                related_nodes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_relations (
                relation_id TEXT PRIMARY KEY,
                source_id TEXT,
                target_id TEXT,
                relation_type TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES knowledge_nodes(node_id),
                FOREIGN KEY (target_id) REFERENCES knowledge_nodes(node_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_queries (
                query_id TEXT PRIMARY KEY,
                query_text TEXT NOT NULL,
                expected_answer TEXT,
                related_nodes TEXT,
                category TEXT,
                difficulty TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_results (
                result_id TEXT PRIMARY KEY,
                query_id TEXT,
                llm_reply TEXT,
                score INTEGER,
                score_reason TEXT,
                is_correct BOOLEAN,
                test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (query_id) REFERENCES test_queries(query_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_metadata (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_nodes_type ON knowledge_nodes(node_type)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_nodes_section ON knowledge_nodes(section_path)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_relations_source ON knowledge_relations(source_id)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_relations_target ON knowledge_relations(target_id)
        """)

        self.conn.commit()

    def save_knowledge_base(self, knowledge_data: Dict):
        """保存知识库数据"""
        cursor = self.conn.cursor()

        metadata = knowledge_data.get('metadata', {})
        cursor.execute("""
            INSERT OR REPLACE INTO knowledge_metadata (key, value, updated_at)
            VALUES (?, ?, ?)
        """, ('knowledge_base_info', json.dumps(metadata, ensure_ascii=False), datetime.now()))

        for node_data in knowledge_data.get('nodes', []):
            cursor.execute("""
                INSERT OR REPLACE INTO knowledge_nodes
                (node_id, node_type, title, content, page_number, section_path,
                 keywords, parameters, examples, related_nodes, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                node_data['node_id'],
                node_data['node_type'],
                node_data['title'],
                node_data['content'],
                node_data['page_number'],
                node_data['section_path'],
                json.dumps(node_data.get('keywords', []), ensure_ascii=False),
                json.dumps(node_data.get('parameters', {}), ensure_ascii=False),
                json.dumps(node_data.get('examples', []), ensure_ascii=False),
                json.dumps(node_data.get('related_nodes', []), ensure_ascii=False),
                datetime.now()
            ))

        for rel_data in knowledge_data.get('relations', []):
            cursor.execute("""
                INSERT OR REPLACE INTO knowledge_relations
                (relation_id, source_id, target_id, relation_type, description)
                VALUES (?, ?, ?, ?, ?)
            """, (
                rel_data['relation_id'],
                rel_data['source_id'],
                rel_data['target_id'],
                rel_data['relation_type'],
                rel_data['description']
            ))

        self.conn.commit()
        print(f"✓ 知识库已保存至数据库: {self.db_path}")
        print(f"  - 节点数: {len(knowledge_data.get('nodes', []))}")
        print(f"  - 关系数: {len(knowledge_data.get('relations', []))}")

    def get_node(self, node_id: str) -> Optional[Dict]:
        """获取单个知识节点"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM knowledge_nodes WHERE node_id = ?", (node_id,))
        row = cursor.fetchone()

        if row:
            return dict(row)
        return None

    def get_nodes_by_type(self, node_type: str) -> List[Dict]:
        """按类型获取知识节点"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM knowledge_nodes WHERE node_type = ?", (node_type,))
        return [dict(row) for row in cursor.fetchall()]

    def get_nodes_by_section(self, section_path: str) -> List[Dict]:
        """按章节获取知识节点"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM knowledge_nodes
            WHERE section_path LIKE ?
            ORDER BY section_path
        """, (f"{section_path}%",))
        return [dict(row) for row in cursor.fetchall()]

    def search_nodes(self, keyword: str) -> List[Dict]:
        """搜索知识节点"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM knowledge_nodes
            WHERE title LIKE ?
               OR content LIKE ?
               OR keywords LIKE ?
            ORDER BY updated_at DESC
        """, (f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"))
        return [dict(row) for row in cursor.fetchall()]

    def get_related_nodes(self, node_id: str) -> List[Dict]:
        """获取相关节点"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT target_id FROM knowledge_relations
            WHERE source_id = ?
            UNION
            SELECT source_id FROM knowledge_relations
            WHERE target_id = ?
        """, (node_id, node_id))

        related_ids = [row[0] for row in cursor.fetchall()]
        related_nodes = []

        for related_id in related_ids:
            node = self.get_node(related_id)
            if node:
                related_nodes.append(node)

        return related_nodes

    def save_query(self, query_id: str, query_text: str, expected_answer: str,
                   related_nodes: List[str], category: str = '', difficulty: str = 'medium',
                   tags: List[str] = None):
        """保存测试查询"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO test_queries
            (query_id, query_text, expected_answer, related_nodes, category, difficulty, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            query_id,
            query_text,
            expected_answer,
            json.dumps(related_nodes, ensure_ascii=False),
            category,
            difficulty,
            json.dumps(tags or [], ensure_ascii=False)
        ))
        self.conn.commit()

    def get_queries(self, category: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """获取测试查询"""
        cursor = self.conn.cursor()

        if category:
            cursor.execute("""
                SELECT * FROM test_queries
                WHERE category = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (category, limit))
        else:
            cursor.execute("""
                SELECT * FROM test_queries
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))

        return [dict(row) for row in cursor.fetchall()]

    def save_test_result(self, result_id: str, query_id: str, llm_reply: str,
                         score: int, score_reason: str, is_correct: bool):
        """保存测试结果"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO test_results
            (result_id, query_id, llm_reply, score, score_reason, is_correct)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (result_id, query_id, llm_reply, score, score_reason, is_correct))
        self.conn.commit()

    def get_test_results(self, start_date: Optional[str] = None,
                        end_date: Optional[str] = None) -> List[Dict]:
        """获取测试结果"""
        cursor = self.conn.cursor()

        query = """
            SELECT tr.*, tq.query_text, tq.expected_answer
            FROM test_results tr
            JOIN test_queries tq ON tr.query_id = tq.query_id
        """
        params = []

        if start_date and end_date:
            query += " WHERE tr.test_date BETWEEN ? AND ?"
            params = [start_date, end_date]

        query += " ORDER BY tr.test_date DESC"

        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    def get_statistics(self) -> Dict:
        """获取统计信息"""
        cursor = self.conn.cursor()

        cursor.execute("SELECT COUNT(*) as count FROM knowledge_nodes")
        total_nodes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) as count FROM knowledge_relations")
        total_relations = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) as count FROM test_queries")
        total_queries = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) as count FROM test_results")
        total_results = cursor.fetchone()[0]

        cursor.execute("""
            SELECT AVG(score) as avg_score
            FROM test_results
        """)
        avg_score = cursor.fetchone()[0] or 0

        cursor.execute("""
            SELECT score, COUNT(*) as count
            FROM test_results
            GROUP BY score
        """)
        score_distribution = {row[0]: row[1] for row in cursor.fetchall()}

        return {
            'total_nodes': total_nodes,
            'total_relations': total_relations,
            'total_queries': total_queries,
            'total_results': total_results,
            'average_score': round(avg_score, 2),
            'score_distribution': score_distribution
        }

    def export_to_excel(self, output_path: str, include_queries: bool = True,
                       include_results: bool = True):
        """导出到Excel"""
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            nodes_df = pd.read_sql_query("SELECT * FROM knowledge_nodes", self.conn)
            nodes_df.to_excel(writer, sheet_name='知识节点', index=False)

            if include_queries:
                queries_df = pd.read_sql_query("SELECT * FROM test_queries", self.conn)
                queries_df.to_excel(writer, sheet_name='测试查询', index=False)

            if include_results:
                results_df = pd.read_sql_query("""
                    SELECT tr.*, tq.query_text, tq.expected_answer
                    FROM test_results tr
                    JOIN test_queries tq ON tr.query_id = tq.query_id
                """, self.conn)
                results_df.to_excel(writer, sheet_name='测试结果', index=False)

        print(f"✓ 数据已导出至: {output_path}")

    def close(self):
        """关闭数据库连接"""
        if self.conn:
            self.conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def main():
    """测试函数"""
    db_path = "test_knowledge_base.db"

    if os.path.exists(db_path):
        os.remove(db_path)

    db = KnowledgeBaseDB(db_path)

    sample_knowledge = {
        'metadata': {
            'total_nodes': 3,
            'total_relations': 2,
            'source': 'test'
        },
        'nodes': [
            {
                'node_id': 'KB_0001',
                'node_type': 'function',
                'title': '空调温度调节',
                'content': '通过中控屏幕调节空调温度',
                'page_number': 10,
                'section_path': '3.1',
                'keywords': ['空调', '温度', '调节'],
                'parameters': {'温度范围': '16-30℃'},
                'examples': ['示例：将温度调至24度'],
                'related_nodes': ['KB_0002']
            },
            {
                'node_id': 'KB_0002',
                'node_type': 'setting',
                'title': '座椅加热',
                'content': '座椅加热功能设置',
                'page_number': 15,
                'section_path': '3.2',
                'keywords': ['座椅', '加热'],
                'parameters': {'档位': '1-3档'},
                'examples': [],
                'related_nodes': ['KB_0001']
            },
            {
                'node_id': 'KB_0003',
                'node_type': 'operation',
                'title': '启动车辆',
                'content': '如何启动车辆',
                'page_number': 5,
                'section_path': '2.1',
                'keywords': ['启动', '车辆'],
                'parameters': {},
                'examples': ['踩下刹车，按下启动键'],
                'related_nodes': []
            }
        ],
        'relations': [
            {
                'relation_id': 'REL_0001',
                'source_id': 'KB_0001',
                'target_id': 'KB_0002',
                'relation_type': 'related_to',
                'description': '共享关键词: 空调'
            }
        ]
    }

    db.save_knowledge_base(sample_knowledge)

    print("\n=== 测试查询 ===")
    db.save_query(
        query_id='Q_0001',
        query_text='如何调节空调温度？',
        expected_answer='通过中控屏幕调节空调温度，范围16-30℃',
        related_nodes=['KB_0001'],
        category='空调',
        difficulty='easy',
        tags=['空调', '温度']
    )

    queries = db.get_queries()
    print(f"查询数量: {len(queries)}")

    stats = db.get_statistics()
    print(f"\n统计信息: {stats}")

    db.export_to_excel("knowledge_base_export.xlsx")
    db.close()

    print("\n✓ 测试完成！")


if __name__ == "__main__":
    main()
