# Dockerfile for ECG pipeline
FROM python:3.10-slim

# Install Node-RED, Mosquitto (MQTT broker), and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl nodejs npm mosquitto mosquitto-clients && \
    npm install -g --unsafe-perm node-red && \
    mkdir -p /var/run/mosquitto /var/log/mosquitto && \
    chown -R mosquitto: /var/run/mosquitto /var/log/mosquitto && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node-RED Dashboard globally for UI nodes
RUN npm install -g --unsafe-perm node-red-dashboard

# Set workdir
WORKDIR /app

# Copy project files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose ports: 1880 (Node-RED), 1883 (MQTT), 8000 (dashboard)
# Railway will automatically bind to $PORT, but we expose the internal ports
EXPOSE 1880 1883 8000

# Create directory for Node-RED data
RUN mkdir -p /data

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
