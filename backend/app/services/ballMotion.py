# Temporary not using
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit
from .trackBall import track_baseball   

def parabola(x, a, b, c):
    return a * x**2 + b * x + c

def analyze_ball_motion(ball_positions, fps=30, pixel_to_feet_ratio=0.02):
    # if len(ball_positions) < 5:
    #     print("Not enough data points to analyze launch angle and velocity.")
    #     return None, None

    if not ball_positions:
        raise ValueError("Error: ball_positions is empty.")

    print("DEBUG: ball_positions content:", ball_positions)

    if not isinstance(ball_positions, list) or not all(isinstance(pos, tuple) and len(pos) == 2 for pos in ball_positions):
        raise TypeError(f"Expected a list of (x, y) tuples, but got: {ball_positions}")

    x_vals = np.array([pos[0] for pos in ball_positions])
    y_vals = np.array([pos[1] for pos in ball_positions])

    y_vals = -y_vals  

    # Fit a parabolic trajectory curve y = ax^2 + bx + c
    params, _ = curve_fit(parabola, x_vals, y_vals)
    a, b, _ = params  # Coefficients

    # launch angle (θ) using the derivative dy/dx = 2ax + b
    x_initial = x_vals[0]  # First x-position
    slope = 2 * a * x_initial + b
    launch_angle = np.arctan(slope) * (180 / np.pi)  # Convert radians to degrees

    # exit velocity
    distances = []
    for i in range(1, len(ball_positions)):
        dx = (ball_positions[i][0] - ball_positions[i-1][0]) * pixel_to_feet_ratio   
        dy = (ball_positions[i][1] - ball_positions[i-1][1]) * pixel_to_feet_ratio
        distance = np.sqrt(dx**2 + dy**2)
        distances.append(distance)

    avg_velocity = np.mean(distances) * fps  

    exit_velocity = avg_velocity * 0.6818

    plt.scatter(x_vals, -y_vals, label="Tracked Points", color="red")  
    plt.plot(x_vals, parabola(x_vals, *params), label="Fitted Trajectory", color="blue")
    plt.gca().invert_yaxis()  
    plt.xlabel("X Position (pixels)")
    plt.ylabel("Y Position (pixels)")
    plt.title("Baseball Launch Trajectory")
    plt.legend()
    plt.show()

    return launch_angle, exit_velocity

if __name__ == "__main__":
    video_file = "datasets/videos/video_0.mp4"
    ball_positions = track_baseball(video_file)
    launch_angle, exit_velocity = analyze_ball_motion(ball_positions)
    print(f"Estimated Launch Angle: {launch_angle:.2f}°")
    print(f"Estimated Exit Velocity: {exit_velocity:.2f} mph")