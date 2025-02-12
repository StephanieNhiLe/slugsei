import cv2
import numpy as np
import matplotlib.pyplot as plt
import os 
import matplotlib.pyplot as plt

class BaseballTracker:
    def __init__(self, video_path):
        self.video_path = video_path
        self.video_info = self.get_video_info()
        self.fps = self.video_info['fps']

    def get_video_info(self):
        """
        Retrieve video information such as FPS, frame width, frame height, and total frames.
        """
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            print("Error: Unable to open video file.")
            return {'fps': 0, 'frame_width': 0, 'frame_height': 0, 'total_frames': 0}

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        cap.release()

        return {
            'fps': fps,
            'frame_width': frame_width,
            'frame_height': frame_height,
            'total_frames': total_frames
        }

    def detect_baseball(self, frame):
        """
        Detects the baseball in a frame using color and contour filtering.
        """
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        mask = cv2.inRange(hsv, lower_white, upper_white)

        kernel = np.ones((5,5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        valid_contours = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = float(w) / h
            if 50 < area < 1000 and 0.7 < aspect_ratio < 1.3:
                valid_contours.append(cnt)

        if valid_contours:
            largest_contour = max(valid_contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            return [(x + x + w) / 2, (y + y + h) / 2]  # Return center coordinates

        return None

    def track_baseball(self):
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            print("Error: Unable to open video file.")
            return {'launch_angle': 0, 'exit_velocity': 0}, []

        ball_positions = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            detection = self.detect_baseball(frame)
            if detection:
                ball_positions.append(detection)

            frame_count += 1
            if frame_count > 300:
                break

        cap.release()

        if len(ball_positions) > 3:
            return self._analyze_trajectory(ball_positions), ball_positions

        return {'launch_angle': 0, 'exit_velocity': 0}, ball_positions

    def _analyze_trajectory(self, positions):
        positions = np.array(positions)
        x_vals = positions[:, 0]
        y_vals = positions[:, 1]

        coeffs = np.polyfit(x_vals, y_vals, 2)
        initial_slope = 2 * coeffs[0] * x_vals[0] + coeffs[1]
        launch_angle = np.arctan(initial_slope) * (180 / np.pi)

        distances = np.sqrt(np.sum(np.diff(positions, axis=0)**2, axis=1))
        avg_pixel_velocity = np.mean(distances) * self.fps

        # Calibrated conversion factor
        conversion_factor = 0.035
        exit_velocity = avg_pixel_velocity * conversion_factor

        return {'launch_angle': launch_angle, 'exit_velocity': exit_velocity}

    def visualize_debug(self, ball_positions):
        """
        Comprehensive visualization of tracking process
        """
        plt.figure(figsize=(15, 10))
        
        if (ball_positions):
            plt.subplot(2, 2, 1)
            positions = np.array(ball_positions)
            plt.scatter(positions[:, 0], positions[:, 1])
            plt.title('Ball Trajectory')
            plt.xlabel('X Position')
            plt.ylabel('Y Position')
        else:
            plt.subplot(2, 2, 1)
            plt.title('No Ball Positions Detected')
        
        plt.tight_layout()
        plt.show()


# Usage
if __name__ == "__main__":
    video_file = "../datasets/videos/video_0.mp4"  
    tracker = BaseballTracker(video_file)
    
    results, ball_positions = tracker.track_baseball()
    if results:
        launch_angle = results['launch_angle']
        exit_velocity = results['exit_velocity']
        print(f"Launch Angle: {launch_angle:.2f}°")
        print(f"Exit Velocity: {exit_velocity:.2f} mph")
    else:
        print("Not enough ball positions to calculate trajectory.")
    
    tracker.visualize_debug(ball_positions)