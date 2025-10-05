from datetime import datetime
from operator import ifloordiv
from typing import Optional, Dict, Any

from bson import ObjectId
from bson.json_util import dumps
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.results import InsertOneResult

MONGODB_URI: str = "mongodb+srv://hackyeah:TFN1W2hLUO5QJsij@cluster0.ycuws9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_DB: str = "hackyeah"

client: MongoClient = MongoClient(MONGODB_URI)
db: Database = client[MONGODB_DB]
articles: Collection = db["Articles"]
comments: Collection = db["Comments"]
authors: Collection = db["Authors"]


def save_article(author_id: ObjectId, content: str, review: Dict[str, Any], timestamp: datetime) -> ObjectId:
    doc: Dict[str, Any] = {
        "author_id": author_id,
        "content": content,
        "summary": review["summary"] if "summary" in review else "",
        "likelihood_score": review["combined_likelihood_score"] if "combined_likelihood_score" in review else 0.0,
        "confidence": review["confidence"] if "confidence" in review else 0.0,
        "rationale": review["rationale"] if "rationale" in review else "",
        "key_claims": review["key_claims"] if "key_claims" in review else [],
        "detected_tactics": review["detected_tactics"] if "detected_tactics" in review else [],
        "risk_factors": review["risk_factors"] if "risk_factors" in review else [],
        "recommended_checks": review["recommended_checks"] if "recommended_checks" in review else [],
        "safety_notes": review["safety_notes"] if "safety_notes" in review else [],
        "timestamp": timestamp
    }
    result: InsertOneResult = articles.insert_one(doc)
    return result.inserted_id


def get_articles() -> str:
    return dumps(articles.find())


def get_article(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return articles.find_one({"_id": _id})


def get_articles_author_reviews(author_id: ObjectId) -> list[Dict[str, Any]]:
    return list(articles.find({"author_id": author_id}, {"score": 1, "_id": 0}))


def save_comment(author_id: ObjectId, content: str, review: Dict[str, Any], timestamp: datetime) -> ObjectId:
    doc: Dict[str, Any] = {
        "author_id": author_id,
        "content": content,
        "summary": review["summary"] if "summary" in review else "",
        "risk_score": review["risk_score"] if "risk_score" in review else 0.0,
        "confidence": review["confidence"] if "confidence" in review else 0.0,
        "rationale": review["rationale"] if "rationale" in review else "",
        "indicators": review["indicators"] if "indicators" in review else [],
        "bot_likelihood": review["bot_likelihood"] if "bot_likelihood" in review else 0.0,
        "troll_likelihood": review["troll_likelihood"] if "troll_likelihood" in review else 0.0,
        "coordination_signals": review["coordination_signals"] if "coordination_signals" in review else [],
        "language_markers": review["language_markers"] if "language_markers" in review else [],
        "recommended_actions": review["recommended_actions"] if "recommended_actions" in review else [],
        "safety_notes": review["safety_notes"] if "safety_notes" in review else [],
        "timestamp": timestamp
    }
    result: InsertOneResult = comments.insert_one(doc)
    return result.inserted_id


def get_comments() -> str:
    return dumps(comments.find())


def get_comment(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return comments.find_one({"_id": _id})


def get_comments_author_reviews(author_id: ObjectId) -> list[Dict[str, Any]]:
    return list(comments.find({"author_id": author_id}, {"score": 1, "_id": 0}))


def save_author(author: str, score: float) -> ObjectId:
    doc: Dict[str, Any] = {
        "name": author,
        "score": score,
    }
    result: InsertOneResult = authors.insert_one(doc)
    return result.inserted_id


def get_authors() -> str:
    return dumps(authors.find().sort("score", -1))


def get_author_by_id(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return authors.find_one({"_id": _id})


def get_author_by_name(name: str) -> Optional[Dict[str, Any]]:
    return authors.find_one({"name": name})
