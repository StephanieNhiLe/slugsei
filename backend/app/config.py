import os
from google.cloud import storage, firestore
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = "slugsei-baseball-coach-videos"

GCP_PROJECT_ID = os.getenv("GCP_PROJECT")
if not GCP_PROJECT_ID:
    raise ValueError("Missing GCP_PROJECT environment variable.") 

storage_client = storage.Client()
firestore_client = firestore.Client()  

def get_videos_bucket(bucket_name: str = BUCKET_NAME):
    return storage_client.bucket(BUCKET_NAME)

def get_firestore_collection(collection_name):
    return firestore_client.collection(collection_name)
