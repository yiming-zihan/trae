"""
车辆知识库系统
Car Knowledge Base System
"""

from .knowledge_extractor import (
    CarBookExtractor,
    KnowledgeNode,
    KnowledgeRelation,
    extract_knowledge_from_pdf
)

from .knowledge_storage import KnowledgeBaseDB

from .query_generator import QueryGenerator

from .reply_scorer_v2 import (
    ReplyScorer,
    BatchEvaluator,
    EvaluationResult,
    ImageExtractor,
    ImageInfo
)

from .main import CarKnowledgeSystem

__version__ = "2.0.0"

__all__ = [
    'CarBookExtractor',
    'KnowledgeNode',
    'KnowledgeRelation',
    'extract_knowledge_from_pdf',
    'KnowledgeBaseDB',
    'QueryGenerator',
    'ReplyScorer',
    'BatchEvaluator',
    'EvaluationResult',
    'ImageExtractor',
    'ImageInfo',
    'CarKnowledgeSystem'
]
