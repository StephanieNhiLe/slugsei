from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.coaching_service import generate_coaching_feedback

router = APIRouter()

class CoachingRequest(BaseModel):
    video_id: str

@router.post("/feedback")
def get_feedback(request: CoachingRequest):
    try:
        feedback = generate_coaching_feedback(request.video_id)
        return {"video_id": request.video_id, "feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
