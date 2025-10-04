from pydantic import BaseModel

class AnalysisText(BaseModel):
    article_text: str
    model: str
    temperature: float = 0.2
    want_short: bool = False