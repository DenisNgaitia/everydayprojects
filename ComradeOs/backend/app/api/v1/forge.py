from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.ai_forge import generate_quests_from_syllabus

router = APIRouter()

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
