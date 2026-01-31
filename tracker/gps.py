import serial
import time

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

    except serial.SerialException as e:
        print(f"Serial Port Error: {e}")
    except KeyboardInterrupt:
        print("Program interrupted by user.")
    finally:
        if ser and ser.is_open:
            ser.close()
            print("Serial port closed.")

if __name__ == '__main__':
    SERIAL_PORT = "/dev/ttyACM0"  # Replace with your actual port name
    BAUD_RATE = 9600              # Replace with your device's baud rate (e.g., 115200)

    read_serial_data(SERIAL_PORT, BAUD_RATE)
