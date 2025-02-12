# # Temporary not using
# import os
# import cv2
# import mediapipe as mp
# import pandas as pd
# import glob
# import urllib.request

# mp_pose = mp.solutions.pose
# mp_drawing = mp.solutions.drawing_utils

# dataset_folder = "datasets"
# video_save_folder = os.path.join(dataset_folder, "videos")
# trimmed_video_folder = os.path.join(dataset_folder, "trimmed_videos")
# pose_data_folder = os.path.join(dataset_folder, "pose_data")

# os.makedirs(video_save_folder, exist_ok=True)
# os.makedirs(trimmed_video_folder, exist_ok=True)
# os.makedirs(pose_data_folder, exist_ok=True)

# csv_files = glob.glob(os.path.join(dataset_folder, "*.csv"))

# def download_video(url, save_path):
#     try:
#         urllib.request.urlretrieve(url, save_path)
#         return save_path
#     except Exception as e:
#         print(f"Failed to download {url}: {e}")
#         return None

# # Trim the first 5s of vid
# def trim_video(input_path, output_path, duration=5):
#     cap = cv2.VideoCapture(input_path)

#     if not cap.isOpened():
#         print(f"Error opening video file: {input_path}")
#         return None

#     fps = int(cap.get(cv2.CAP_PROP_FPS))
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     max_frames = min(fps * duration, total_frames)

#     width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
#     height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
#     fourcc = cv2.VideoWriter_fourcc(*'mp4v')

#     out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

#     for _ in range(max_frames):
#         ret, frame = cap.read()
#         if not ret:
#             break
#         out.write(frame)

#     cap.release()
#     out.release()
#     print(f"Trimmed video saved: {output_path}")
#     return output_path

# # Pose analysis
# def analyze_first_person(video_path, csv_path):
#     cap = cv2.VideoCapture(video_path)

#     if not cap.isOpened():
#         print(f"Error opening video file: {video_path}")
#         return

#     with mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
#         frame_count = 0
#         pose_data = []

#         while cap.isOpened():
#             ret, frame = cap.read()
#             if not ret:
#                 break

#             frame_count += 1

#             image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             results = pose.process(image_rgb)

#             if results.pose_landmarks:
#                 mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

#                 landmarks = results.pose_landmarks.landmark
#                 frame_data = [frame_count]  
#                 for landmark in landmarks:
#                     frame_data.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])

#                 pose_data.append(frame_data)

#             cv2.imshow("Pose Analysis", frame)

#             if cv2.waitKey(1) & 0xFF == ord('q'):
#                 break

#         cap.release()
#         cv2.destroyAllWindows()

#         if pose_data:
#             column_names = ["frame"] + [f"{i}_{coord}" for i in range(33) for coord in ["x", "y", "z", "visibility"]]
#             df_pose = pd.DataFrame(pose_data, columns=column_names)
#             df_pose.to_csv(csv_path, index=False)
#             print(f"Pose data saved: {csv_path}")
#         else:
#             print("No pose detected in the video.")

# for file in csv_files:
#     print(f"Processing file: {file}")

#     df = pd.read_csv(file, usecols=["video"])

#     for idx, video_url in enumerate(df["video"]):
#         video_filename = f"video_{idx}.mp4"
#         video_path = os.path.join(video_save_folder, video_filename)
#         trimmed_video_path = os.path.join(trimmed_video_folder, f"trimmed_{video_filename}")
#         pose_csv_path = os.path.join(pose_data_folder, f"pose_{idx}.csv")

#         local_video_path = download_video(video_url, video_path)
#         if not local_video_path:
#             continue

#         trimmed_path = trim_video(local_video_path, trimmed_video_path)
#         if not trimmed_path:
#             continue

#         analyze_first_person(trimmed_path, pose_csv_path)

#     print("\n" + "="*50 + "\n")  
