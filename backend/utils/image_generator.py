import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import io
import os
import uuid
from google.cloud import storage
from typing import Dict, Tuple, Optional

# Constants
BUCKET_NAME = "slugsei-baseball-coach-images"
storage_client = storage.Client()

class MLBDataLoader:
    """Handles loading and preprocessing of MLB data"""
    @staticmethod
    def load_data() -> pd.DataFrame:
        dataset_path = os.getenv("MLB_DATASET_PATH", "backend/datasets/2024-mlb-homeruns.csv")
        df = pd.read_csv(dataset_path)
        return df.dropna(subset=["ExitVelocity", "LaunchAngle"])

    @staticmethod
    def get_statistics(df: pd.DataFrame) -> Tuple[float, float, float, float]:
        ev_mean = df["ExitVelocity"].mean()
        ev_mode = df["ExitVelocity"].mode()[0]
        la_mean = df["LaunchAngle"].mean()
        la_mode = df["LaunchAngle"].mode()[0]
        return ev_mean, ev_mode, la_mean, la_mode

class ChartGenerator:
    """Handles generation of various analysis charts"""
    def __init__(self, launch_angle: float, exit_velocity: float):
        self.launch_angle = launch_angle
        self.exit_velocity = exit_velocity
        self.mlb_data = MLBDataLoader.load_data()

    def create_barrel_zone(self, ax: plt.Axes) -> None:
        ax.set_title("Barrel Zone")
        ax.set_xlabel("Launch Angle (degrees)")
        ax.set_ylabel("Exit Velocity (mph)")
        ax.plot([5, 25], [80, 110], label="Optimal Barrel Zone", color="blue", linewidth=2)
        ax.scatter([self.launch_angle], [self.exit_velocity], color="red", s=100, label="Your Swing")
        ax.legend()

    def create_distribution_plot(self, ax: plt.Axes, metric: str, color: str) -> None:
        data = self.mlb_data[metric]
        mean_val = data.mean()
        user_val = self.exit_velocity if metric == "ExitVelocity" else self.launch_angle
        unit = "mph" if metric == "ExitVelocity" else "°"

        sns.histplot(data, bins=30, kde=True, ax=ax, color=color)
        ax.axvline(mean_val, color="red", linestyle="dashed", linewidth=2, 
                   label=f"MLB Mean: {mean_val:.1f}{unit}")
        ax.axvline(user_val, color="green", linestyle="solid", linewidth=2,
                   label=f"Your {'EV' if metric == 'ExitVelocity' else 'LA'}: {user_val:.1f}{unit}")
        
        title = "Exit Velocity Distribution" if metric == "ExitVelocity" else "Launch Angle Distribution"
        ax.set_title(title)
        ax.set_xlabel(f"{metric.replace('Velocity', ' Velocity')} ({unit})")
        ax.set_ylabel("Frequency")
        ax.legend()

    def generate_single_chart(self, chart_type: str) -> io.BytesIO:
        fig, ax = plt.subplots(figsize=(6, 6))
        
        if chart_type == "barrel_zone":
            self.create_barrel_zone(ax)
        elif chart_type == "exit_velocity":
            self.create_distribution_plot(ax, "ExitVelocity", "blue")
        elif chart_type == "launch_angle":
            self.create_distribution_plot(ax, "LaunchAngle", "orange")
        else:
            raise ValueError("Invalid chart type")

        plt.grid(True)
        image_stream = io.BytesIO()
        plt.savefig(image_stream, format="png")
        image_stream.seek(0)
        plt.close()
        return image_stream

    def create_analysis_plots(self) -> io.BytesIO:
        sns.set_style("whitegrid")
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        self.create_distribution_plot(axes[0], "ExitVelocity", "blue")
        self.create_distribution_plot(axes[1], "LaunchAngle", "orange")

        plt.tight_layout()
        image_stream = io.BytesIO()
        plt.savefig(image_stream, format="png", dpi=300, bbox_inches="tight")
        image_stream.seek(0)
        plt.close()
        return image_stream

class GCSUploader:
    """Handles uploading images to Google Cloud Storage"""
    @staticmethod
    def upload_image(image_stream: io.BytesIO, chart_type: str, video_id: str) -> str:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob_name = f"analysis_images/{video_id}/{chart_type}_{uuid.uuid4().hex}.png"
        blob = bucket.blob(blob_name)
        blob.upload_from_file(image_stream, content_type="image/png")
        return f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_name}"

def generate_and_upload_images(video_id: str, launch_angle: float, exit_velocity: float) -> Dict[str, str]:
    """Main function to generate and upload all analysis images"""
    try:
        chart_generator = ChartGenerator(launch_angle, exit_velocity)
        uploader = GCSUploader()
        images = {}

        # Generate and upload individual charts
        for chart_type in ["barrel_zone", "exit_velocity", "launch_angle"]:
            stream = chart_generator.generate_single_chart(chart_type)
            images[chart_type] = uploader.upload_image(stream, chart_type, video_id)

        # Generate and upload performance analysis
        analysis_stream = chart_generator.create_analysis_plots()
        images["performance_analysis"] = uploader.upload_image(analysis_stream, "performance_analysis", video_id)

        return images

    except Exception as e:
        print(f"Error generating/uploading images: {str(e)}")
        raise

# Functions for backward compatibility
def generate_image(launch_angle: float, exit_velocity: float, chart_type: str) -> io.BytesIO:
    """Backward compatibility wrapper for generate_single_chart"""
    generator = ChartGenerator(launch_angle, exit_velocity)
    return generator.generate_single_chart(chart_type)

def create_analysis_plots(df_clean: pd.DataFrame, user_exit_velocity: float, user_launch_angle: float) -> io.BytesIO:
    """Backward compatibility wrapper for create_analysis_plots"""
    generator = ChartGenerator(user_launch_angle, user_exit_velocity)
    return generator.create_analysis_plots()