from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import os
import sys
import time
import asyncio

# Import shared configuration
from config import logger, time_on_screen, FRAME_INTERVAL, MODEL_PATH

# Import telemetry manager
from telemetry import telemetry_manager

# Import the CameraManager class (not the instance)
from camera_feed import CameraManager

app = FastAPI()

# Load the YOLOv8 model
if not os.path.isfile(MODEL_PATH):
    logger.error(f"YOLO model file not found: {MODEL_PATH}")
    sys.exit(1)

model = YOLO(MODEL_PATH)

# Create the camera_manager instance with the model
camera_manager = CameraManager(model=model)

@app.get("/")
async def get():
    template_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    if not os.path.isfile(template_path):
        logger.error(f"Template not found at path: {template_path}")
        return HTMLResponse(content="Template not found.", status_code=404)
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        logger.error(f"Error reading template: {e}")
        return HTMLResponse(content="Internal server error.", status_code=500)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            start_time = time.time()

            data = await websocket.receive_text()
            try:
                header, encoded = data.split(",", 1)
                image_data = base64.b64decode(encoded)
            except Exception as e:
                logger.error(f"Error decoding base64 image: {e}")
                continue

            np_arr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.error("Failed to decode image")
                continue

            results = model(frame)
            annotated_frame = results[0].plot()

            desired_width, desired_height = 640, 480
            annotated_frame = cv2.resize(
                annotated_frame, (desired_width, desired_height), interpolation=cv2.INTER_AREA
            )

            detections = []
            for box in results[0].boxes:
                coordinates = box.xyxy.squeeze().tolist()
                if isinstance(coordinates, list) and len(coordinates) == 4:
                    rounded_coords = [round(coord, 2) for coord in coordinates]
                    detections.append({
                        "class": results[0].names[int(box.cls)],
                        "confidence": float(box.conf),
                        "coordinates": rounded_coords
                    })
                else:
                    detections.append({
                        "class": results[0].names[int(box.cls)],
                        "confidence": float(box.conf),
                        "coordinates": [0, 0, 0, 0]
                    })

            for det in detections:
                class_name = det["class"]
                if class_name in time_on_screen:
                    time_on_screen[class_name] += FRAME_INTERVAL
                else:
                    time_on_screen[class_name] = FRAME_INTERVAL

            _, buffer = cv2.imencode('.jpg', annotated_frame)
            encoded_image = base64.b64encode(buffer).decode('utf-8')

            response = {
                "image": f"data:image/jpeg;base64,{encoded_image}",
                "detections": detections,
                "time_on_screen": time_on_screen
            }

            await websocket.send_json(response)

            elapsed_time = time.time() - start_time
            sleep_time = FRAME_INTERVAL - elapsed_time
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        await websocket.close()

@app.websocket("/telemetry")
async def telemetry_endpoint(websocket: WebSocket):
    """Endpoint for system telemetry data"""
    try:
        await telemetry_manager.connect(websocket)
        while True:
            # Keep connection open, the telemetry_manager handles data sending
            await websocket.receive_text()
    except WebSocketDisconnect:
        await telemetry_manager.disconnect(websocket)
        logger.info("Telemetry client disconnected")
    except Exception as e:
        await telemetry_manager.disconnect(websocket)
        logger.error(f"Telemetry error: {e}")

@app.websocket("/camera_feed")
async def camera_feed_endpoint(websocket: WebSocket):
    """Endpoint for camera feed from Raspberry Pi"""
    try:
        await camera_manager.connect(websocket)  # <- This is where connection happens
        while True:
            # Keep connection open, the camera_manager handles frame sending
            await websocket.receive_text()
    except WebSocketDisconnect:
        await camera_manager.disconnect(websocket)
        logger.info("Camera feed client disconnected")
    except Exception as e:
        await camera_manager.disconnect(websocket)
        logger.error(f"Camera feed error: {e}")

# Clean up hardware on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    pass

if __name__ == "__main__":
    import uvicorn

    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=49078,  # This port number was chosen by the developer
            log_level="warning",
            reload=True,
        )
    except Exception as e:
        logger.error(f"Failed to start Uvicorn server: {e}")
        sys.exit(1)