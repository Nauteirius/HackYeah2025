import random
from datetime import datetime, timedelta
from typing import Dict, Any

from app.api.db import save_article


def generate_random_content() -> str:
    topics = ["politics", "technology", "science", "health", "environment"]
    verbs = ["announces", "reveals", "claims", "reports", "suggests"]
    return f"Breaking news: {random.choice(topics)} sector {random.choice(verbs)} major developments"


def generate_mock_review() -> Dict[str, Any]:
    return {
        "summary": "Generated test article",
        "likelihood_score": random.uniform(0.1, 0.9),
        "confidence": random.uniform(0.3, 0.95),
        "rationale": "Test rationale",
        "key_claims": [{"claim": "Test claim", "verdict": "supported", "evidence": ["Test evidence"]}],
        "detected_tactics": ["test tactic"],
        "risk_factors": ["test risk"],
        "recommended_checks": ["verify sources"],
        "safety_notes": ["test note"]
    }


def generate_mock_author() -> Dict[str, Any]:
    return {
        "id": str(random.randint(1000, 9999)),
        "name": f"Author_{random.randint(1, 100)}"
    }


def generate_test_data(num_records: int = 100) -> None:
    base_time = datetime.now() - timedelta(days=30)
    peak_times = [
        base_time + timedelta(days=7),
        base_time + timedelta(days=14),
        base_time + timedelta(days=21)
    ]

    for _ in range(num_records):
        author = generate_mock_author()
        content = generate_random_content()
        review = generate_mock_review()

        # Generate timestamp with peaks
        if random.random() < 0.3:  # 30% chance of peak
            timestamp = random.choice(peak_times) + timedelta(
                hours=random.randint(-12, 12),
                minutes=random.randint(0, 59)
            )
        else:
            timestamp = base_time + timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )

        save_article(author, content, review, timestamp)


generate_test_data()
