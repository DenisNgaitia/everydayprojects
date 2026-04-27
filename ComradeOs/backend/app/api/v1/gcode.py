"""
ComradeOS — G-Code CV Builder API
Generates an HTML CV from real user data in the database.
Mock quest data has been eliminated.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.gcode import generate_html_cv

router = APIRouter()


@router.get("/export", summary="Export Comrade CV", response_class=HTMLResponse)
def export_cv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns an HTML CV generated from the authenticated user's campus achievements.
    Quest data will be populated once the Forge module tracks completions.
    For now, it shows the user's real profile + rep score.
    """
    # TODO: Fetch real quest completions from a Quest model when Forge is wired
    completed_quests = [
        {"title": "Account Created on ComradeOS", "xp": 10},
    ]

    html_content = generate_html_cv(
        username=current_user.username,
        rep_score=current_user.rep_score,
        completed_quests=completed_quests,
    )
    return HTMLResponse(content=html_content, status_code=200)
