from pydantic import BaseModel, Field
from typing import Optional

class JournalInput(BaseModel):
    text: str = Field(..., description="Raw text of the journal entry.")

class SentimentResult(BaseModel):
    score: float = Field(..., description="Compound sentiment score between -1.0 and 1.0.")
    classification: str = Field(..., description="'positive', 'neutral', 'negative', or 'crisis'")
    intervention_triggered: bool = Field(..., description="True if score is critically low or crisis keywords detected.")
    intervention_message: Optional[str] = Field(None, description="Actionable emergency message if triggered.")
