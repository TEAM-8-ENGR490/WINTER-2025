import cv2
import base64
import json
import asyncio
import logging
from fastapi import WebSocket
from typing import List, Dict, Any

# Import shared configuration 
from config import logger, time_on_screen, FRAME_INTERVAL

class CameraManager:
    """
    Manages Raspberry Pi camera feed and object detection
    """
    def __init__(self, model=None):
        self.connected_clients: List[WebSocket] = []
        self._running = False
        self._task = None
        self.model = model  # Store the model instance
        
        # Attempt to determine if we have Pi Camera or need to use a USB camera
        self.camera_device = self._get_camera_device()
        
    def _get_camera_device(self) -> int:
        """Determine which camera device to use"""
        # This is a simple heuristic - in a real implementation, 
        # you might want to make this configurable
        try:
            # Try to use Pi Camera Module first (usually device 0)
            cap = cv2.VideoCapture(0)
            if cap.isOpened():
                cap.release()
                return 0
            
            # If that fails, try USB camera
            cap = cv2.VideoCapture(1)
            if cap.isOpened():
                cap.release()
                return 1
                
        except Exception as e:
            logger.error(f"Error detecting camera: {e}")
            
        # Default to device 0
        return 0
        
    async def connect(self, websocket: WebSocket):
        """Connect a new client"""
        await websocket.accept()
        self.connected_clients.append(websocket)
        logger.info(f"Camera feed client connected. {len(self.connected_clients)} clients connected.")
        
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._camera_loop())
    
    async def disconnect(self, websocket: WebSocket):
        """Disconnect a client"""
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)
            logger.info(f"Camera feed client disconnected. {len(self.connected_clients)} clients remain.")
        
        if len(self.connected_clients) == 0 and self._running:
            self._running = False
            if self._task:
                self._task.cancel()
                self._task = None
    
    async def _camera_loop(self):
        """Main loop for capturing camera frames and running detection"""
        cap = None
        try:
            # Check if model is available
            if self.model is None:
                logger.error("YOLO model not initialized")
                return
                
            # Open camera
            cap = cv2.VideoCapture(self.camera_device)
            if not cap.isOpened():
                logger.error(f"Could not open camera device {self.camera_device}")
                return
                
            # Set camera properties for better performance
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            logger.info(f"Camera feed started on device {self.camera_device}")
            
            while self._running and self.connected_clients:
                # Capture frame
                ret, frame = cap.read()
                if not ret:
                    logger.error("Failed to grab frame")
                    await asyncio.sleep(0.1)
                    continue
                
                # Process frame with YOLO
                results = self.model(frame)
                annotated_frame = results[0].plot()
                
                # Extract detections
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
                
                # Update time on screen
                for det in detections:
                    class_name = det["class"]
                    if class_name in time_on_screen:
                        time_on_screen[class_name] += FRAME_INTERVAL
                    else:
                        time_on_screen[class_name] = FRAME_INTERVAL
                
                # Encode the annotated frame
                _, buffer = cv2.imencode('.jpg', annotated_frame)
                encoded_image = base64.b64encode(buffer).decode('utf-8')
                
                # Prepare the message
                response = {
                    "image": f"data:image/jpeg;base64,{encoded_image}",
                    "detections": detections,
                    "time_on_screen": time_on_screen
                }
                
                # Send to all clients
                disconnected_clients = []
                for client in self.connected_clients:
                    try:
                        await client.send_json(response)
                    except Exception as e:
                        logger.error(f"Error sending frame: {e}")
                        disconnected_clients.append(client)
                
                # Clean up disconnected clients
                for client in disconnected_clients:
                    await self.disconnect(client)
                
                # Control frame rate
                await asyncio.sleep(FRAME_INTERVAL)
                
        except asyncio.CancelledError:
            logger.info("Camera loop cancelled")
        except Exception as e:
            logger.error(f"Error in camera loop: {e}")
        finally:
            self._running = False
            if cap is not None:
                cap.release()

# Do not create the singleton instance here
# Instead, we'll create it in main.py after the model is loaded
