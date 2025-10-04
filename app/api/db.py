from typing import Optional, Dict, Any, List

from bson import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.results import InsertOneResult

MONGODB_URI: str = "mongodb+srv://hackyeah:dKdRlzvWhJN941pi@cluster0.ycuws9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_DB: str = "hackyeah"

client: MongoClient = MongoClient(MONGODB_URI)
db: Database = client[MONGODB_DB]
articles: Collection = db["Articles"]
comments: Collection = db["Comments"]
authors: Collection = db["Authors"]


def save_article(author: Dict[str, Any], content: str, review: Dict[str, Any]) -> ObjectId:
    doc: Dict[str, Any] = {
        "author_id": author["id"],
        "content": content,
        "summary": review["summary"],
        "likelihood_score": review["likelihood_score"],
        "confidence": review["confidence"],
        "rationale": review["rationale"],
        "key_claims": review["key_claims"],
        "detected_tactics": review["detected_tactics"],
        "risk_factors": review["risk_factors"],
        "recommended_checks": review["recommended_checks"],
        "safety_notes": review["safety_notes"],
    }
    result: InsertOneResult = articles.insert_one(doc)
    return result.inserted_id


def get_article(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return articles.find_one({"_id": _id})


def save_comment(author: Dict[str, Any], content: str, review: Dict[str, Any]) -> ObjectId:
    doc: Dict[str, Any] = {
        "author_id": author["id"],
        "content": content,
        "summary": review["summary"],
        "risk_score": review["risk_score"],
        "confidence": review["confidence"],
        "rationale": review["rationale"],
        "indicators": review["indicators"],
        "bot_likelihood": review["bot_likelihood"],
        "troll_likelihood": review["troll_likelihood"],
        "coordination_signals": review["coordination_signals"],
        "language_markers": review["language_markers"],
        "recommended_actions": review["recommended_actions"],
        "safety_notes": review["safety_notes"],
    }
    result: InsertOneResult = comments.insert_one(doc)
    return result.inserted_id


def get_comment(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return comments.find_one({"_id": _id})


def save_author(author: Dict[str, Any]) -> ObjectId:
    doc: Dict[str, Any] = {
        "name": author["name"],
        "score": author["score"],
    }
    result: InsertOneResult = authors.insert_one(doc)
    return result.inserted_id


def get_author_by_id(_id: ObjectId) -> Optional[Dict[str, Any]]:
    return authors.find_one({"_id": _id})


def get_author_by_name(name: str) -> Optional[Dict[str, Any]]:
    return authors.find_one({"name": name})
