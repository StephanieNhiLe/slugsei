from google.cloud import firestore

firestore_client = firestore.Client()

def analyze_video(video_id: str):
    """Analyzes video data."""
    doc_ref = firestore_client.collection("videos").document(video_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise ValueError("Video not found.")

    data = doc.to_dict()
    analysis = data.get("analysis_results")

    if not analysis:
        raise ValueError("No analysis data found.")

    # Log the retrieved data for debugging
    print(f"Retrieved data for video_id {video_id}: {data}")

    return analysis