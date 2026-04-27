from pydantic import BaseModel, Field
from typing import Dict, List, Any
from datetime import datetime
import uuid

class CourseInput(BaseModel):
    course_code: str = Field(..., examples=["CSC301"])
    syllabus_text: str = Field(..., description="The raw text content of the syllabus or topic.")

class StudyPlanOut(BaseModel):
    id: uuid.UUID
    course_code: str
    plan_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizOut(BaseModel):
    id: uuid.UUID
    course_code: str
    quiz_data: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
