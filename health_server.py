#!/usr/bin/env python3
"""
Simple health check server for Railway deployment
Also serves static files from the current directory
"""
import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error
from urllib.parse import urlparse

class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"Received request for: {self.path}")
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            health_data = {
                'status': 'healthy',
                'services': {
                    'http_server': f'running on port {os.environ.get("PORT", "8000")} (main service)',
                    'node_red': f'running on port {os.environ.get("NODE_RED_PORT", "1880")} (internal, no authentication)',
                    'mqtt_broker': f'running on port {os.environ.get("MQTT_PORT", "1883")} (internal)',
                    'ecg_simulator': 'running (background process)'
                },
                'timestamp': __import__('datetime').datetime.now().isoformat(),
                'endpoints': {
                    'main_dashboard': '/',
                    'health_check': '/health',
                    'heartrate_api': '/api/heartrate',
                    'status_api': '/api/status',
                    'note': 'Node-RED admin interface is internal only (no authentication required)'
                }
            }
            self.wfile.write(json.dumps(health_data).encode())
        elif self.path.startswith('/api/'):
            # Proxy API calls to Node-RED
            self.proxy_to_nodered()
        elif self.path == '/' or self.path == '/index.html':
            # Serve the main dashboard
            super().do_GET()
        else:
            # Serve static files normally
            super().do_GET()
    
    def proxy_to_nodered(self):
        """Proxy API calls to the internal Node-RED server"""
        node_red_port = os.environ.get('NODE_RED_PORT', '1880')
        
        print(f"DEBUG: Incoming path: {self.path}")
        
        # Try both with and without /api prefix since there might be a config issue
        possible_paths = []
        
        if self.path == '/api/heartrate':
            possible_paths = ['/api/heartrate', '/heartrate']
        elif self.path == '/api/status':
            possible_paths = ['/api/status', '/status']
        else:
            print(f"WARNING: Unknown API path {self.path}")
            possible_paths = [self.path]
        
        # Try each possible path until one works
        for internal_path in possible_paths:
            node_red_url = f'http://localhost:{node_red_port}{internal_path}'
            print(f"DEBUG: Trying {self.path} -> {node_red_url}")
            
            try:
                # Forward the request to Node-RED
                with urllib.request.urlopen(node_red_url, timeout=5) as response:
                    # Copy response status and headers
                    self.send_response(response.status)
                    
                    # Copy content type if available
                    content_type = response.headers.get('Content-Type', 'application/json')
                    self.send_header('Content-Type', content_type)
                    
                    # Add CORS headers for web browser access
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    
                    self.end_headers()
                    
                    # Forward the response body
                    data = response.read()
                    self.wfile.write(data)
                    print(f"SUCCESS: {self.path} -> {node_red_url} (response size: {len(data)} bytes)")
                    return  # Success, exit function
                    
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    print(f"DEBUG: 404 for {node_red_url}, trying next path...")
                    continue  # Try next path
                else:
                    # Other HTTP error, don't continue trying
                    break
            except urllib.error.URLError as e:
                print(f"DEBUG: Connection error for {node_red_url}: {e}")
                break  # Connection problem, don't continue trying
            except Exception as e:
                print(f"DEBUG: Unexpected error for {node_red_url}: {e}")
                break
        
        # If we get here, all paths failed
        self.send_response(503)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_data = {
            'error': 'Node-RED Service Unavailable',
            'endpoint': self.path,
            'tried_urls': [f'http://localhost:{node_red_port}{p}' for p in possible_paths],
            'details': 'All endpoint variations returned 404 or connection error',
            'timestamp': __import__('datetime').datetime.now().isoformat(),
            'debug_info': {
                'node_red_port': node_red_port,
                'possible_paths': possible_paths
            }
        }
        self.wfile.write(json.dumps(error_data).encode())
        print(f"ERROR: All paths failed for {self.path}: {possible_paths}")

if __name__ == "__main__":
    PORT = int(os.environ.get('PORT', 8000))  # Use Railway's main PORT
    # For local testing, stay in current directory; for deployment, use /app
    if os.path.exists('/app'):
        os.chdir('/app')  # Change to app directory to serve static files
    with socketserver.TCPServer(("", PORT), HealthHandler) as httpd:
        print(f"Health check server running on port {PORT}")
        httpd.serve_forever()
