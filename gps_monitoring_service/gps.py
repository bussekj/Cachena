import serial
import time
import requests
import random
# Created by Corey
# This is a temporary design to test GPS module location data to the database

# Example: $GPGLL,3908.53679,N,08437.66193,W,212204.00,A,A*73
url = "http://localhost:5000/api/tracker/update"

GPGLL_TAG = 0
GPGLL_Latitude = 1
GPGLL_NS_Indicator = 2
GPGLL_Longitude = 3
GPGLL_EW_Indicator = 4
GPGLL_UTC_TIME = 5
GPGLL_Status = 6

long_stats = []
lat_stats = []

def send_post_data(url, payload):
    print(url)
    print(payload)
    response = requests.post(url, json=payload)
    print(response.status_code)
    print(response.text)

def send_GPGLL_data(data):
    # if data[GPGLL_Status] != "A":
    #     print("Invalid Data!")
    #     return
    lat = float(data[GPGLL_Latitude][0:2]) + ( float(data[GPGLL_Latitude][2:]) / 60.0 )
    long = float(data[GPGLL_Longitude][0:3]) + ( float(data[GPGLL_Longitude][3:]) / 60.0 )
    print(f"{lat=}, {long=}")
    lat_stats.append(lat)
    long_stats.append(long)
    location = str(lat) + data[GPGLL_NS_Indicator] + "," + str(long)+ data[GPGLL_EW_Indicator]
    payload = {
        "id" : str(random.randint(1,3)),
        "location" : str(location),
        "battery" : str(random.randint(0,100))
    } 

    send_post_data(url, payload)
    
def read_serial_data(port_name, baud_rate):
    try:
        # Open the serial port with a timeout
        ser = serial.Serial(port_name, baud_rate, timeout=1) 
        time.sleep(2) # Wait for the connection to establish

        print(f"Listening on {port_name} at {baud_rate} baud rate...")

        while True:
            # Read a line from the serial port, decode it, and strip whitespace
            # .readline() waits for a newline character '\n' or a timeout
            data = ser.readline().decode('utf-8').rstrip()
            
            if data:
                print(f"Received: {data}")
                if "GPGLL" in data:
                    GLL_data = data.split(",")
                    print(len(GLL_data), GLL_data)
                    if len(GLL_data) == 8:
                        try:
                            send_GPGLL_data(GLL_data)
                            time.sleep(5)
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
        import numpy
        long_mean = numpy.mean(long_stats)
        long_var = numpy.var(long_stats)
        lat_mean = numpy.mean(lat_stats)
        lat_var = numpy.var(lat_stats)

        print("Longitude Stats")
        print(f"N={len(long_stats)} - {long_mean=}, {long_var=}")
        print("Latitude Stats")
        print(f"N={len(lat_stats)} - {lat_mean=}, {lat_var=}")

if __name__ == '__main__':
    SERIAL_PORT = "/dev/ttyACM0"  # Replace with your actual port name
    BAUD_RATE = 9600              # Replace with your device's baud rate (e.g., 115200)

    read_serial_data(SERIAL_PORT, BAUD_RATE)
