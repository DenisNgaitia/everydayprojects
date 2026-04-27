from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.sanctuary import JournalInput, SentimentResult
from app.services.sentiment_engine import analyze_journal_entry

router = APIRouter()

@router.post("/analyze", response_model=SentimentResult, summary="Analyze Journal Sentiment locally")
def analyze_journal(
    data: JournalInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ingests journal text, analyzes emotional sentiment and crisis triggers locally in-memory,
    and returns the computed metrics.
    
    PRIVACY GUARANTEE: The raw `data.text` is explicitly NOT saved to the database.
    """
    result = analyze_journal_entry(data.text)
    
    # We could optionally log the 'score' and 'classification' to a Mood/Journal model here
    # tracking the user_id and timestamp, but explicitly excluding the text to ensure 
    # the user's sanctuary remains completely private.
    
    return SentimentResult(**result)
