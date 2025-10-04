from fastapi import FastAPI
from models.receive_model import AnalysisResult
from models.predict_model import AnalysisText

app = FastAPI(
    description="""
This API serves as an intermediary layer between the machine learning model and the website frontend. 
When a request is received from the website:
1. The API forwards the request payload to the model service
2. The model processes the data and returns a response
3. The API relays the model's response back to the website frontend
"""
)


@app.post("/fact-check-api/predict")
async def predict(data: dict) -> AnalysisResult:
    return AnalysisResult

@app.get("/fact-check-api/receive") 
async def receive(data: dict) -> AnalysisText: 
    return AnalysisText