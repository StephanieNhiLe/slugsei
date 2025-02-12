import os
import google.generativeai as genai
from google.cloud import firestore
from ..config import firestore_client
from .playerData import PlayerData

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

filePath = os.path.join(os.path.dirname(__file__), '../../datasets/2024-mlb-homeruns.csv')
player_service = PlayerData(filePath)

def generate_coaching_feedback(video_id: str):

    doc_ref = firestore_client.collection("videos").document(video_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise ValueError(f"No video found for ID: {video_id}")

    data = doc.to_dict()
    analysis = data.get("analysis_results")

    if not analysis:
        raise ValueError(f"No analysis results available for video ID: {video_id}")

    launch_angle = analysis.get("launch_angle")
    exit_velocity = analysis.get("exit_velocity")

    if launch_angle is None or exit_velocity is None:
        raise ValueError(f"Incomplete analysis data for video ID: {video_id}")

    closest_match = None
    smallest_diff = float('inf')
    for player_id, player_data in player_service.get_all_players().items():
        try:
            launch_angle_diff = abs(float(player_data['LaunchAngle']) - launch_angle)
            exit_velocity_diff = abs(float(player_data['ExitVelocity']) - exit_velocity)
            total_diff = launch_angle_diff + exit_velocity_diff

            if total_diff < smallest_diff:
                smallest_diff = total_diff
                closest_match = player_data
        except ValueError:
            continue

    if closest_match:
        player_reference = f"Your performance is similar to {closest_match['title']}."
        player_video = closest_match['video']
        outstanding_features = f"Launch Angle: {closest_match['LaunchAngle']}°, Exit Velocity: {closest_match['ExitVelocity']} mph"
    else:
        player_reference = "No close match found in the dataset."
        player_video = ""
        outstanding_features = ""

    prompt = f"""
    You are a professional baseball coach specializing in advanced swing mechanics and player development.
    You will provide **scientific and resource-backed feedback** based on reference materials like **MLB guidelines, biomechanics research, and professional coaching techniques**.

    ### Player Analysis:
    - **Launch Angle**: {launch_angle}° (Recommended: 20°-35° for line drives & home runs)
    - **Exit Velocity**: {exit_velocity} mph (Higher is better for power hitters)
    - **Reference Player**: {player_reference}
    - **Reference Player Video**: {player_video}
    - **Outstanding Features**: {outstanding_features}

    ### Your Task:
    Provide detailed feedback on **how to improve** using references from **biomechanics studies, pro player case studies, and scientific analysis**.
    
    #### **Feedback Format:**
    - **Reference Real-Life Players:** Compare to MLB players with similar metrics.
    - **Use Scientific Data:** Base swing adjustments on **sports science & biomechanics.**
    - **Actionable Drills:** Recommend specific **batting stance drills, weight training, and swing path corrections.**
    - **Performance Metrics:** Suggest **trackable goals** (e.g., increasing launch angle by X degrees, exit velocity improvement benchmarks).

    #### **Example Resources to Reference:**
    - **"The Science of Hitting" by Ted Williams**
    - **Statcast Data from MLB for Ideal Launch Angles**
    - **Biomechanics Studies from Driveline Baseball**
    - **Case Study: How Aaron Judge & Shohei Ohtani optimize their swing path**

    Structure your feedback as if giving **professional coaching advice to a serious player looking to improve.** Keep it **concise, structured, and reference-backed**.
    """

    stats_explanation = """
**Understanding Your Statistics:**

1. **Barrel Zone:**
   - The barrel zone shows the optimal combination of launch angle and exit velocity
   - Blue line represents the ideal hitting zone
   - Your swing (red dot) shows where your hit falls in relation to the optimal zone
   - Optimal barrel zone: Launch angles between 8-32° with exit velocities above 95 mph

2. **Exit Velocity:**
   - Exit velocity is how fast the ball leaves your bat
   - MLB average: ~88-89 mph
   - Elite power hitters: 95+ mph
   - Your exit velocity: {exit_velocity} mph
   - Higher exit velocity typically results in better hitting outcomes

3. **Launch Angle:**
   - Launch angle is the vertical angle the ball leaves your bat
   - Ground balls: Less than 10°
   - Line drives: 10-25°
   - Fly balls: 25-35°
   - Pop-ups: Above 35°
   - Your launch angle: {launch_angle}°
   - Optimal range for hits: 8-32°

These metrics together help determine the quality of contact and potential outcomes of your hits.
""".format(exit_velocity=exit_velocity, launch_angle=launch_angle)

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        complete_feedback = f"{response.text}\n\n{stats_explanation}"

        return {
            "video_id": video_id,
            "feedback": complete_feedback,
            "reference_video": player_video if player_video else None
        }

    except Exception as e:
        fallback_feedback = f"**Coaching Feedback**\n\n"
        
        if launch_angle < 10:
            fallback_feedback += "- Your launch angle is too low. Adjust your bat angle and follow through to generate better loft.\n"
        elif launch_angle > 40:
            fallback_feedback += "- Your launch angle is too high, which may reduce your exit velocity. Focus on a controlled, flatter swing.\n"
        else:
            fallback_feedback += "- Your launch angle is within the optimal range. Keep working on consistency.\n"

        if exit_velocity < 50:
            fallback_feedback += "- Your exit velocity is low. Focus on improving your bat speed and lower-body drive for more power.\n"
        else:
            fallback_feedback += "- Your exit velocity is strong! Maintain good mechanics to ensure consistent results.\n"

        fallback_feedback += f"\n- **Track your metrics using tools like Rapsodo or Statcast and work on incremental improvements.**\n"
        fallback_feedback += f"\n- **{player_reference}**\n"
        fallback_feedback += f"\n- **Reference Player Video**: {player_video}\n"
        fallback_feedback += f"\n- **Outstanding Features**: {outstanding_features}\n"

        complete_fallback = f"{fallback_feedback}\n\n{stats_explanation}"

        return {
            "video_id": video_id,
            "feedback": complete_fallback,
            "reference_video": player_video if player_video else None
        }

def ask_gemini(video_id: str, question: str) -> str:
    """Uses Gemini API to provide AI-based coaching insights."""
    prompt = f"Video ID: {video_id}\nQuestion: {question}\nRespond as a professional baseball coach with references to biomechanics, MLB guidelines, and professional coaching techniques."
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred while processing your question: {str(e)}"