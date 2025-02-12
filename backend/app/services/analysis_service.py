import tempfile
import logging
from google.cloud import storage, firestore
from ..config import get_videos_bucket, firestore_client
from .advancedTracker import BaseballTracker
import threading 
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_video(video_id: str):
    try:
        logger.info(f"Starting analysis for video_id: {video_id}")
        doc_ref = firestore_client.collection("videos").document(video_id)
        doc = doc_ref.get()

        if not doc.exists:
            logger.error(f"No video found for ID: {video_id}")
            raise ValueError(f"No video found for ID: {video_id}")

        data = doc.to_dict()
        bucket_name = data.get("bucket")
        file_name = data.get("file_name")

        if not bucket_name or not file_name:
            logger.error(f"Invalid metadata for video ID: {video_id}")
            raise ValueError(f"Invalid metadata for video ID: {video_id}")

        logger.info(f"Downloading video from bucket: {bucket_name}, file: {file_name}")
        bucket = get_videos_bucket(bucket_name)
        blob = bucket.blob(file_name)

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            blob.download_to_filename(temp_video.name)
            local_video_path = temp_video.name
            logger.info(f"Video downloaded to: {local_video_path}")

            logger.info("Starting baseball tracking")
            tracker = BaseballTracker(local_video_path)
            results, _ = tracker.track_baseball()
            
            if not results:
                logger.error("No results returned from tracker")
                raise ValueError("No tracking results available")

            launch_angle = results.get('launch_angle')
            exit_velocity = results.get('exit_velocity')
            
            if launch_angle is None or exit_velocity is None:
                logger.error("Missing launch angle or exit velocity in results")
                raise ValueError("Error analyzing ball motion.")

            analysis_results = {
                "launch_angle": float(launch_angle),
                "exit_velocity": float(exit_velocity)
            }

            logger.info(f"Analysis completed successfully: {analysis_results}")
            doc_ref.update({
                "analysis_results": analysis_results, 
                "status": "completed"
            })

            return analysis_results

    except Exception as e:
        logger.error(f"Error in analyze_video: {str(e)}", exc_info=True)
        if doc_ref:
            doc_ref.update({
                "status": "failed",
                "error": str(e)
            })
        raise ValueError(f"Error analyzing video: {str(e)}")

    finally:
        try:
            if 'local_video_path' in locals():
                os.remove(local_video_path)
                logger.info(f"Cleaned up temporary file: {local_video_path}")
        except Exception as e:
            logger.error(f"Error cleaning up temporary file: {str(e)}")

def analyze_video_background(video_id: str):
    thread = threading.Thread(target=analyze_video, args=(video_id,))
    thread.daemon = True  
    thread.start()
    return thread

