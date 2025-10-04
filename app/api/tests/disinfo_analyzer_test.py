# tests/test_disinfo_analyzer.py
import json
import pytest
from unittest.mock import patch, MagicMock
from disinfo_analyzer import analyze_text, AnalysisResult, _truncate
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# -----------------------
# Utility tests
# -----------------------
def test_truncate_short_text():
    text = "short text"
    assert _truncate(text, 100) == text

def test_truncate_long_text():
    text = "x" * 100
    truncated = _truncate(text, 50)
    assert "[...truncated...]" in truncated
    assert len(truncated) <= 60  # allow for markup


# -----------------------
# Mocked LLM responses
# -----------------------
MOCK_JSON = {
    "version": "1.0",
    "summary": "Example summary",
    "likelihood_score": 0.8,
    "confidence": 0.9,
    "rationale": "Contains multiple unsupported claims.",
    "key_claims": [
        {"claim": "Aliens invaded Earth", "verdict": "disputed", "evidence": ["NASA report"]}
    ],
    "detected_tactics": ["fabrication"],
    "risk_factors": ["Anonymous source"],
    "recommended_checks": ["Check satellite data"],
    "safety_notes": ["Avoid spreading unverified data"]
}


@pytest.fixture
def mock_openai_client(monkeypatch):
    """
    Patch OpenAI client to return deterministic data without real API calls.
    """
    mock_client = MagicMock()

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps(MOCK_JSON)))
    ]
    mock_client.chat.completions.create.return_value = mock_response

    monkeypatch.setattr("disinfo_analyzer.OpenAI", lambda: mock_client)
    return mock_client


# -----------------------
# Core function tests
# -----------------------
def test_analyze_text_returns_valid_result(mock_openai_client):
    result = analyze_text("Some test article about fake claims.")
    assert isinstance(result, AnalysisResult)
    assert 0 <= result.likelihood_score <= 1
    assert result.summary == "Example summary"
    assert "fabrication" in result.detected_tactics
    assert "Avoid spreading unverified data" in result.safety_notes


def test_analyze_text_empty_input_raises():
    with pytest.raises(ValueError):
        analyze_text("   ")


def test_analyze_text_retry_on_error(monkeypatch):
    """
    Simulate transient APIError -> success.
    """
    mock_client = MagicMock()
    # 1. strzał: wyjątek; 2. strzał: OK
    good_response = MagicMock()
    good_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps(MOCK_JSON)))
    ]
    mock_client.chat.completions.create.side_effect = [Exception("oops"), good_response]

    monkeypatch.setattr("disinfo_analyzer.OpenAI", lambda: mock_client)

    result = analyze_text("retry this please")
    assert isinstance(result, AnalysisResult)
    assert result.likelihood_score == MOCK_JSON["likelihood_score"]


def test_analyze_text_parsing_failure(monkeypatch):
    """
    Simulate invalid JSON from model -> raises RuntimeError after retries
    """
    mock_client = MagicMock()
    bad_response = MagicMock()
    bad_response.choices = [MagicMock(message=MagicMock(content="not json at all"))]
    mock_client.chat.completions.create.return_value = bad_response
    monkeypatch.setattr("disinfo_analyzer.OpenAI", lambda: mock_client)

    with pytest.raises(RuntimeError):
        analyze_text("invalid json test")
