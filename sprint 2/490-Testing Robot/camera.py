import cv2
from ultralytics import YOLO  # Import the YOLO class

# Load the YOLOv8 model from the file in the same directory
model = YOLO("trained_yolov8_model.pt")

# Replace with your Raspberry Pi's IP and port
raspberry_pi_ip = "100.73.143.76"
port = "5000"  # Must match the port used by your `libcamera-vid` command

stream_url = f"tcp://{raspberry_pi_ip}:{port}"
cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print("Error: Cannot open stream. Check IP and port.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        break

    # Optionally flip the frame vertically if needed
    frame = cv2.flip(frame, 0)

    # Run YOLOv8 inference on the frame.
    results = model(frame)

    # Get the annotated frame with bounding boxes and labels drawn on it
    annotated_frame = results[0].plot()

    # Display the annotated frame
    cv2.imshow("Raspberry Pi Camera Stream with YOLOv8", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
