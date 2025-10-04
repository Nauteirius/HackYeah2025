from pydantic import BasicModel
from typing import List, Optional, Dict, Any

class AnalysisResult(BasicModel):
    version: str
    summary: str
    likelihood_score: float
    confidence: float
    rationale: str
    key_claims: List[Dict[str, Any]]
    detected_tactics: List[str]
    risk_factors: List[str]
    recommended_checks: List[str]
    safety_notes: List[str]
    raw_text: Optional[str] = (
        None  # the raw JSON text from the model (for logging/debug)
    )