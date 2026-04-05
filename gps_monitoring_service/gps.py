import serial
import time
import requests
import random
import json
from jsonschema import validate, ValidationError

# Created by Corey
GPS_schema = {
    "id":"number",
    "lat":"number",
    "lon":"number",
    "battery":"number"
}
def send_post_data(url, payload):
    print(f'{url=}\n{payload=}')
    response = requests.post(url, json=payload)
    print(response.status_code)
    print(response.text)

# Example: $GPGLL,3908.53679,N,08437.66193,W,212204.00,A,A*73
url = "http://localhost:5000/api/tracker/update"
# Example GPS SerialData: 
def validate_GPS_data(data):
    if not "GPSDATA:" in data:
        return False
    try:
        validate(instance=data, schema=GPS_schema)
    except ValidationError as e:
        print(f"Validation failed: {e.message}")
        return False
    return True
def format_data(data):
    data = data.split(",")
    acc = ""
    for line in data:
        header, value = line.split(":")
        header = '"' + header + '"'
        acc += header + ':' + value + ","
    return "{" + acc.strip(',') + "}"
def read_serial_data(port_name, baud_rate):
    try:
        # Open the serial port with a timeout
        ser = serial.Serial(port_name, baud_rate) 
        time.sleep(2) # Wait for the connection to establish

        print(f"Listening on {port_name} at {baud_rate} baud rate...")

        while True:
            # Read a line from the serial port, decode it, and strip whitespace
            # .readline() waits for a newline character '\n' or a timeout
            data = ser.readline().decode('utf-8').strip("\r\n")
            data = data.replace('\x00', '')
            if data:
                print(f"Received: {data}")
                if validate_GPS_data(data):
                    data = data.split('GPSDATA:')[1]
                    # payload = format_data(data)
                    # print(payload)
                    payload = json.loads(data)
                    try:
                        send_post_data(url, payload)
                    except: 
                        print("Failed to send")

    except serial.SerialException as e:
        print(f"Serial Port Error: {e}")
    except KeyboardInterrupt:
        print("Program interrupted by user.")
    finally:
        if ser and ser.is_open:
            ser.close()
            print("Serial port closed.")

if __name__ == '__main__':
    SERIAL_PORT = "/dev/ttyUSB0"  # Replace with your actual port name
    BAUD_RATE = 115200              # Replace with your device's baud rate (e.g., 115200)

    read_serial_data(SERIAL_PORT, BAUD_RATE)
