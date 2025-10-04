from typing import Any, Mapping

from dotenv import load_dotenv
from fastapi import FastAPI, Depends

import db
# from models.predict_model import AnalysisText
from auth.auth import check_api_key
from models.receive_model import AnalysisResult
from test_data.test_data_analysis import mock_fact_check_result
from disinfo_analyzer import analyze_comments

app = FastAPI(dependencies=[Depends(check_api_key)],
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


# Single endpoint to receive AnalysisText, call model, get results, return back the result
@app.post("/fact-check-api/mock")
async def mock():
    return mock_fact_check_result


@app.post("/fact-check-api/predict")
async def predict(data: dict) -> AnalysisResult:
    prediction = await analyze_comments(data)
    return AnalysisResult


@app.get("/fact-check-api/articles")
async def get_articles() -> list[Mapping[str, Any] | Any]:
    return db.get_articles()


@app.get("/fact-check-api/comments")
async def get_comments() -> list[Mapping[str, Any] | Any]:
    return db.get_comments()


@app.get("/fact-check-api/authors")
async def get_authors() -> list[Mapping[str, Any] | Any]:
    return db.get_authors()
