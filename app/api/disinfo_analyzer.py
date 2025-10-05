# disinfo_analyzer.py
# Minimal dependency: openai>=1.0.0
# Usage:
#   export OPENAI_API_KEY=...
#   from disinfo_analyzer import analyze_text
#   result = analyze_text("your article text")
#   print(result.json(indent=2))

from __future__ import annotations

import math
import os
import time
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv

load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("No OPENAI_API_KEY. Add .env or set env variable.")

# from openai import OpenAI, APIError, RateLimitError, APITimeoutError
try:
    from openai import OpenAI, APIError, RateLimitError, APITimeoutError
except Exception:
    OpenAI = None  # pozwala testom lub mockom to nadpisać


    class APIError(Exception):
        ...


    class RateLimitError(Exception):
        ...


    class APITimeoutError(Exception):
        ...
# -----------------------------
# Config
# -----------------------------
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # change to a larger model if you have access
MAX_INPUT_CHARS = 32_000  # simple guardrail to avoid oversized payloads
REQUEST_TIMEOUT = 60  # seconds
MAX_RETRIES = 3
RETRY_BACKOFF_SECS = 2.0

# --- DB / thresholds ---
DB_PATH = os.getenv("DISINFO_DB_PATH")  # e.g. "app/data/disinfo.db" (leave empty to disable DB writes)

# When to log a suspicious event?
# If your interpretation is “LOW score is suspicious”, set:
#   RISK_TRIGGER=low  and  RISK_THRESHOLD_ARTICLE=0.3  RISK_THRESHOLD_COMMENTS=0.3
RISK_TRIGGER = os.getenv("RISK_TRIGGER", "high").lower()  # "high" or "low"
RISK_THRESHOLD_ARTICLE = float(os.getenv("RISK_THRESHOLD_ARTICLE", "0.7"))
RISK_THRESHOLD_COMMENTS = float(os.getenv("RISK_THRESHOLD_COMMENTS", "0.7"))

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


def _format_history(history: Optional[List[Dict[str, Any]]], max_items: int = 6) -> str:
    """
It converts a list of the author’s records into a short description for a prompt.
Expected keys in a record (example):{"ts": "2025-10-01T12:00:00Z", "type": "comment|article",
 "score": 0.82, "verdict": "likely", "note": "brigading"}

    """
    if not history:
        return "(none)"
    lines = []
    for row in history[:max_items]:
        ts = row.get("ts") or row.get("timestamp") or ""
        try:
            # opcjonalna normalizacja daty
            if ts and isinstance(ts, str):
                ts = ts.replace("T", " ")
        except Exception:
            pass
        kind = row.get("type", "item")
        score = row.get("score", "")
        verdict = row.get("verdict", "")
        note = row.get("note", "")
        lines.append(f"- {ts} • {kind} • score={score} • {verdict} {('• ' + note) if note else ''}".strip())
    return "\n".join(lines)


def _compute_prior_from_history(history: Optional[List[Dict[str, Any]]]) -> Optional[float]:
    """
    Calculates a weak ‘prior’ based on history: the average of ‘bad’ records (score ≥ 0.7),
    with a slight penalty for staleness that can be added later.
    """
    if not history:
        return None
    bad = [float(h.get("score", 0.0)) for h in history if float(h.get("score", 0.0)) >= 0.7]
    if not bad:
        return None
    # średnia „złych” skorów jako prior (0..1)
    return max(0.0, min(1.0, sum(bad) / len(bad)))


def _combine_with_prior(model_score: float, prior: Optional[float], history_size: int) -> float:
    """
    Ostrożny blend: waga priors rośnie logarytmicznie z liczbą negatywnych wpisów,
    ale maks. 0.35. To dalej 'weak prior'.
    """
    if prior is None:
        return model_score
    w_prior = min(0.35, 0.12 * math.log1p(history_size))
    w_model = 1.0 - w_prior
    return max(0.0, min(1.0, w_model * model_score + w_prior * prior))


# Fallback (gdy plik schema.json nie istnieje lub jest błędny)
_DEFAULT_SCHEMA_ARTICLE = {
    "version": "1.0",
    "author": "",
    "summary": "",
    "likelihood_score": 0.0,
    "confidence": 0.0,
    "history_summary": "",
    "prior_risk": 0.0,
    "combined_likelihood_score": 0.0,
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
_DEFAULT_SCHEMA_COMMENTS = {
    "version": "1.0",
    "summary": "",
    "risk_score": 0.0,
    "confidence": 0.0,
    "rationale": "",
    "indicators": [],
    "bot_likelihood": 0.0,
    "troll_likelihood": 0.0,
    "coordination_signals": [],
    "language_markers": [],
    "recommended_actions": [],
    "safety_notes": []
}

_SCHEMA_CACHE: Dict[str, Dict[str, Any]] = {}


def _load_schema(profile: str) -> Dict[str, Any]:
    """
    Loads prompts/<profile>/schema.json and merges it with the default fields (fallback).
    """
    if profile in _SCHEMA_CACHE:
        return _SCHEMA_CACHE[profile]

    schema_path = os.path.join(PROMPTS_DIR, profile, "schema.json")
    default = _DEFAULT_SCHEMA_ARTICLE if profile == "article" else _DEFAULT_SCHEMA_COMMENTS

    try:
        raw = _read_file(schema_path)
        if not raw:
            _SCHEMA_CACHE[profile] = default
            return default
        parsed = json.loads(raw)
        if not isinstance(parsed, dict):
            _SCHEMA_CACHE[profile] = default
            return default
        # proste „merge” z domyślnymi polami (braki uzupełniamy):
        merged = {**default, **parsed}
        _SCHEMA_CACHE[profile] = merged
        return merged
    except Exception:
        _SCHEMA_CACHE[profile] = default
        return default


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
    raw_text: Optional[str] = None  # the raw JSON text from the model (for logging/debug)

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
    schema = json.dumps(_DEFAULT_SCHEMA_ARTICLE, ensure_ascii=False, indent=2)
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
        author: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None,

) -> (str, str):
    """
    Return  (system_prompt, user_prompt) from files
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

{"Return concise fields." if brevity else "Be thorough yet concise."}

--- BEGIN COMMENTS ---
{text}
--- END COMMENTS ---
"""
        return system_prompt, user_prompt

    # render z plików
    schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
    history_str = _format_history(history)
    system_prompt = system_tpl  # zwykle bez placeholderów
    user_prompt = _render_template(
        user_tpl,
        SCHEMA=schema_str,
        TEXT=text,
        CONTEXT=(context or ""),
        AUTHOR=(author or "(unknown)"),
        HISTORY=history_str,
        BREVITY=("Return concise fields." if brevity else "Be thorough yet concise.")
    )
    return system_prompt, user_prompt


# --- simple SQLite storage for author/events ---
import sqlite3


def _db_conn():
    if not DB_PATH:
        return None
    # make sure folder exists
    if os.path.dirname(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


def init_db():
    conn = _db_conn()
    if not conn:
        return
    conn.executescript("""
                       CREATE TABLE IF NOT EXISTS authors
                       (
                           id
                           TEXT
                           PRIMARY
                           KEY,
                           display_name
                           TEXT,
                           platform
                           TEXT,
                           created_at
                           TEXT
                           DEFAULT (
                           datetime
                       (
                           'now'
                       ))
                           );
                       CREATE TABLE IF NOT EXISTS events
                       (
                           id
                           INTEGER
                           PRIMARY
                           KEY
                           AUTOINCREMENT,
                           author_id
                           TEXT,
                           kind
                           TEXT, -- 'article' | 'comment'
                           score
                           REAL, -- raw model score (NOT combined)
                           verdict
                           TEXT, -- derived label at insertion time
                           note
                           TEXT,
                           ts
                           TEXT
                           DEFAULT (
                           datetime
                       (
                           'now'
                       )),
                           FOREIGN KEY
                       (
                           author_id
                       ) REFERENCES authors
                       (
                           id
                       )
                           );
                       """)
    conn.commit()
    conn.close()


def _normalize_author(author: Optional[str]) -> Optional[str]:
    if not author:
        return None
    a = author.strip()
    return a or None


def _upsert_author(author: Optional[str], display_name: Optional[str] = None, platform: Optional[str] = None) -> \
        Optional[str]:
    aid = _normalize_author(author)
    if not aid:
        return None
    conn = _db_conn()
    if not conn:
        return None
    conn.execute(
        "INSERT OR IGNORE INTO authors(id, display_name, platform) VALUES (?, ?, ?)",
        (aid, display_name or aid, platform)
    )
    conn.commit()
    conn.close()
    return aid


def _should_log(score: float, *, threshold: float, trigger: str) -> bool:
    if trigger == "low":
        return score <= threshold
    return score >= threshold


def _maybe_log_event(kind: str, author: Optional[str], score: float, verdict: str, note: str = "") -> None:
    # Only if DB configured:
    conn = _db_conn()
    if not conn:
        return
    aid = _upsert_author(author)
    if not aid:
        return
    conn.execute(
        "INSERT INTO events(author_id, kind, score, verdict, note) VALUES (?, ?, ?, ?, ?)",
        (aid, kind, score, verdict, note)
    )
    conn.commit()
    conn.close()


# initialize tables if DB_PATH provided
if DB_PATH:
    init_db()


def analyze_text(
        article_text: str,
        *,
        history: Optional[List[Dict[str, Any]]] = None,
        author: Optional[str] = None,
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
        schema=_load_schema("article"),
        brevity=want_short,
        author=author,
        history=history,
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

        model_score = float(_get("likelihood_score", 0.5))

        # decide verdict for storage; keep it simple
        if RISK_TRIGGER == "low":
            verdict = "suspicious_low" if model_score <= RISK_THRESHOLD_ARTICLE else "normal"
        else:
            verdict = "likely" if model_score >= RISK_THRESHOLD_ARTICLE else "unlikely"

        # only record if condition meets your trigger using the RAW model score
        if _should_log(model_score, threshold=RISK_THRESHOLD_ARTICLE, trigger=RISK_TRIGGER):
            _maybe_log_event(kind="article", author=author, score=model_score, verdict=verdict, note="auto")

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
        context: Optional[str] = None,  # np. tytuł posta, platforma, temat
        history: Optional[List[Dict[str, Any]]] = None,
        author: Optional[str] = None,
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
        schema=_load_schema("comments"),
        brevity=want_short,
        context=context,
        author=author,
        history=history,
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

        model_score = float(_get("risk_score", 0.5))

        if RISK_TRIGGER == "low":
            verdict = "suspicious_low" if model_score <= RISK_THRESHOLD_COMMENTS else "normal"
        else:
            verdict = "high_risk" if model_score >= RISK_THRESHOLD_COMMENTS else "normal"

        if _should_log(model_score, threshold=RISK_THRESHOLD_COMMENTS, trigger=RISK_TRIGGER):
            _maybe_log_event(kind="comment", author=author, score=model_score, verdict=verdict, note="auto")

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
    import argparse, sys, json, os


    def _load_history_from_args(hist_arg: Optional[str], hist_file: Optional[str]):
        """
    Loads history in one of the following formats:
    -JSON array (["...", {...}, ...]), or
    -JSONL (each line is a separate object).
    Returns a list of dicts or None.
        """
        if hist_file:
            try:
                with open(hist_file, "r", encoding="utf-8") as f:
                    txt = f.read().strip()
                if not txt:
                    return None
                if txt.lstrip().startswith("["):
                    return json.loads(txt)
                # JSONL
                return [json.loads(line) for line in txt.splitlines() if line.strip()]
            except Exception as e:
                print(f"Warning: cannot parse --history-file: {e}", file=sys.stderr)
                return None

        if hist_arg:
            try:
                return json.loads(hist_arg)
            except Exception as e:
                print(f"Warning: cannot parse --history JSON: {e}", file=sys.stderr)
                return None

        return None


    parser = argparse.ArgumentParser(description="Disinformation & comment integrity analyzer via LLM.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="OpenAI model (default from env or gpt-4o-mini)")
    parser.add_argument("--short", action="store_true", help="Return a shorter analysis")
    parser.add_argument("--mode", choices=["article", "comments"], default="article", help="Select analysis profile")
    parser.add_argument("--context", default=None,
                        help="Optional context for comments mode (post title, platform, topic)")
    parser.add_argument("--author", default=None, help="Author ID/handle to attribute this item to")
    parser.add_argument("--history", default=None, help="Inline JSON array with prior events for this author")
    parser.add_argument("--history-file", default=None, help="Path to JSON (array) or JSONL with prior events")
    parser.add_argument("file", nargs="?", help="Path to a text file to analyze. If omitted, read stdin.")
    args = parser.parse_args()

    text = open(args.file, "r", encoding="utf-8").read() if args.file else sys.stdin.read()
    history = _load_history_from_args(args.history, args.history_file)

    if args.mode == "comments":
        result = analyze_comments(
            text,
            context=args.context,
            author=args.author,
            history=history,
            model=args.model,
            want_short=args.short,
        )
    else:
        result = analyze_text(
            text,
            author=args.author,
            history=history,
            model=args.model,
            want_short=args.short,
        )

    print(result.json(indent=2, ensure_ascii=False))

# beda scory  autor timestamp i score, i mozna wykrywac spikei, liczba zlych scoraow w czasie, mozna uzywac
# kolejny enpoint sprawdz autora czy on jest jakis zlym zrodlem.
# kolejny ficzer zmien klikbaitowy na nie klikbaitowy
