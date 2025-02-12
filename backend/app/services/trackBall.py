# Temporary not using
import cv2
import os
import numpy as np

def track_baseball(video_file, max_seconds=5):
    cap = cv2.VideoCapture(video_file)
    ball_positions = []

    if not cap.isOpened():
        print(f"Error opening video file: {video_file}")
        return None

    fps = int(cap.get(cv2.CAP_PROP_FPS))  
    max_frames = max_seconds * fps  
    frame_count = 0

    output_folder = "tracked_frames"
    os.makedirs(output_folder, exist_ok=True)

    fgbg = cv2.createBackgroundSubtractorMOG2()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or frame_count >= max_frames:
            break  

        fgmask = fgbg.apply(frame)

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        lower_color = np.array([0, 50, 50])
        upper_color = np.array([30, 255, 255])

        # Threshold the HSV image to get only baseball colors 
        # Concern 1: The baseball may not be a solid color, and the lighting conditions may vary
        # Concern 2: The baseball may not be the only object with the specified color range (messed up with player uniform)
        mask = cv2.inRange(hsv, lower_color, upper_color)

        combined_mask = cv2.bitwise_and(fgmask, mask)

        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            if cv2.contourArea(contour) < 500:
                continue

            (x, y, w, h) = cv2.boundingRect(contour)
            aspect_ratio = float(w) / h

            if 0.8 < aspect_ratio < 1.2 and 20 < w < 100 and 20 < h < 100:
                cx, cy = x + w // 2, y + h // 2

                ball_positions.append((cx, cy))

                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)

        frame_path = os.path.join(output_folder, f"frame_{frame_count:04d}.jpg")
        cv2.imwrite(frame_path, frame)
        
        frame_count += 1

    positions_file_path = "ball_positions.txt"
    with open(positions_file_path, "w") as f:
        for pos in ball_positions:
            f.write(f"{pos[0]},{pos[1]}\n")

    cap.release()
    cv2.destroyAllWindows()

    return positions_file_path

if __name__ == "__main__":
    video_file = "datasets/videos/video_0.mp4"
    positions_file = track_baseball(video_file, max_seconds=5)
    if positions_file:
        print(f"Ball positions saved to {positions_file}")
    else:
        print("Error processing video.")