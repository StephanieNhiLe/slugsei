import sys
import os
import logging
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.cloud import firestore
from utils.image_generator import generate_and_upload_images
from ..services.analysis_service import analyze_video
from ..services.coaching_service import ask_gemini  

firestore_client = firestore.Client()
router = APIRouter()

class AnalysisRequest(BaseModel):
    video_id: str

class ImageGenerationRequest(BaseModel):
    video_id: str
    launch_angle: float
    exit_velocity: float

class QuestionRequest(BaseModel):
    video_id: str
    question: str

@router.post("/ask")
def ask_ai(request: QuestionRequest):
    """Handles AI-generated responses based on user questions."""
    try:
        if not request.video_id or not request.question:
            raise HTTPException(status_code=400, detail="Invalid request. Video ID and question are required.")

        response = ask_gemini(request.video_id, request.question)
        return {"answer": response}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@router.post("/process")
async def process_video(request: AnalysisRequest):
    """Processes the video and generates feedback."""
    try:
        doc_ref = firestore_client.collection("videos").document(request.video_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video not found")
            
        data = doc.to_dict()
        if data.get("status") == "failed":
            raise HTTPException(
                status_code=400, 
                detail=f"Previous analysis failed: {data.get('error', 'Unknown error')}"
            )

        result = analyze_video(request.video_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="No analysis data found")

        launch_angle = float(result.get("launch_angle", 0))
        exit_velocity = float(result.get("exit_velocity", 0))
        
        try:
            images = generate_and_upload_images(
                video_id=request.video_id,
                launch_angle=launch_angle,
                exit_velocity=exit_velocity
            )
        except Exception as img_error:
            logging.error(f"Error generating images: {str(img_error)}")
            images = {}   
        return {
            "video_id": request.video_id,
            "analysis": result,
            "images": images
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error in process_video: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@router.get("/{video_id}")
def get_analysis(video_id: str):
    """Fetch analysis results."""
    doc_ref = firestore_client.collection("videos").document(video_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Video not found")

    data = doc.to_dict()
    analysis = data.get("analysis_results")

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not available yet")

    return {
        "video_id": video_id,
        "status": data.get("status", "unknown"),
        "analysis": analysis
    } 

@router.post("/generate-images")
def generate_images(request: ImageGenerationRequest):
    """Generate analysis images based on launch angle & exit velocity."""
    try:
        image_urls = generate_and_upload_images(
            request.video_id, request.launch_angle, request.exit_velocity
        )
        return {"video_id": request.video_id, "images": image_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating images: {str(e)}")