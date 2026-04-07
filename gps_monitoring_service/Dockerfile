FROM docker.io/library/python:3.10-slim

WORKDIR /usr/src/app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start the monitoring script (using -u to ensure real-time print logs)
CMD ["python", "-u", "gps.py"]