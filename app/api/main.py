import json
import logging
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

# from models.predict_model import AnalysisText
from auth.auth import check_api_key
from disinfo_analyzer import analyze_comments, analyze_text, DEFAULT_MODEL
from test_data.test_data_analysis import mock_fact_check_result

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hackyeah.encape.me/"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only necessary methods
    allow_headers=["Content-Type", "Authorization"],
)

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

LOG = logging.getLogger(__name__)


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
      "model": "gpt-4o-mini",            # optional override
      "short": true                      # optional (defaults: True for comments, False for article)
    }
    """
    try:
        mode = (data.get("mode") or "comments").lower()
        text = data.get("text") or ""
        author = data.get("author")
        context = data.get("context")
        # history = db.get_articles_author_reviews(author)
        history = []
        model = data.get("model") or DEFAULT_MODEL
        short = bool(data.get("short", True if mode == "comments" else False))

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

        result_json = json.loads(result.json())

        # if "combined_likelihood_score" in result_json.keys():
        #     author_id = db.save_author(author, result_json.get("combined_likelihood_score"))
        # else:
        # author_id = db.get_author_by_name(author)["_id"]
        # if mode == "article":
        #     db.save_article(author_id, text, result_json, datetime.now())
        # elif mode == "comments":
        #     db.save_comment(author_id, text, result_json, datetime.now())

        # Return the dataclass as plain JSON
        return result_json

    except HTTPException:
        raise
    except Exception as e:
        LOG.exception(e)
        raise HTTPException(status_code=500, detail=f"Analyzer error: {e}")

# @app.get("/fact-check-api/articles")
# async def get_articles() -> str:
#     return db.get_articles()
#
#
# @app.get("/fact-check-api/comments")
# async def get_comments() -> str:
#     return db.get_comments()
#
#
# @app.get("/fact-check-api/authors")
# async def get_authors() -> str:
#     return db.get_authors()
