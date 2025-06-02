#!/bin/bash
# Entrypoint script to start all services

# Set default ports if not provided by Railway
export HTTP_PORT=${PORT:-8000}  # HTTP server gets the main PORT
export NODE_RED_PORT=${NODE_RED_PORT:-1880}  # Node-RED on internal port
export MQTT_PORT=${MQTT_PORT:-1883}

echo "Starting services..."
echo "HTTP server (main) will run on port: $HTTP_PORT"
echo "Node-RED (no authentication) will run on port: $NODE_RED_PORT"
echo "MQTT broker will run on port: $MQTT_PORT"

# Ensure data directory exists and copy flows
mkdir -p /data
echo "Setting up Node-RED flows..."

# Use flows.json as the primary flow file
if [ -f "/app/flows.json" ]; then
    echo "Using flows.json as the Node-RED flow"
    # Copy to standard location
    cp /app/flows.json /data/flows.json
    echo "Copied flows.json to /data/flows.json"
elif [ -f "/app/smartwatch-flow.json" ]; then
    echo "flows.json not found, using smartwatch-flow.json as fallback"
    cp /app/smartwatch-flow.json /data/flows.json
    echo "Copied smartwatch-flow.json to /data/flows.json"
else
    echo "WARNING: No flow files found!"
fi

# Check what was copied
echo "Content of /data:"
ls -la /data/

# Start Mosquitto MQTT broker in the background
mosquitto -c /app/mosquitto.conf &
MOSQUITTO_PID=$!

# Start Node-RED in the background with the internal port and settings
echo "Starting Node-RED on port $NODE_RED_PORT..."
NODE_RED_FLAGS="--settings /app/settings.js --userDir /data --port $NODE_RED_PORT --flowFile /data/flows.json"
echo "Node-RED command: node-red $NODE_RED_FLAGS"
node-red $NODE_RED_FLAGS &
NODE_RED_PID=$!

# Wait for Node-RED to start and log status
echo "Waiting for Node-RED to start (PID: $NODE_RED_PID)..."
sleep 20  # Increased wait time to ensure Node-RED is fully started

# Check if Node-RED is running
if kill -0 $NODE_RED_PID 2>/dev/null; then
    echo "Node-RED started successfully"
    echo "Checking Node-RED endpoints..."
    # Try to connect to Node-RED API endpoints
    echo "Testing /heartrate endpoint: "
    curl -v http://localhost:$NODE_RED_PORT/heartrate || echo "Heartrate endpoint not responding"
    echo "Testing /status endpoint: "
    curl -v http://localhost:$NODE_RED_PORT/status || echo "Status endpoint not responding"
else
    echo "ERROR: Node-RED failed to start properly"
fi

# Start the Python smartwatch simulator in the background
python3 smartwatch_simulator.py &
SIM_PID=$!

# Start the main HTTP server (serves dashboard and health check) on Railway's PORT
echo "Starting main HTTP server on port $HTTP_PORT..."
python3 health_server.py &
HTTP_PID=$!

# Wait a moment for HTTP server to start
sleep 2

echo "All services started successfully!"
echo "Main dashboard: http://localhost:$HTTP_PORT"
echo "Health check: http://localhost:$HTTP_PORT/health"
echo "Node-RED admin: http://localhost:$NODE_RED_PORT/admin (no authentication required)"

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $MOSQUITTO_PID $NODE_RED_PID $SIM_PID $HTTP_PID 2>/dev/null
    exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

# Wait for all background processes
wait
