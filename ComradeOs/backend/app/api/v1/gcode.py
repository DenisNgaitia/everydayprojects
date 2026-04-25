from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from app.services.gcode import generate_html_cv

router = APIRouter()

@router.get("/export", summary="Export Comrade CV", response_class=HTMLResponse)
async def export_cv(username: str = "Comrade Doe", rep: int = 420):
    """
    Returns an HTML CV generated from the user's campus achievements.
    In production, this would fetch User, Quest, and Guild records from the DB.
    """
    
    # Mock data for MVP
    mock_quests = [
        {"title": "Database Boss Fight (CAT 1)", "xp": 100},
        {"title": "Operating Systems Group Project", "xp": 250},
        {"title": "Survived End of Month (HELB delayed)", "xp": 500}
    ]
    
    html_content = generate_html_cv(username=username, rep_score=rep, completed_quests=mock_quests)
    return HTMLResponse(content=html_content, status_code=200)
