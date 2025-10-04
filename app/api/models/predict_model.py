from pydantic import BasicModel

class AnalysisText(BasicModel):
    article_text: str
    model: str
    temperature: float = 0.2
    want_short: bool = False