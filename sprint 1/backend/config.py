import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.WARNING,  # Reduced logging level for performance
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Common configuration values
TARGET_FPS = 30
FRAME_INTERVAL = 1 / TARGET_FPS  # Time per frame in seconds

# Model path
MODEL_PATH = "trained_yolov8_model.pt"

# Time on screen tracking
time_on_screen = {}
