"""
车书MD文件解析与知识提取模块
专门处理已切片的MD格式车书文件
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field, asdict
from collections import defaultdict
import hashlib


@dataclass
class MDKnowledgeNode:
    """MD文件知识节点"""
    node_id: str
    file_path: str
    file_name: str
    title: str
    content_type: str  # warning/note/tip/normal/image
    content: str
    level: int  # 标题级别
    section_path: str  # 章节路径，如 "1.1"
    keywords: List[str] = field(default_factory=list)
    parameters: Dict[str, str] = field(default_factory=dict)
    related_images: List[str] = field(default_factory=list)  # 图片URL列表
    related_nodes: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        result = asdict(self)
        result['node_type'] = result.pop('content_type')
        result['page_number'] = int(self.section_path) if self.section_path.isdigit() else 0
        result['parameters'] = json.dumps(self.parameters, ensure_ascii=False)
        result['examples'] = json.dumps(self.examples, ensure_ascii=False)
        result['related_nodes'] = json.dumps(self.related_nodes, ensure_ascii=False)
        return result

    @classmethod
    def from_dict(cls, data: dict) -> 'MDKnowledgeNode':
        return cls(**data)


class CarBookMDExtractor:
    """车书MD文件提取器"""

    def __init__(self, md_folder_path: str):
        self.md_folder = Path(md_folder_path)
        self.md_files = []
        self.all_nodes = []
        self.section_index = defaultdict(list)

    def discover_md_files(self) -> List[Path]:
        """发现所有MD文件"""
        if not self.md_folder.exists():
            raise FileNotFoundError(f"文件夹不存在: {self.md_folder}")

        md_files = list(self.md_folder.glob("*.md"))
        self.md_files = sorted(md_files)

        print(f"✓ 发现 {len(self.md_files)} 个MD文件")
        return self.md_files

    def parse_filename(self, filename: str) -> Dict:
        """解析文件名，提取章节信息"""
        name = filename.replace('.md', '')

        if name.startswith('V540-'):
            parts = name.split('-', 3)
            if len(parts) >= 4:
                section_num = parts[1]
                category = parts[2]
                title = parts[3]
                doc_type = 'v540'
            else:
                section_num = parts[1] if len(parts) > 1 else '0'
                category = 'unknown'
                title = name
                doc_type = 'v540'
        elif name[0:3].isdigit():
            parts = name.split('-', 2)
            section_num = parts[0]
            category = parts[1] if len(parts) > 1 else 'unknown'
            title = parts[2] if len(parts) > 2 else name
            doc_type = 'warning'
        else:
            section_num = '0'
            category = 'general'
            title = name
            doc_type = 'other'

        return {
            'section_num': section_num,
            'category': category,
            'title': title,
            'doc_type': doc_type
        }

    def parse_md_file(self, md_file: Path) -> List[MDKnowledgeNode]:
        """解析单个MD文件"""
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')

        nodes = []
        current_title = ''
        current_level = 0
        node_counter = 1

        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            if stripped.startswith('#'):
                heading_match = re.match(r'^(#{1,6})\s+(.+)$', stripped)
                if heading_match:
                    levels = len(heading_match.group(1))
                    current_title = heading_match.group(2).strip()
                    current_level = levels

                    node_id = f"KB_{md_file.stem}_{node_counter:03d}"
                    keywords = self._extract_keywords(current_title)

                    node = MDKnowledgeNode(
                        node_id=node_id,
                        file_path=str(md_file),
                        file_name=md_file.name,
                        title=current_title,
                        content_type='heading',
                        content=current_title,
                        level=current_level,
                        section_path=self.parse_filename(md_file.name)['section_num'],
                        keywords=keywords
                    )
                    nodes.append(node)
                    self.section_index[current_title].append(node_id)
                    node_counter += 1

                i += 1
                continue

            if stripped.startswith('> **警告**') or stripped.startswith('> **注意**') or stripped.startswith('> **提示**'):
                block_content = self._parse_blockquote(lines, i)
                block_type = 'warning' if '警告' in stripped else 'note' if '注意' in stripped else 'tip'

                node_id = f"KB_{md_file.stem}_{node_counter:03d}"
                keywords = self._extract_keywords(block_content)

                images_in_block = self._extract_image_urls(block_content)

                node = MDKnowledgeNode(
                    node_id=node_id,
                    file_path=str(md_file),
                    file_name=md_file.name,
                    title=current_title or f"无标题-{md_file.stem}",
                    content_type=block_type,
                    content=block_content,
                    level=current_level,
                    section_path=self.parse_filename(md_file.name)['section_num'],
                    keywords=keywords,
                    related_images=images_in_block,
                    warnings=[block_content] if block_type == 'warning' else [],
                    notes=[block_content] if block_type == 'note' else []
                )
                nodes.append(node)
                node_counter += 1

                i += block_content.count('\n') + 1
                continue

            if stripped.startswith('!['):
                image_match = re.search(r'!\[([^\]]*)\]\(([^\)]+)\)', stripped)
                if image_match:
                    alt_text = image_match.group(1)
                    image_url = image_match.group(2)

                    node_id = f"KB_{md_file.stem}_{node_counter:03d}"
                    keywords = self._extract_keywords(alt_text)

                    node = MDKnowledgeNode(
                        node_id=node_id,
                        file_path=str(md_file),
                        file_name=md_file.name,
                        title=current_title or "图片",
                        content_type='image',
                        content=alt_text,
                        level=current_level,
                        section_path=self.parse_filename(md_file.name)['section_num'],
                        keywords=keywords,
                        related_images=[image_url]
                    )
                    nodes.append(node)
                    node_counter += 1

                i += 1
                continue

            if stripped and len(stripped) > 20:
                node_id = f"KB_{md_file.stem}_{node_counter:03d}"
                keywords = self._extract_keywords(stripped)
                images_in_content = self._extract_image_urls(stripped)

                if keywords or images_in_content:
                    node = MDKnowledgeNode(
                        node_id=node_id,
                        file_path=str(md_file),
                        file_name=md_file.name,
                        title=current_title or f"段落-{md_file.stem}",
                        content_type='content',
                        content=stripped,
                        level=current_level,
                        section_path=self.parse_filename(md_file.name)['section_num'],
                        keywords=keywords,
                        related_images=images_in_content
                    )
                    nodes.append(node)
                    node_counter += 1

            i += 1

        return nodes

    def _parse_blockquote(self, lines: List[str], start_idx: int) -> str:
        """解析引用块"""
        content_lines = []
        i = start_idx

        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            if stripped.startswith('>') or stripped == '':
                if stripped.startswith('>'):
                    content_lines.append(stripped[1:].strip())
                elif content_lines and lines[i-1].strip().startswith('>'):
                    content_lines.append('')
                else:
                    break
            else:
                if not stripped or (content_lines and stripped.startswith('-') or stripped.startswith('*')):
                    content_lines.append(line)
                else:
                    break

            i += 1

        return '\n'.join(content_lines).strip()

    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        keywords = []

        chinese_terms = re.findall(r'[\u4e00-\u9fa5]{2,6}', text)
        keywords.extend(chinese_terms[:15])

        numbers_with_unit = re.findall(r'\d+(?:[.,]\d+)?\s*(?:km|kW|kWh|km/h|%|℃|度|升|L|米|m|秒|s|分钟|min|小时|h)', text)
        keywords.extend(numbers_with_unit[:10])

        return list(set(keywords))

    def _extract_image_urls(self, text: str) -> List[str]:
        """提取图片URL"""
        image_pattern = r'!\[([^\]]*)\]\(([^\)]+)\)|(https?://[^\s<>"{}|\\^`\[\]]+\.(?:jpg|jpeg|png|gif|webp))'
        matches = re.findall(image_pattern, text)

        urls = []
        for match in matches:
            if match[1]:
                urls.append(match[1])
            if match[2]:
                urls.append(match[2])

        return urls

    def parse_all_files(self) -> List[MDKnowledgeNode]:
        """解析所有MD文件"""
        if not self.md_files:
            self.discover_md_files()

        all_nodes = []

        print("\n开始解析MD文件...")
        for i, md_file in enumerate(self.md_files, 1):
            if i % 50 == 0:
                print(f"  已解析 {i}/{len(self.md_files)} 个文件...")

            try:
                nodes = self.parse_md_file(md_file)
                all_nodes.extend(nodes)
            except Exception as e:
                print(f"  ✗ 解析失败 {md_file.name}: {e}")

        self.all_nodes = all_nodes
        print(f"✓ 解析完成，共提取 {len(all_nodes)} 个知识节点")

        return all_nodes

    def build_knowledge_base(self) -> Dict:
        """构建完整知识库"""
        if not self.all_nodes:
            self.parse_all_files()

        print("\n构建知识库...")

        knowledge_base = {
            'metadata': {
                'source': 'v540_md_files',
                'total_files': len(self.md_files),
                'total_nodes': len(self.all_nodes),
                'categories': self._count_categories(),
                'content_types': self._count_content_types()
            },
            'nodes': [node.to_dict() for node in self.all_nodes],
            'categories': self._build_category_index(),
            'images': self._extract_all_images()
        }

        print("✓ 知识库构建完成")
        return knowledge_base

    def _count_categories(self) -> Dict[str, int]:
        """统计分类"""
        categories = defaultdict(int)
        for node in self.all_nodes:
            filename_info = self.parse_filename(node.file_name)
            categories[filename_info['category']] += 1
        return dict(categories)

    def _count_content_types(self) -> Dict[str, int]:
        """统计内容类型"""
        types = defaultdict(int)
        for node in self.all_nodes:
            types[node.content_type] += 1
        return dict(types)

    def _build_category_index(self) -> Dict:
        """构建分类索引"""
        categories = defaultdict(list)

        for node in self.all_nodes:
            filename_info = self.parse_filename(node.file_name)
            category = filename_info['category']

            categories[category].append({
                'node_id': node.node_id,
                'title': node.title,
                'file_name': node.file_name,
                'section': filename_info['section_num']
            })

        return dict(categories)

    def _extract_all_images(self) -> List[Dict]:
        """提取所有图片"""
        images = []

        for node in self.all_nodes:
            for img_url in node.related_images:
                images.append({
                    'url': img_url,
                    'node_id': node.node_id,
                    'title': node.title,
                    'file_name': node.file_name
                })

        return images

    def export_to_json(self, output_path: str):
        """导出到JSON"""
        knowledge_base = self.build_knowledge_base()

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, ensure_ascii=False, indent=2)

        print(f"✓ 知识库已导出至: {output_path}")
        return knowledge_base


def extract_knowledge_from_md(md_folder: str, output_json: Optional[str] = None) -> Dict:
    """从MD文件夹提取知识的便捷函数"""
    extractor = CarBookMDExtractor(md_folder)
    extractor.discover_md_files()
    extractor.parse_all_files()
    knowledge_base = extractor.build_knowledge_base()

    if output_json:
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        print(f"✓ 知识库已保存至: {output_json}")

    return knowledge_base


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法: python md_extractor.py <md_folder_path> [output_json]")
        sys.exit(1)

    md_folder = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    extract_knowledge_from_md(md_folder, output_path)
