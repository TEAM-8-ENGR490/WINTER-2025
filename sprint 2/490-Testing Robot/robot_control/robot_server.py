import socket
import time
from Motor import *
from servo import *

# Initialize motor control and servo control
PWM = Motor()
servo = Servo()  

# Set up TCP server
HOST = "0.0.0.0"  # Listen on all interfaces
PORT = 6000  # Port for communication

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen(1)

print(f"🚗 Waiting for connection on port {PORT}...")

conn, addr = server_socket.accept()
print(f"🔗 Connected by {addr}")

def move_motors(direction, duration):
    """Move motors in the given direction for the specified duration."""
    
    if direction == "forward":
        PWM.setMotorModel(-2000, -2000)  # Move forward
    elif direction == "backward":
        PWM.setMotorModel(2000, 2000)  # Move backward
    elif direction == "left":
        PWM.setMotorModel(-1500, 1500)  # Turn left
    elif direction == "right":
        PWM.setMotorModel(1500, -1500)  # Turn right
    elif direction == "stop":
        PWM.setMotorModel(0, 0)  # Stop
        return
    
    print(f"🚀 Moving {direction} for {duration} seconds...")
    time.sleep(duration)
    PWM.setMotorModel(0, 0)  # Stop after the given time
    print("🛑 Stopped.")

def control_servo(servo_id, angle):
    """Move a specific servo to the given angle."""
    try:
        servo.setServoPwm(str(servo_id), angle)
        print(f"🔄 Moved Servo {servo_id} to {angle}°")
    except Exception as e:
        print(f"❌ Error moving Servo {servo_id}: {e}")

try:
    while True:
        data = conn.recv(1024).decode().strip()
        if not data:
            break
        
        print(f"📩 Received command: {data}")
        
        parts = data.split()
        
        if len(parts) == 2 and parts[0] in ["forward", "backward", "left", "right"]:
            direction = parts[0]
            try:
                duration = float(parts[1])
                move_motors(direction, duration)
            except ValueError:
                print("❌ Invalid duration received!")

        elif len(parts) == 3 and parts[0] == "servo":
            try:
                servo_id = parts[1]
                angle = int(parts[2])
                control_servo(servo_id, angle)
            except ValueError:
                print("❌ Invalid servo command!")

        elif data == "servo stop":
            servo.stop()
            print("🛑 Stopped all servos.")

        elif data == "stop":
            PWM.setMotorModel(0, 0)
            print("🛑 Robot stopped.")

        elif data == "exit":
            print("🚪 Shutting down server...")
            break

        else:
            print("❌ Invalid command received!")

except KeyboardInterrupt:
    print("🛑 Stopping server...")

finally:
    PWM.setMotorModel(0, 0)  # Ensure motors stop
    servo.stop()  # Ensure servos stop
    conn.close()
    server_socket.close()
    print("🔌 Server disconnected.")
