from fastapi import FastAPI
# from models.receive_model import AnalysisResult
# from models.predict_model import AnalysisText
from test_data.test_data_analysis import mock_fact_check_result
from dotenv import load_dotenv

app = FastAPI(
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
@app.post("/fact-check-api/predict")
async def predict():
    return mock_fact_check_result

