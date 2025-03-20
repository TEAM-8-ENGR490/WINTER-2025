import psutil
import time
import json
import random
import platform
import logging
import asyncio
from fastapi import WebSocket
from typing import Dict, Any, List, Optional
import subprocess

# Don't import Pi-specific libraries at the module level
# Instead, import them inside functions where they're used
# with proper error handling

logger = logging.getLogger(__name__)

class TelemetryManager:
    """
    Manages telemetry data collection and distribution for the Raspberry Pi
    """
    def __init__(self):
        self.connected_clients: List[WebSocket] = []
        self._running = False
        self._task = None
        
        # For simulating sensor statuses - only include the sensors we have
        self._simulated_sensors = {
            "camera": "online",
            "lidar": "online",
            "ultrasonic": "online"
        }
        
        # Check if we're actually running on a Raspberry Pi
        self.is_raspberry_pi = platform.machine().startswith(('arm', 'aarch64'))
        if not self.is_raspberry_pi:
            logger.warning("Not running on a Raspberry Pi - using simulated data")
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connected_clients.append(websocket)
        logger.info(f"Telemetry client connected. {len(self.connected_clients)} clients connected.")
        
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._telemetry_loop())
    
    async def disconnect(self, websocket: WebSocket):
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)
            logger.info(f"Telemetry client disconnected. {len(self.connected_clients)} clients remain.")
        
        if len(self.connected_clients) == 0 and self._running:
            self._running = False
            if self._task:
                self._task.cancel()
                self._task = None
    
    async def _telemetry_loop(self):
        """Main loop for collecting and broadcasting telemetry data"""
        try:
            while self._running and self.connected_clients:
                telemetry_data = self._collect_telemetry()
                
                # Broadcast telemetry to all connected clients
                disconnected_clients = []
                for client in self.connected_clients:
                    try:
                        await client.send_json(telemetry_data)
                    except Exception as e:
                        logger.error(f"Error sending telemetry: {e}")
                        disconnected_clients.append(client)
                
                # Clean up disconnected clients
                for client in disconnected_clients:
                    await self.disconnect(client)
                
                # Wait before next update (1 second)
                await asyncio.sleep(1)
        
        except asyncio.CancelledError:
            logger.info("Telemetry loop cancelled")
        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")
            self._running = False
    
    def _collect_telemetry(self) -> Dict[str, Any]:
        """Collect system metrics"""
        try:
            if self.is_raspberry_pi:
                return self._collect_real_telemetry()
            else:
                return self._simulate_telemetry()
        except Exception as e:
            logger.error(f"Error collecting telemetry: {e}")
            return self._simulate_telemetry()
    
    def _collect_real_telemetry(self) -> Dict[str, Any]:
        """Collect actual system metrics from Raspberry Pi"""
        # CPU information
        cpu_usage = psutil.cpu_percent()
        cpu_freq = psutil.cpu_freq().current / 1000 if psutil.cpu_freq() else 1.5  # Convert to GHz
        
        # Try to get temperature - available on Raspberry Pi
        try:
            with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
                cpu_temp = float(f.read()) / 1000.0  # Convert from milliCelsius to Celsius
        except:
            cpu_temp = 0  # Default if not available
        
        # Memory information
        memory = psutil.virtual_memory()
        memory_used = memory.used
        memory_total = memory.total
        memory_percent = memory.percent
        
        # Network information (basic)
        network_connected = False
        for interface, stats in psutil.net_if_stats().items():
            if stats.isup and interface != 'lo':
                network_connected = True
                break
        
        # Sensor data would require checking if devices are connected
        # For real implementation, you would check if sensors are responding
        
        return {
            "isSimulated": False,
            "cpu": {
                "usage": round(cpu_usage, 2),
                "temperature": round(cpu_temp, 2),
                "frequency": round(cpu_freq, 2)
            },
            "memory": {
                "used": memory_used,
                "total": memory_total,
                "percentage": round(memory_percent, 2)
            },
            "network": {
                "status": "connected" if network_connected else "disconnected",
                "latency": round(self._get_network_latency(), 2),
                "type": self._detect_network_type()
            },
            "sensors": self._get_sensor_status()
        }
    
    def _detect_network_type(self) -> str:
        """Detect if using WiFi or Ethernet"""
        # Basic check - real implementation would be more sophisticated
        if self.is_raspberry_pi:
            try:
                # Check if wlan0 exists and is up
                wifi_exists = 'wlan0' in psutil.net_if_stats() and psutil.net_if_stats()['wlan0'].isup
                return "wifi" if wifi_exists else "ethernet"
            except:
                pass
        return "ethernet"
    
    def _get_sensor_status(self) -> Dict[str, str]:
        """Get actual sensor status with robust error handling"""
        if not self.is_raspberry_pi:
            return self._simulated_sensors
        
        sensor_status = {}
        
        # Camera check
        sensor_status["camera"] = self._check_camera()
        
        # LIDAR check
        sensor_status["lidar"] = self._check_lidar()
        
        # Ultrasonic check
        sensor_status["ultrasonic"] = self._check_ultrasonic()
        
        return sensor_status
    
    def _check_camera(self) -> str:
        """Check if the Raspberry Pi camera is connected and working"""
        try:
            result = subprocess.run(['vcgencmd', 'get_camera'], 
                         capture_output=True, text=True, timeout=3)
            
            # Parse output: should return "supported=1 detected=1" if camera is connected
            if "detected=1" in result.stdout:
                # Try to capture a test image
                try:
                    # Import picamera only when needed
                    import picamera
                    with picamera.PiCamera() as camera:
                        camera.capture('/tmp/test_image.jpg')
                    return "online"
                except ImportError:
                    logger.warning("picamera module not installed but camera detected")
                    return "warning"
                except Exception as e:
                    logger.warning(f"Camera detected but capture failed: {e}")
                    return "warning"
            else:
                logger.warning("Camera not detected by system")
                return "offline"
        except FileNotFoundError:
            # vcgencmd not available (not a Pi or command not found)
            logger.warning("vcgencmd not found - likely not running on a Pi")
            return "offline"
        except Exception as e:
            logger.error(f"Error checking camera: {e}")
            return "error"
    
    def _check_lidar(self) -> str:
        """Check if LIDAR sensor is connected and working"""
        try:
            # First check if I2C is enabled
            result = subprocess.run(['i2cdetect', '-y', '1'], 
                         capture_output=True, text=True, timeout=3)
            
            # Assuming LIDAR is on I2C address 0x62 (common for VL53L0X)
            # Adjust address as needed for your specific sensor
            if "62" in result.stdout:
                try:
                    # Import smbus only when needed
                    import smbus
                    # Example: Read a test value (simplified)
                    # In reality, you'd use the specific library for your LIDAR model
                    bus = smbus.SMBus(1)
                    bus.read_byte(0x62)  # Try reading a byte to confirm communication
                    return "online"
                except ImportError:
                    logger.warning("smbus module not installed but LIDAR detected")
                    return "warning"
                except Exception as e:
                    logger.warning(f"LIDAR detected but communication failed: {e}")
                    return "warning"
            else:
                logger.warning("LIDAR not detected on I2C bus")
                return "offline"
        except FileNotFoundError:
            # i2cdetect not available (not a Pi or command not found)
            logger.warning("i2cdetect not found - likely not running on a Pi")
            return "offline"
        except Exception as e:
            logger.error(f"Error checking LIDAR: {e}")
            return "error"
    
    def _check_ultrasonic(self) -> str:
        """Check if ultrasonic sensor is connected and working"""
        try:
            # Using GPIO for HC-SR04 ultrasonic sensor (common model)
            try:
                # Import RPi.GPIO only when needed
                import RPi.GPIO as GPIO
            except ImportError:
                logger.warning("RPi.GPIO module not installed")
                return "offline"
            
            # Define GPIO pins - adjust as needed
            TRIG_PIN = 23
            ECHO_PIN = 24
            
            # Set up GPIO
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(TRIG_PIN, GPIO.OUT)
            GPIO.setup(ECHO_PIN, GPIO.IN)
            
            # Ensure trigger is low
            GPIO.output(TRIG_PIN, False)
            time.sleep(0.1)
            
            # Send test pulse
            GPIO.output(TRIG_PIN, True)
            time.sleep(0.00001)  # 10 microsecond pulse
            GPIO.output(TRIG_PIN, False)
            
            # Wait for echo with timeout
            pulse_start = time.time()
            timeout = pulse_start + 1.0  # 1 second timeout
            
            # Wait for echo to go high
            while GPIO.input(ECHO_PIN) == 0:
                if time.time() > timeout:
                    raise TimeoutError("Echo pin never went high")
                pulse_start = time.time()
                
            # Wait for echo to go low
            while GPIO.input(ECHO_PIN) == 1:
                if time.time() > timeout:
                    raise TimeoutError("Echo pin never went low")
                pulse_end = time.time()
                
            # Calculate distance
            pulse_duration = pulse_end - pulse_start
            distance = pulse_duration * 17150  # Speed of sound in cm/s
            
            GPIO.cleanup([TRIG_PIN, ECHO_PIN])
            
            if 2 < distance < 400:  # Valid range for HC-SR04
                return "online"
            else:
                return "warning"  # Strange reading, but sensor is responding
                
        except TimeoutError as e:
            logger.warning(f"Ultrasonic sensor timeout: {e}")
            return "warning"
        except Exception as e:
            logger.error(f"Error checking ultrasonic sensor: {e}")
            return "error"
    
    def _simulate_telemetry(self) -> Dict[str, Any]:
        """Generate simulated telemetry data for development/testing"""
        # Simulate CPU data with realistic patterns
        cpu_usage = min(100, max(5, 30 + 15 * random.random() + 
                                10 * min(1, max(0, time.time() % 60 - 30) / 30)))
        
        # Simulated temperature follows CPU usage somewhat
        temperature = 35 + (cpu_usage / 100) * 25 + (random.random() * 5 - 2.5)
        
        # Simulated memory with realistic pattern
        memory_used = 1024 * 1024 * 1024 + random.randint(500, 1500) * 1024 * 1024  # 1.5-3.0 GB used
        memory_total = 4 * 1024 * 1024 * 1024  # 4GB for Raspberry Pi 4
        memory_percent = (memory_used / memory_total) * 100
        
        # Network data
        network_status = "connected"
        latency = self._get_network_latency()
        
        # Occasionally simulate sensor issues
        self._simulate_sensor_issues()
        
        return {
            "isSimulated": True,
            "cpu": {
                "usage": round(cpu_usage, 2),
                "temperature": round(temperature, 2),
                "frequency": round(1.5 + (cpu_usage / 100) * 0.5, 2)
            },
            "memory": {
                "total": memory_total,
                "used": memory_used,
                "percentage": round(memory_percent, 2)
            },
            "network": {
                "status": network_status,
                "latency": round(latency, 2),
                "type": "wifi" if random.random() > 0.3 else "ethernet",
                "signalStrength": round(random.uniform(60, 95), 2)
            },
            "sensors": self._simulated_sensors
        }
    
    def _get_network_latency(self) -> float:
        """Get or simulate network latency"""
        # Simulate latency with occasional spikes
        if random.random() < 0.05:  # 5% chance of latency spike
            return random.uniform(200, 500)
        else:
            return random.uniform(15, 120)
    
    def _simulate_sensor_issues(self):
        """Occasionally simulate sensor issues for more realistic dashboard testing"""
        # 2% chance per second of a sensor issue
        if random.random() < 0.02:
            sensors = list(self._simulated_sensors.keys())
            problem_sensor = random.choice(sensors)
            states = ["online", "warning", "error", "offline"]
            weights = [0.7, 0.15, 0.1, 0.05]  # mostly online
            self._simulated_sensors[problem_sensor] = random.choices(states, weights=weights)[0]
            
            # Auto-recover after a few seconds
            if self._simulated_sensors[problem_sensor] != "online":
                recovery_time = random.randint(5, 15)
                asyncio.create_task(self._recover_sensor(problem_sensor, recovery_time))
    
    async def _recover_sensor(self, sensor: str, delay: int):
        """Simulate sensor recovery after some time"""
        await asyncio.sleep(delay)
        self._simulated_sensors[sensor] = "online"

# Singleton instance
telemetry_manager = TelemetryManager()
