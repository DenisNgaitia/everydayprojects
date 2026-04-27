from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.forge import StudyPlan, Quiz
from app.schemas.forge import CourseInput, StudyPlanOut, QuizOut
from app.services.ai_forge import generate_quests_from_syllabus, generate_study_plan, generate_quiz

router = APIRouter()

@router.post("/study-plans", response_model=StudyPlanOut, summary="Generate AI Study Plan")
def create_study_plan(
    data: CourseInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.syllabus_text:
        raise HTTPException(status_code=400, detail="Syllabus text is empty.")
        
    plan_json = generate_study_plan(data.syllabus_text)
    
    new_plan = StudyPlan(
        user_id=current_user.id,
        course_code=data.course_code,
        plan_data=plan_json
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return new_plan

@router.get("/study-plans", response_model=List[StudyPlanOut], summary="Get Saved Study Plans")
def get_study_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).order_by(StudyPlan.created_at.desc()).all()


@router.post("/quizzes", response_model=QuizOut, summary="Generate AI Quiz")
def create_quiz(
    data: CourseInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.syllabus_text:
        raise HTTPException(status_code=400, detail="Topic text is empty.")
        
    quiz_json = generate_quiz(data.syllabus_text)
    
    new_quiz = Quiz(
        user_id=current_user.id,
        course_code=data.course_code,
        quiz_data=quiz_json
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    return new_quiz

@router.get("/quizzes", response_model=List[QuizOut], summary="Get Saved Quizzes")
def get_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Quiz).filter(Quiz.user_id == current_user.id).order_by(Quiz.created_at.desc()).all()

# Legacy Quest Parsing Endpoint (Kept for backwards compatibility)
from pydantic import BaseModel
class SyllabusUpload(BaseModel):
    course_code: str
    text_content: str

@router.post("/parse-syllabus", summary="Generate Quests from Syllabus")
async def parse_syllabus(data: SyllabusUpload):
    if not data.text_content:
        raise HTTPException(status_code=400, detail="Syllabus text is empty.")
    quests = generate_quests_from_syllabus(data.text_content)
    return {
        "course": data.course_code,
        "generated_quests": quests,
        "message": "Boss fights successfully generated from syllabus."
    }
