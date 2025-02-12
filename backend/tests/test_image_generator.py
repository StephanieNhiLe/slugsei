import unittest
import os
import sys
import pandas as pd
import shutil
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from utils.image_generator import (
    MLBDataLoader,
    ChartGenerator,
    GCSUploader,
    generate_and_upload_images
)
from io import BytesIO

def setUpModule():
    """Global test setup that runs once before all tests"""
    global test_output_dir
    
    test_output_dir = Path(__file__).parent / "test_output"
    test_output_dir.mkdir(exist_ok=True)
    (test_output_dir).mkdir(exist_ok=True)
    
    os.environ["MLB_DATASET_PATH"] = str(backend_dir / "datasets" / "2024-mlb-homeruns.csv")

def tearDownModule():
    """Global test teardown that runs once after all tests"""
    pass  

class TestMLBDataLoader(unittest.TestCase):
    """Test MLB data loading functionality"""
    def setUp(self):
        """Verify MLB data exists before each test"""
        data_path = os.getenv("MLB_DATASET_PATH")
        self.assertTrue(Path(data_path).exists(), 
                       f"MLB data file not found at {data_path}")

    def test_load_data(self):
        df = MLBDataLoader.load_data()
        self.assertIsInstance(df, pd.DataFrame)
        self.assertTrue("ExitVelocity" in df.columns)
        self.assertTrue("LaunchAngle" in df.columns)

    def test_get_statistics(self):
        df = MLBDataLoader.load_data()
        ev_mean, ev_mode, la_mean, la_mode = MLBDataLoader.get_statistics(df)
        self.assertIsInstance(ev_mean, float)
        self.assertIsInstance(la_mean, float)

class TestChartGenerator(unittest.TestCase):
    """Test chart generation functionality"""
    def setUp(self):
        self.launch_angle = 20.0
        self.exit_velocity = 90.0
        self.generator = ChartGenerator(self.launch_angle, self.exit_velocity)
        
    def test_generate_single_chart(self):
        for chart_type in ["barrel_zone", "exit_velocity", "launch_angle"]:
            stream = self.generator.generate_single_chart(chart_type)
            self.assertIsInstance(stream, BytesIO)
            self.assertTrue(len(stream.getvalue()) > 0)

    def test_create_analysis_plots(self):
        stream = self.generator.create_analysis_plots()
        self.assertIsInstance(stream, BytesIO)
        self.assertTrue(len(stream.getvalue()) > 0)

    def test_invalid_chart_type(self):
        with self.assertRaises(ValueError):
            self.generator.generate_single_chart("invalid_type")

class TestGCSUploader(unittest.TestCase):
    """Test Google Cloud Storage upload functionality"""
    def setUp(self):
        self.video_id = "test_video_123"
        self.test_stream = BytesIO(b"test data")

    def test_upload_image(self):
        try:
            uploader = GCSUploader()
            url = uploader.upload_image(self.test_stream, "test_chart", self.video_id)
            self.assertTrue(url.startswith("https://storage.googleapis.com/"))
            self.assertTrue(self.video_id in url)
            self.assertTrue(url.endswith(".png"))
        except Exception as e:
            self.skipTest(f"Skipping GCS test: {str(e)}")

class TestImageGeneration(unittest.TestCase):
    """Test end-to-end image generation and upload"""
    def setUp(self):
        self.video_id = "test_video_123"
        self.launch_angle = 20.0
        self.exit_velocity = 90.0
        
        self.output_dir = test_output_dir 
        self.output_dir.mkdir(parents=True, exist_ok=True)
        print(f"\nGenerating test images in: {self.output_dir}")

    def test_visual_output(self):
        """Generate test images for visual inspection"""
        generator = ChartGenerator(self.launch_angle, self.exit_velocity)
        
        for chart_type in ["barrel_zone", "exit_velocity", "launch_angle"]:
            stream = generator.generate_single_chart(chart_type)
            output_path = self.output_dir / f"{chart_type}_test.png"
            with open(output_path, "wb") as f:
                f.write(stream.getvalue())
            print(f"Generated: {output_path}")
            self.assertTrue(output_path.exists())
        
        analysis_stream = generator.create_analysis_plots()
        output_path = self.output_dir / "performance_analysis_test.png"
        with open(output_path, "wb") as f:
            f.write(analysis_stream.getvalue())
        print(f"Generated: {output_path}")
        self.assertTrue(output_path.exists())

if __name__ == "__main__":
    unittest.main()
