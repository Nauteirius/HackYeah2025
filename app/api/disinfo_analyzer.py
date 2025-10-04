# disinfo_analyzer.py
# Minimal dependency: openai>=1.0.0
# Usage:
#   export OPENAI_API_KEY=...
#   from disinfo_analyzer import analyze_text
#   result = analyze_text("your article text")
#   print(result.json(indent=2))

from __future__ import annotations
import os
import time
import json
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("No OPENAI_API_KEY. Add .env or set env variable.")


#from openai import OpenAI, APIError, RateLimitError, APITimeoutError
try:
    from openai import OpenAI, APIError, RateLimitError, APITimeoutError
except Exception:
    OpenAI = None  # pozwala testom lub mockom to nadpisać
    class APIError(Exception): ...
    class RateLimitError(Exception): ...
    class APITimeoutError(Exception): ...
# -----------------------------
# Config
# -----------------------------
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # change to a larger model if you have access
MAX_INPUT_CHARS = 32_000  # simple guardrail to avoid oversized payloads
REQUEST_TIMEOUT = 60  # seconds
MAX_RETRIES = 3
RETRY_BACKOFF_SECS = 2.0


PROMPTS_DIR = os.getenv("PROMPTS_DIR", os.path.join(os.path.dirname(__file__), "prompts"))

def _read_file(path: str) -> Optional[str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return None

def _load_template(profile: str, name: str) -> Optional[str]:
    path = os.path.join(PROMPTS_DIR, profile, name)
    return _read_file(path)

def _render_template(tpl: str, **kwargs) -> str:
    # proste wstawianie {PLACEHOLDER}; jeżeli w tpl są dosłowne { }, użyj {{ i }}
    return tpl.format(**kwargs)

# -----------------------------
# Preprompt / system policy
# -----------------------------
SYSTEM_PREPROMPT = """You are an impartial, evidence-first disinformation risk analyst aligned with democratic values and international law.
Follow these rules:
1) Be non-partisan and avoid ideological judgments; focus on verifiable claims and provenance.
2) Favor primary sources and reputable multi-national outlets. Note when claims are unverified.
3) Identify manipulation tactics (e.g., false attribution, cherry-picking, synthetic media, impersonation, bot amplification).
4) Provide *actionable* verification steps (who to contact, what datasets to check).
5) Respect privacy: do not reveal personal data beyond what is provided.
6) Output strictly in the requested JSON schema. No extra commentary.
7) Calibrate risk realistically: “uncertain” is acceptable if evidence is weak.
8) Consider multilingual nuances and known propaganda patterns.
9) Assume NATO-aligned ethics: transparency, accountability, human rights, and rule of law.
"""

# The model will fill this JSON structure. Keep field names stable for downstream use.
JSON_SCHEMA_EXAMPLE = {
    "version": "1.0",
    "summary": "",
    "likelihood_score": 0.0,         # 0.0 (very unlikely) .. 1.0 (very likely disinformation)
    "confidence": 0.0,               # model's calibration in its own assessment, 0..1
    "rationale": "",
    "key_claims": [
        {"claim": "", "verdict": "supported|disputed|unverifiable", "evidence": [""]},
    ],
    "detected_tactics": [],          # e.g., ["whataboutism","fabricated quote","synthetic image","coordinated amplification"]
    "risk_factors": [],              # short bullet points (source opacity, new domain, etc.)
    "recommended_checks": [          # concrete next steps w/ sources or methods
        "Cross-check with wire services (AP, Reuters, AFP) and NATO/UN press rooms",
    ],
    "safety_notes": []               # any ethical/privacy caveats the user should know
}

JSON_SCHEMA_COMMENTS = {
    "version": "1.0",
    "summary": "",
    "risk_score": 0.0,            # 0..1 overall risk of malign manipulation
    "confidence": 0.0,            # model self-confidence 0..1
    "rationale": "",
    "indicators": [],             # e.g., ["copy-paste slogan","astroturfing","brigading"]
    "bot_likelihood": 0.0,        # 0..1
    "troll_likelihood": 0.0,      # 0..1
    "coordination_signals": [],   # e.g., ["time-clustered posts","reused phrasing across users"]
    "language_markers": [],       # e.g., ["ALL CAPS","slurs","threats"]
    "recommended_actions": [],    # moderation or countermeasures
    "safety_notes": []
}

@dataclass
class CommentAnalysisResult:
    version: str
    summary: str
    risk_score: float
    confidence: float
    rationale: str
    indicators: List[str]
    bot_likelihood: float
    troll_likelihood: float
    coordination_signals: List[str]
    language_markers: List[str]
    recommended_actions: List[str]
    safety_notes: List[str]
    raw_text: Optional[str] = None

    def json(self, **kwargs) -> str:
        return json.dumps(asdict(self), **kwargs)


@dataclass
class AnalysisResult:
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
    raw_text: Optional[str] = None   # the raw JSON text from the model (for logging/debug)

    def json(self, **kwargs) -> str:
        return json.dumps(asdict(self), **kwargs)


def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    marker = "\n\n[...truncated...]\n\n"
    # chcemy: len(head) + len(marker) + len(tail) <= max_chars
    budget = max(max_chars - len(marker), 0)
    head = budget // 2
    tail = budget - head
    return text[:head] + marker + text[-tail:] if budget > 0 else marker.strip()


def _build_user_prompt(article_text: str, want_short: bool = False) -> str:
    task = (
        "Analyze the following text for disinformation risk and produce ONLY the JSON object "
        "conforming to the schema below. Do not include markdown fences or commentary."
    )
    schema = json.dumps(JSON_SCHEMA_EXAMPLE, ensure_ascii=False, indent=2)
    guidance = (
        "Scoring guidance:\n"
        "- 0.0–0.2: Very unlikely disinformation (well-sourced, consistent across reputable outlets)\n"
        "- 0.2–0.4: Unlikely; minor issues or unclear phrasing\n"
        "- 0.4–0.6: Uncertain; notable gaps or unresolved conflicts in sources\n"
        "- 0.6–0.8: Likely; significant red flags or contradictory evidence\n"
        "- 0.8–1.0: Very likely; strong indicators of fabrication or manipulation"
    )
    brevity = "Return concise fields." if want_short else "Be thorough yet concise."

    return f"""{task}


Schema (example, types only; fill with your assessment):
{schema}

{guidance}

{brevity}

--- BEGIN ARTICLE ---
{article_text}
--- END ARTICLE ---
"""



def _build_user_prompt_from_files(
    profile: str,
    text: str,
    *,
    schema: dict,
    brevity: bool,
    context: Optional[str] = None,
) -> (str, str):
    """
    Zwraca (system_prompt, user_prompt) z plików; fallback do wbudowanych jeżeli nie znajdzie.
    """
    system_tpl = _load_template(profile, "system.txt")
    user_tpl = _load_template(profile, "user.txt")

    if system_tpl is None or user_tpl is None:
        # Fallback: użyj dotychczasowych promptów
        if profile == "article":
            system_prompt = SYSTEM_PREPROMPT
            user_prompt = _build_user_prompt(text, want_short=brevity)
        else:
            # Minimalny fallback dla comments
            system_prompt = (
                "You assess user comments for coordinated manipulation, bot/troll signals, "
                "respecting free expression and focusing on behavioral indicators."
            )
            schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
            user_prompt = f"""Return ONLY the JSON object per schema:

Schema:
{schema_str}

Context:
{context or ""}

{ "Return concise fields." if brevity else "Be thorough yet concise." }

--- BEGIN COMMENTS ---
{text}
--- END COMMENTS ---
"""
        return system_prompt, user_prompt

    # render z plików
    schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
    system_prompt = system_tpl  # zwykle bez placeholderów
    user_prompt = _render_template(
        user_tpl,
        SCHEMA=schema_str,
        TEXT=text,
        CONTEXT=(context or ""),
        BREVITY=("Return concise fields." if brevity else "Be thorough yet concise.")
    )
    return system_prompt, user_prompt


def analyze_text(
    article_text: str,
    *,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.2,
    want_short: bool = False,
) -> AnalysisResult:
    """
    Run a disinformation-risk analysis via an LLM and return a structured result.

    Raises:
        RuntimeError if the LLM response cannot be parsed after retries.
    """
    if not isinstance(article_text, str) or not article_text.strip():
        raise ValueError("article_text must be a non-empty string")

    # Light input guard
    article_text = _truncate(article_text.strip(), MAX_INPUT_CHARS)

    if OpenAI is None:
        raise RuntimeError(
            "OpenAI SDK not installed or failed to import. Run `pip install openai` and set OPENAI_API_KEY."
        )
    client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL") or None  # zostaw None dla oficjalnego endpointu
)

    system_prompt, user_prompt = _build_user_prompt_from_files(
        profile="article",
        text=article_text,
        schema=JSON_SCHEMA_EXAMPLE,
        brevity=want_short,
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


    last_err: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):

        try:
            resp = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                timeout=REQUEST_TIMEOUT,
                response_format={"type": "json_object"},  # force valid JSON
            )
        except Exception as e:
            last_err = e
            if attempt >= MAX_RETRIES:
                break
            time.sleep(RETRY_BACKOFF_SECS * attempt)
            continue


        try:
            raw = resp.choices[0].message.content or "{}"
            data = json.loads(raw)
        except Exception as e:
            last_err = e
            if attempt >= MAX_RETRIES:
                break
            time.sleep(RETRY_BACKOFF_SECS * attempt)
            continue


        def _get(k, default):
            return data.get(k, default)

        return AnalysisResult(
            version=str(_get("version", "1.0")),
            summary=str(_get("summary", "")),
            likelihood_score=float(_get("likelihood_score", 0.5)),
            confidence=float(_get("confidence", 0.5)),
            rationale=str(_get("rationale", "")),
            key_claims=list(_get("key_claims", [])),
            detected_tactics=list(_get("detected_tactics", [])),
            risk_factors=list(_get("risk_factors", [])),
            recommended_checks=list(_get("recommended_checks", [])),
            safety_notes=list(_get("safety_notes", [])),
            raw_text=raw,
        )

    raise RuntimeError(f"LLM analysis failed after {MAX_RETRIES} attempts: {last_err}")

def analyze_comments(
    comments_text: str,
    *,
    context: Optional[str] = None,   # np. tytuł posta, platforma, temat
    model: str = DEFAULT_MODEL,
    temperature: float = 0.2,
    want_short: bool = True,
) -> CommentAnalysisResult:
    """
    Analiza komentarzy pod kątem koordynacji/botów/trolli.
    """
    if not isinstance(comments_text, str) or not comments_text.strip():
        raise ValueError("comments_text must be a non-empty string")

    comments_text = _truncate(comments_text.strip(), MAX_INPUT_CHARS)

    if OpenAI is None:
        raise RuntimeError(
            "OpenAI SDK not installed or failed to import. Run `pip install openai` and set OPENAI_API_KEY."
        )

    # prompty z plików (lub fallback)
    system_prompt, user_prompt = _build_user_prompt_from_files(
        profile="comments",
        text=comments_text,
        schema=JSON_SCHEMA_COMMENTS,
        brevity=want_short,
        context=context,
    )

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    last_err: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                timeout=REQUEST_TIMEOUT,
                response_format={"type": "json_object"},
            )
        except Exception as e:
            last_err = e
            if attempt >= MAX_RETRIES:
                break
            time.sleep(RETRY_BACKOFF_SECS * attempt)
            continue

        try:
            raw = resp.choices[0].message.content or "{}"
            data = json.loads(raw)
        except Exception as e:
            last_err = e
            if attempt >= MAX_RETRIES:
                break
            time.sleep(RETRY_BACKOFF_SECS * attempt)
            continue

        def _get(k, default):
            return data.get(k, default)

        return CommentAnalysisResult(
            version=str(_get("version", "1.0")),
            summary=str(_get("summary", "")),
            risk_score=float(_get("risk_score", 0.5)),
            confidence=float(_get("confidence", 0.5)),
            rationale=str(_get("rationale", "")),
            indicators=list(_get("indicators", [])),
            bot_likelihood=float(_get("bot_likelihood", 0.5)),
            troll_likelihood=float(_get("troll_likelihood", 0.5)),
            coordination_signals=list(_get("coordination_signals", [])),
            language_markers=list(_get("language_markers", [])),
            recommended_actions=list(_get("recommended_actions", [])),
            safety_notes=list(_get("safety_notes", [])),
            raw_text=raw,
        )

    raise RuntimeError(f"LLM comment analysis failed after {MAX_RETRIES} attempts: {last_err}")

# -----------------------------
# Simple CLI for quick testing
# -----------------------------
if __name__ == "__main__":
    import argparse, sys

    parser = argparse.ArgumentParser(description="Disinformation & comment integrity analyzer via LLM.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="OpenAI model (default from env or gpt-4o-mini)")
    parser.add_argument("--short", action="store_true", help="Return a shorter analysis")
    parser.add_argument("--mode", choices=["article", "comments"], default="article", help="Select analysis profile")
    parser.add_argument("--context", default=None, help="Optional context for comments mode (post title, platform, topic)")
    parser.add_argument("file", nargs="?", help="Path to a text file to analyze. If omitted, read stdin.")
    args = parser.parse_args()

    text = open(args.file, "r", encoding="utf-8").read() if args.file else sys.stdin.read()

    if args.mode == "comments":
        result = analyze_comments(text, context=args.context, model=args.model, want_short=args.short)
    else:
        result = analyze_text(text, model=args.model, want_short=args.short)

    print(result.json(indent=2, ensure_ascii=False))
