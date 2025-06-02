# ECG Smartwatch Monitoring System

A real-time ECG and heart rate monitoring system that simulates smartwatch data collection and visualization. The system processes ECG data from a publicly available dataset and streams it via MQTT to a dashboard.

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Docker Container                           │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │
│  │   Smartwatch        │    │    Health Server            │   │
│  │   Simulator         │    │    (Python)                 │   │
│  │   (Python)          │    │    :8000                    │   │
│  └─────────────────────┘    │  ┌─────────────────────────┐│   │
│           │                 │  │   Dashboard + Proxy     ││   │
│           │ publishes       │  │   (index.html + APIs)   ││   │
│           │ ECG data        │  └─────────────────────────┘│   │
│           ▼                 └─────────────────────────────┘   │
│  ┌─────────────────────┐                   ▲                  │
│  │   Mosquitto MQTT    │                   │ proxies          │
│  │   Broker            │                   │ /api/* calls     │
│  │   :1883             │                   │                  │
│  └─────────────────────┘                   │                  │
│           ▲                                │                  │
│           │ subscribes                     │                  │
│           │ to topics                      │                  │
│           ▼                                │                  │
│  ┌─────────────────────┐                   │                  │
│  │   Node-RED          │───────────────────┘                  │
│  │   Flow Processor    │ exposes /api/heartrate               │
│  │   :1880             │     and /api/status                  │
│  └─────────────────────┘                                      │
└───────────────────────────────────────────────────────────────┘
```

## Monitoring Endpoints

Once running, you can monitor your system using these endpoints:

- **Dashboard**: `http://localhost:8000/` - Main ECG monitoring interface
- **Health Check**: `http://localhost:8000/health` - System health status
- **System Status**: `http://localhost:8000/api/status` - Detailed system information
- **Heart Rate API**: `http://localhost:8000/api/heartrate` - Real-time ECG data


## Features

- Real-time ECG signal visualization
- Heart rate monitoring and zone classification  
- MQTT-based communication between components
- Web-based dashboard for monitoring
- Node-RED flow for data processing
- Support for continuous data streaming with configurable parameters

## System Architecture

The system consists of the following components:

1. **ECG Processor** (`ecg_processor.py`) - Library for processing ECG data, calculating heart rates, and visualizing signals
2. **Smartwatch Simulator** (`smartwatch_simulator.py`) - Simulates a smartwatch by reading ECG data and streaming it over MQTT
3. **Node-RED Flow** (`flows.json`) - Processes incoming MQTT messages and exposes an API for the dashboard
4. **Web Dashboard** (`index.html`) - Web interface for visualizing ECG signals and heart rate data
5. **Health Server** (`health_server.py`) - Serves the dashboard and provides API endpoints

## Docker Setup

### Build and Run

1. **Build the Docker image**:
```bash
docker build -t ecg-monitoring .
```

2. **Run the container**:
```bash
docker run -p 8000:8000 ecg-monitoring
```

3. **Access the application**:
   - Open your browser and go to `http://localhost:8000`

## Configuration

The system uses a central configuration file (`config.py`) to manage all settings.

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
  - `SAMPLING_RATE`: ECG signal sampling rate in Hz (default: 128)

- **Heart Rate Zones**:
  - Defines heart rate zones and their corresponding labels:
    - Zone 0: Below normal (< 40 BPM)
    - Zone 1: Rest (40-60 BPM)
    - Zone 2: Light activity (61-90 BPM)
    - Zone 3: Moderate activity (91-110 BPM)
    - Zone 4: Intense activity (111-130 BPM)
    - Zone 5: Maximum effort (131+ BPM)

## Command Line Arguments for Smartwatch Simulator

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