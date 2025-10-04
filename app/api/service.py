from typing import Any, Dict, Optional

from bson import ObjectId

from app.api.db import save_author, get_author_by_id, get_author_by_name, save_article, get_article
from datetime import datetime


def get_or_save_author(author_name: str) -> Dict[str, Any]:
    author: Optional[Dict[str, Any]] = get_author_by_name(author_name)
    if author is None:
        author_to_save: Dict[str, Any] = {
            'name': author_name,
            'score': None,
        }
        author_id: ObjectId = save_author(author_to_save)
        author = get_author_by_id(author_id)
    return author


def create_review(author: Dict[str, Any], content: str) -> Dict[str, Any]:
    return {
        "version": "1.0",
        "summary": "",
        "likelihood_score": 0.0,
        "confidence": 0.0,
        "rationale": "",
        "key_claims": [
            {"claim": "", "verdict": "supported|disputed|unverifiable", "evidence": [""]}
        ],
        "detected_tactics": [],
        "risk_factors": [],
        "recommended_checks": [
            "Cross-check with wire services (AP, Reuters, AFP) and NATO/UN press rooms"
        ],
        "safety_notes": []
    }


def calculate_author_score(author: Dict[str, Any], review: Dict[str, Any]) -> float:
    return 1.0


def handle_text(text: Dict[str, str]) -> Optional[Dict[str, Any]]:
    author: Dict[str, Any] = get_or_save_author(text['author_name'])
    review: Dict[str, Any] = create_review(author, text['content'])
    author['score'] = calculate_author_score(author, review)
    save_author(author)
    article_id: ObjectId = save_article(author, text['content'], review, datetime.now())
    return get_article(article_id)


test_text: Dict[str, str] = {
    'author_name': 'Test author',
    'content': 'Test content',
}

test_review: Optional[Dict[str, Any]] = handle_text(test_text)
print(test_review)
