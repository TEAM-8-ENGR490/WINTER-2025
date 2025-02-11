import pigpio  # Ensure pigpio is imported
import time

class Servo:
    def __init__(self):
        """Initialize the Servo Motor with PWM channels."""
        self.claw_servo = 7   # Claw Open/Close (Servo 0)
        self.arm_servo = 8    # Arm Up/Down (Servo 1)

        # Initialize pigpio daemon
        self.PwmServo = pigpio.pi()
        if not self.PwmServo.connected:
            raise RuntimeError("❌ Could not connect to pigpio daemon. Start it with `sudo pigpiod`.")

        # Set GPIO pins to output
        self.PwmServo.set_mode(self.claw_servo, pigpio.OUTPUT)
        self.PwmServo.set_mode(self.arm_servo, pigpio.OUTPUT)

        # Set PWM frequency to 50Hz (Standard for servos)
        self.PwmServo.set_PWM_frequency(self.claw_servo, 50)
        self.PwmServo.set_PWM_frequency(self.arm_servo, 50)

        # Define servo direction mapping (normal or reversed)
        self.reverse_servo = {  
            "0": False,  # Claw (Normal)
            "1": True    # Arm (Reversed)
        }

    def angle_range(self, channel, angle):
        """Ensure the servo angle is within a safe range and apply reversal if needed."""
        if channel == "0":  # Claw Open/Close
            angle = max(0, min(angle, 90))    # Limit: 0° - 90°
        elif channel == "1":  # Arm Up/Down
            angle = max(90, min(angle, 150))  # Limit: 90° - 150°

        # If servo is reversed, invert the angle
        if self.reverse_servo[channel]:
            angle = 180 - angle

        return angle

    def setServoPwm(self, channel, angle):
        """Move the specified servo to the given angle."""
        channel_map = {"0": self.claw_servo, "1": self.arm_servo}

        if channel not in channel_map:
            print(f"❌ Invalid Servo Channel: {channel}")
            return

        angle = int(self.angle_range(channel, angle))
        pulse_width = int(500 + (angle / 180) * 2000)  # Convert angle to PWM pulse width
        self.PwmServo.set_servo_pulsewidth(channel_map[channel], pulse_width)
        
        print(f"🔄 Moved Servo {channel} to {angle}° (PWM: {pulse_width}μs)")

    def stop(self):
        """Move servos to a safe position before stopping and disable PWM."""
        print("🔄 Moving servos to resting position before stopping...")
        
        self.setServoPwm("0", 45)  # Move Claw to 45° (partially open)
        self.setServoPwm("1", 120)  # Move Arm to 120° (resting position)
        time.sleep(1)  # Give time to move

        # Fully disable PWM to prevent twitching
        self.PwmServo.set_servo_pulsewidth(self.claw_servo, 0)
        self.PwmServo.set_servo_pulsewidth(self.arm_servo, 0)
        self.PwmServo.set_mode(self.claw_servo, pigpio.INPUT)
        self.PwmServo.set_mode(self.arm_servo, pigpio.INPUT)
        
        print("🛑 Servos moved to safe position and stopped.")
