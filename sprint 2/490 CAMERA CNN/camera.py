import cv2
from ultralytics import YOLO
from threading import Thread

# Load the YOLOv8 model from the file in the same directory.
model = YOLO("trained_yolov8_model.pt")

# Define your Raspberry Pi's IP and port.
raspberry_pi_ip = "10.0.0.118"
port = "5000"  # Must match the port used by your libcamera-vid command.

# Construct the stream URL.
# To use UDP instead of TCP, change 'tcp' to 'udp' below.
stream_url = f"tcp://{raspberry_pi_ip}:{port}"

class VideoStream:
    def __init__(self, src):
        self.cap = cv2.VideoCapture(src)
        if not self.cap.isOpened():
            raise ValueError("Error: Cannot open stream. Check IP and port.")
        self.ret, self.frame = self.cap.read()
        self.stopped = False

    def start(self):
        Thread(target=self.update, daemon=True).start()
        return self

    def update(self):
        # Continuously update the frame from the stream.
        while not self.stopped:
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to grab frame.")
                self.stop()
            else:
                self.frame = frame

    def read(self):
        # Return the most recent frame.
        return self.frame

    def stop(self):
        # Stop the thread and release the video capture.
        self.stopped = True
        self.cap.release()

# Start the threaded video stream.
stream = VideoStream(stream_url).start()

while True:
    # Grab the latest frame.
    frame = stream.read()
    if frame is None:
        continue

    # Optionally flip the frame vertically if needed.
    frame = cv2.flip(frame, 0)

    # Run YOLOv8 inference on the frame.
    results = model(frame)

    # Get the annotated frame with bounding boxes and labels drawn.
    annotated_frame = results[0].plot()

    # Display the annotated frame.
    cv2.imshow("Raspberry Pi Camera Stream with YOLOv8", annotated_frame)

    # Exit if 'q' is pressed.
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Clean up.
stream.stop()
cv2.destroyAllWindows()
