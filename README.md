# ECG Smartwatch Monitoring System

A real-time ECG and heart rate monitoring system that simulates smartwatch data collection and visualization. The system processes ECG data from a publicly available dataset and streams it via MQTT to a dashboard. **Fully containerized with Docker for easy local deployment.**

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Mosquitto  │  │  Node-RED   │  │  Smartwatch         │  │
│  │  MQTT       │◄─┤  Processor  │◄─┤  Simulator          │  │
│  │  :1883      │  │  :1880      │  │  (Python)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         ▲                 │                                 │
│         │                 ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            Health Server + Dashboard                   │  │
│  │                  :8000                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring & Debug Endpoints

Once running, you can monitor your system using these endpoints:

- **Dashboard**: `http://localhost:8000/` - Main ECG monitoring interface
- **Health Check**: `http://localhost:8000/health` - System health status
- **System Status**: `http://localhost:8000/api/status` - Detailed system information
- **Heart Rate API**: `http://localhost:8000/api/heartrate` - Real-time ECG data

## Debugging Features

- **Real-time logging** with timestamps for all components
- **MQTT message monitoring** to verify data flow
- **Node-RED debug nodes** enabled for data inspection
- **Health checks** for all services
- **Automatic restart** policies for failed services

## Features

- ✅ Real-time ECG signal visualization
- ✅ Heart rate monitoring and zone classification  
- ✅ MQTT-based communication between components
- ✅ Web-based dashboard for monitoring
- ✅ Node-RED flow for data processing
- ✅ Support for continuous data streaming with configurable parameters
- ✅ **Docker containerized for easy deployment**
- ✅ **Comprehensive monitoring and debugging**
- ✅ **No dummy data - real ECG processing only**

## System Architecture

The system consists of the following components:

1. **ECG Processor** (`ecg_processor.py`) - Library for processing ECG data, calculating heart rates, and visualizing signals
2. **Smartwatch Simulator** (`smartwatch_simulator.py`) - Simulates a smartwatch by reading ECG data and streaming it over MQTT
3. **Node-RED Flow** (`smartwatch-flow.json`) - Processes incoming MQTT messages and exposes an API for the dashboard
4. **Web Dashboard** (`index.html`) - Web interface for visualizing ECG signals and heart rate data
5. **Health Server** (`health_server.py`) - Serves the dashboard and provides API endpoints

## Docker Setup

The easiest way to run this system locally is using Docker. The system is containerized and all dependencies are automatically installed.

### Prerequisites

- Docker installed on your system
- Dataset: [ECG GSR Emotions Dataset](https://data.mendeley.com/datasets/g2p7vwxyn2/4)

### Setting Up Docker on Ubuntu

1. **Update your system**:
```bash
sudo apt update
sudo apt upgrade -y
```

2. **Install Docker**:
```bash
# Remove any old Docker installations
sudo apt remove docker docker-engine docker.io containerd runc

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index and install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

3. **Configure Docker (Optional but recommended)**:
```bash
# Add your user to the docker group to run Docker without sudo
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

4. **Verify Docker installation**:
```bash
docker --version
docker run hello-world
```

### Setting Up Docker on macOS

1. **Install Docker Desktop**:
   - Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Launch Docker from Applications

2. **Alternative: Install using Homebrew**:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop via Homebrew
brew install --cask docker
```

3. **Start Docker Desktop**:
   - Open Docker Desktop from Applications
   - Follow the setup wizard
   - Docker will start automatically when setup is complete

4. **Verify Docker installation**:
```bash
docker --version
docker run hello-world
```

### Setting Up the Dataset

1. **Download the dataset**:
   - Go to [ECG GSR Emotions Dataset](https://data.mendeley.com/datasets/g2p7vwxyn2/4)
   - Click "Download all" and extract the `ECG_GSR_Emotions` folder
   - Rename the extracted folder to `dataset`
   - Place it in the project root directory

2. **Verify dataset structure**:
```bash
# Your project directory should look like this:
ls -la
# Should show:
# dataset/
# Dockerfile
# requirements.txt
# ... other project files
```

## Running the System with Docker

### Option 1: Build and Run Locally

1. **Clone the repository** (if you haven't already):
```bash
git clone <your-repo-url>
cd SE_Project
```

2. **Build the Docker image**:
```bash
docker build -t ecg-monitoring .
```

3. **Run the container**:
```bash
docker run -p 8000:8000 ecg-monitoring
```

4. **Access the application**:
   - Open your browser and go to `http://localhost:8000`
   - The dashboard will be available immediately
   - Health check: `http://localhost:8000/health`
   - API endpoints: `http://localhost:8000/api/heartrate` and `http://localhost:8000/api/status`

### Option 2: Using Docker Compose (Future Enhancement)

For easier management, you can create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  ecg-monitoring:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - NODE_RED_PORT=1880
      - MQTT_PORT=1883
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

### Docker Environment Variables

You can customize the container behavior using environment variables:

```bash
docker run -p 8000:8000 \
  -e PORT=8000 \
  -e NODE_RED_PORT=1880 \
  -e MQTT_PORT=1883 \
  ecg-monitoring
```

### Stopping the Container

```bash
# Find the container ID
docker ps

# Stop the container
docker stop <container-id>

# Or stop all running containers
docker stop $(docker ps -q)
```

### Viewing Logs

```bash
# View real-time logs
docker logs -f <container-id>

# View last 100 lines of logs
docker logs --tail 100 <container-id>
```

### Troubleshooting Docker Issues

**Issue**: Permission denied when running Docker commands
**Solution**: 
```bash
# On Ubuntu, add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Issue**: Port already in use
**Solution**:
```bash
# Use a different port
docker run -p 8080:8000 ecg-monitoring

# Or find and stop the process using the port
sudo lsof -i :8000
sudo kill -9 <PID>
```

**Issue**: Container exits immediately
**Solution**:
```bash
# Check the logs for error messages
docker logs <container-id>

# Run interactively to debug
docker run -it ecg-monitoring /bin/bash
```

## Configuration

The system uses a central configuration file (`config.py`) to manage all settings. This makes it easy to modify parameters without having to search through multiple files.

### Available Configuration Parameters

- **MQTT Configuration**:
  - `MQTT_BROKER`: MQTT broker address (default: "localhost")
  - `MQTT_PORT`: MQTT broker port (default: 1883)
  - `MQTT_QOS`: Quality of Service level (default: 0)
  - `MQTT_TOPIC_PREFIX`: Topic prefix for MQTT messages (default: "smartwatch")

- **Dataset Configuration**:
  - `BASE_PATH`: Path to the dataset directory
  - `DEFAULT_SESSION`: Default session number to use (default: 1)
  - `DEFAULT_PARTICIPANT`: Default participant number to use (default: 1)

- **Simulator Configuration**:
  - `DEFAULT_DATA_INTERVAL`: Time interval between data points in seconds (default: 1.0)
  - `DEFAULT_LOOP_FOREVER`: Whether to loop data continuously (default: False)
  - `DEFAULT_MAX_VIDEOS`: Maximum number of videos to include per participant (default: None)
  - `DEFAULT_RANDOM_PARTICIPANTS`: Whether to randomly select participants when looping (default: False)

- **ECG Processing Configuration**:
  - `SAMPLING_RATE`: ECG signal sampling rate in Hz (default: 1000)

- **Heart Rate Zones**:
  - Defines heart rate zones and their corresponding labels:
    - Zone 0: Below normal (< 40 BPM)
    - Zone 1: Rest (40-60 BPM)
    - Zone 2: Light activity (61-90 BPM)
    - Zone 3: Moderate activity (91-110 BPM)
    - Zone 4: Intense activity (111-130 BPM)
    - Zone 5: Maximum effort (131+ BPM)

### Modifying Configuration in Docker

To modify configuration when running in Docker, you can:

1. **Use environment variables** (recommended):
```bash
docker run -p 8000:8000 \
  -e MQTT_BROKER=localhost \
  -e MQTT_PORT=1883 \
  -e DEFAULT_PARTICIPANT=5 \
  ecg-monitoring
```

2. **Mount a custom config file**:
```bash
# Create a custom config.py file locally
# Then mount it into the container
docker run -p 8000:8000 \
  -v $(pwd)/custom_config.py:/app/config.py \
  ecg-monitoring
```

## Command Line Arguments for Smartwatch Simulator

The smartwatch simulator supports various command line arguments that can be configured in the Docker container:

```
usage: smartwatch_simulator.py [-h] [--broker BROKER] [--port PORT] 
                               [--qos {0,1,2}] [--session SESSION]
                               [--participant PARTICIPANT] [--topic TOPIC]
                               [--interval INTERVAL] [--loop] [--random]
                               [--max-videos MAX_VIDEOS]

Smartwatch ECG Simulator

optional arguments:
  -h, --help            show this help message and exit
  --broker BROKER       MQTT broker address
  --port PORT           MQTT broker port
  --qos {0,1,2}         MQTT QoS level
  --session SESSION     Session number from the dataset
  --participant PARTICIPANT
                        Participant number from the dataset
  --topic TOPIC         MQTT topic prefix
  --interval INTERVAL   Data transmission interval in seconds
  --loop                Loop the data continuously
  --random              Randomly select participants when looping
  --max-videos MAX_VIDEOS
                        Maximum number of videos to include per participant
```

## Development

### Building Custom Docker Images

To build a custom version of the Docker image:

```bash
# Build with a custom tag
docker build -t my-ecg-monitoring:latest .

# Build with build arguments
docker build --build-arg PYTHON_VERSION=3.11 -t ecg-monitoring:python3.11 .
```

### Running Development Mode

For development, you can mount your local code into the container:

```bash
docker run -p 8000:8000 \
  -v $(pwd):/app \
  -v $(pwd)/dataset:/app/dataset \
  ecg-monitoring
```

This allows you to make changes to the code without rebuilding the image.