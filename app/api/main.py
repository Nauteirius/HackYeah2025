from fastapi import FastAPI, Depends, HTTPException
from auth.auth import check_api_key
from models.receive_model import AnalysisResult
from test_data.test_data_analysis import mock_fact_check_result
from dotenv import load_dotenv
from disinfo_analyzer import analyze_comments, analyze_text, DEFAULT_MODEL
from starlette.concurrency import run_in_threadpool

import json

app = FastAPI(
    dependencies=[Depends(check_api_key)],
    description="""
This API serves as an intermediary layer between the machine learning model and the website frontend.
When a request is received from the website:
1. The API forwards the request payload to the model service
2. The model processes the data and returns a response
3. The API relays the model's response back to the website frontend
"""
              )

load_dotenv()


@app.get("/fact-check-api/health")
async def health_check():
    return {"status": "ok", "service": "api", "version": "1.0.0"}

@app.post("/fact-check-api/mock")
async def mock():
    return mock_fact_check_result

@app.post("/fact-check-api/predict")
async def predict(data: dict):
    """
    Expected body:
    {
      "mode": "comments" | "article",
      "text": "<text to analyze>",
      "author": "user:xyz",              # optional
      "context": "thread title ...",     # optional (comments mode)
      "history": [ { ... }, ... ],       # optional list of prior events
      "model": "gpt-4o-mini",            # optional override
      "short": true                      # optional (defaults: True for comments, False for article)
    }
    """
    try:
        mode    = (data.get("mode") or "comments").lower()
        text    = data.get("text") or ""
        author  = data.get("author")
        context = data.get("context")
        history = data.get("history")
        model   = data.get("model") or DEFAULT_MODEL
        short   = bool(data.get("short", True if mode == "comments" else False))

        if not text.strip():
            raise HTTPException(status_code=400, detail="Missing 'text' in request body.")

        if mode == "comments":
            result = await run_in_threadpool(
                analyze_comments,
                text,
                context=context,
                author=author,
                history=history,
                model=model,
                want_short=short,
            )
        elif mode == "article":
            result = await run_in_threadpool(
                analyze_text,
                text,
                author=author,
                history=history,
                model=model,
                want_short=short,
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid 'mode'. Use 'comments' or 'article'.")

        # Return the dataclass as plain JSON
        return json.loads(result.json())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyzer error: {e}")
