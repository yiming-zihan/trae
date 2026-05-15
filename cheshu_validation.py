#!/usr/bin/env python3
import pandas as pd
import re
import json
from pathlib import Path
from collections import Counter

try:
    from PyPDF2 import PdfReader
except ImportError:
    print("请安装PyPDF2: pip install PyPDF2")
    exit(1)

EXCEL_PATH = "/Users/bytedance/Downloads/LLM_master/benzV540全量车书20260507155546测试结果.xlsx"
CAR_BOOK_PATH = "/Users/bytedance/Downloads/PDF Public (DIN A4 quer), Edition of DIBA 540.1 NA2026-06a IP_DIBA CN MA-CN HU-CN Gen20x.i3 PremPlusPlus, 1, zh_CN.pdf"
OUTPUT_REPORT_PATH = "/Users/bytedance/Desktop/trae/车书验证报告_自动打分.xlsx"


def load_car_book(pdf_path):
    """提取PDF车书文本内容"""
    print(f"正在加载车书PDF: {pdf_path}")
    reader = PdfReader(pdf_path)
    text_content = []
    page_texts = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            text_content.append(text)
            page_texts.append({"page": i + 1, "text": text})
    full_text = "\n".join(text_content)
    print(f"车书加载完成，共 {len(reader.pages)} 页，约 {len(full_text)} 字符")
    return full_text, page_texts


def split_into_sentences(text):
    """将文本分割成句子"""
    sentences = re.split(r'[。！？；\n]', text)
    return [s.strip() for s in sentences if s.strip()]


def extract_keywords_from_text(text):
    """提取文本中的关键信息（数字、专业术语）"""
    numbers = re.findall(r'[\d.,]+[km/%/kW/kWh/公里/千米/升/度/年/月/秒/分钟/h/km/h]+', text)
    technical_terms = re.findall(r'[\u4e00-\u9fa5]{2,}(?:模式|功能|系统|设置|按钮|开关|指示灯|传感器|控制器)', text)
    return list(set(numbers + technical_terms))


def extract_image_links(text):
    """提取文本中的图片链接"""
    image_pattern = r'!\[.*?\]\((https?://[^\)]+)\)'
    links = re.findall(image_pattern, text)
    return links


def analyze_image_relevance(image_links, query, car_book_text):
    """分析图片链接与Query和车书的相关性"""
    if not image_links:
        return 0, "无图片链接"

    valid_image_count = 0
    for link in image_links:
        if "benz/v540" in link.lower():
            valid_image_count += 1

    if valid_image_count == len(image_links):
        keywords_in_query = re.findall(r'[\u4e00-\u9fa5]{2,}', query)
        has_related_content = any(kw in car_book_text for kw in keywords_in_query[:3])
        if has_related_content:
            return 1.0, f"图片链接有效（{len(image_links)}个），与Query相关"
        return 0.8, f"图片链接有效（{len(image_links)}个），但内容相关性需确认"
    else:
        return 0.5, f"部分图片链接不匹配车书版本（有效:{valid_image_count}/{len(image_links)}）"


def calculate_similarity(text1, text2):
    """计算两个文本的相似度"""
    if not text1 or not text2:
        return 0.0

    text1_clean = re.sub(r'\s+', '', text1)
    text2_clean = re.sub(r'\s+', '', text2)

    if len(text1_clean) == 0 or len(text2_clean) == 0:
        return 0.0

    common_chars = set(text1_clean) & set(text2_clean)
    all_chars = set(text1_clean) | set(text2_clean)

    return len(common_chars) / len(all_chars) if all_chars else 0.0


def find_relevant_content(query, car_book_text):
    """根据Query在车书中查找相关内容"""
    keywords = re.findall(r'[\u4e00-\u9fa5]{2,}', query)
    relevant_sentences = []
    all_sentences = split_into_sentences(car_book_text)

    for sentence in all_sentences:
        for keyword in keywords:
            if keyword in sentence and len(sentence) > 10:
                relevant_sentences.append(sentence)
                break

    if not relevant_sentences:
        for sentence in all_sentences[:100]:
            similarity = calculate_similarity(query, sentence)
            if similarity > 0.3:
                relevant_sentences.append(sentence)

    return relevant_sentences[:5]


def score_reply(query, reply, car_book_text):
    """
    对回复进行1-4分打分（认可整合分析结果，包含图片链接验证）：
    1分：回复与车书完全不相关或存在明显错误
    2分：回复部分正确，但有明显错误或遗漏关键信息
    3分：回复基本正确，整合分析合理，语义与车书一致
    4分：回复完全正确，整合分析优秀，准确完整
    """
    if not reply or str(reply).strip() == '' or str(reply).lower() == 'nan':
        return 1, "无回复内容", "无图片"

    reply_text = str(reply).strip()
    
    image_links = extract_image_links(reply_text)
    image_score, image_comment = analyze_image_relevance(image_links, query, car_book_text)

    text_content = re.sub(r'!\[.*?\]\([^\)]+\)', '', reply_text).strip()

    relevant_content = find_relevant_content(query, car_book_text)

    if not relevant_content:
        keywords_in_query = re.findall(r'[\u4e00-\u9fa5]{2,}', query)
        has_any_match = any(kw in car_book_text for kw in keywords_in_query[:3])

        if not has_any_match:
            return 2, f"车书中未找到与Query直接相关的内容（{len(keywords_in_query)}个关键词），无法完全验证", image_comment

        if image_score > 0.5:
            return 3, f"车书内容检索受限，但图片链接有效", image_comment
        return 3, "车书内容检索受限，但基础匹配通过", image_comment

    reply_keywords = extract_keywords_from_text(text_content)
    car_book_keywords = []
    for content in relevant_content:
        car_book_keywords.extend(extract_keywords_from_text(content))
    car_book_keywords = list(set(car_book_keywords))

    matched_keywords = []
    for r_kw in reply_keywords:
        for c_kw in car_book_keywords:
            if r_kw in c_kw or c_kw in r_kw:
                matched_keywords.append(r_kw)
                break

    match_ratio = len(matched_keywords) / len(reply_keywords) if reply_keywords else 0

    text_similarities = []
    for content in relevant_content:
        sim = calculate_similarity(text_content, content)
        text_similarities.append(sim)

    best_similarity = max(text_similarities) if text_similarities else 0

    semantic_score = match_ratio * 0.6 + best_similarity * 0.4
    
    combined_score = semantic_score * 0.7 + image_score * 0.3

    if combined_score >= 0.75:
        if semantic_score >= 0.85:
            return 4, f"回复优秀：整合分析准确，与车书高度一致（关键词匹配:{len(matched_keywords)}/{len(reply_keywords)}, 综合得分:{combined_score:.2f}）", image_comment
        else:
            return 3, f"回复良好：整合分析合理，语义与车书一致（关键词匹配:{len(matched_keywords)}/{len(reply_keywords)}, 综合得分:{combined_score:.2f}）", image_comment
    elif combined_score >= 0.5:
        return 2, f"回复一般：部分内容正确，但存在差异或遗漏（关键词匹配:{len(matched_keywords)}/{len(reply_keywords)}, 综合得分:{combined_score:.2f}）", image_comment
    elif combined_score >= 0.25:
        return 2, f"回复较差：与车书关联性低，可能存在错误（综合得分:{combined_score:.2f}）", image_comment
    else:
        return 1, f"回复不合格：与车书内容严重不符或完全不相关（综合得分:{combined_score:.2f}）", image_comment


def main():
    print("=" * 60)
    print("奔驰车书验证工具 - 自动打分系统（含图片链接验证）")
    print("=" * 60)

    print("\n[步骤1] 加载车书PDF...")
    car_book_text, _ = load_car_book(CAR_BOOK_PATH)

    print("\n[步骤2] 读取Excel测试数据...")
    df = pd.read_excel(EXCEL_PATH)
    print(f"读取到 {len(df)} 条测试记录")

    results = []
    query_col = df.columns[3]
    reply_col = df.columns[12]
    print(f"使用列: Query列={query_col}, LLM回复列={reply_col}")

    print("\n[步骤3] 开始逐条验证和打分...")
    for idx, row in df.iterrows():
        query = str(row.get(query_col, ''))
        reply = row.get(reply_col, '')

        if query == 'nan' or query.strip() == '':
            continue

        score, reason, image_status = score_reply(query, reply, car_book_text)

        result = {
            '序号': idx + 1,
            'Query': query,
            '实际LLM回复': str(reply) if pd.notna(reply) else '',
            '打分结果': score,
            '评分理由': reason,
            '图片链接状态': image_status,
            '分类': row.get('分类', ''),
            '车型': row.get('车型', '')
        }
        results.append(result)

        if (idx + 1) % 100 == 0:
            print(f"  已处理 {idx + 1}/{len(df)} 条记录...")

    print(f"\n共完成 {len(results)} 条记录的打分")

    results_df = pd.DataFrame(results)

    print("\n[步骤4] 生成统计报告...")
    score_distribution = results_df['打分结果'].value_counts().sort_index()
    print("\n打分分布：")
    for score, count in score_distribution.items():
        percentage = count / len(results_df) * 100
        print(f"  {score}分: {count}条 ({percentage:.1f}%)")

    image_count = sum(1 for r in results if "图片链接有效" in r['图片链接状态'])
    print(f"\n图片链接统计：")
    print(f"  包含有效图片链接的回复: {image_count}条 ({image_count/len(results)*100:.1f}%)")

    print("\n[步骤5] 保存报告...")
    results_df.to_excel(OUTPUT_REPORT_PATH, index=False)
    print(f"报告已保存至: {OUTPUT_REPORT_PATH}")

    print("\n" + "=" * 60)
    print("验证完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()