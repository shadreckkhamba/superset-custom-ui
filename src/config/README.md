# API Endpoints Configuration

This file contains all the IP addresses and API endpoints used throughout the application to avoid hardcoding them in individual files.

## File: `endpoints.js`

Contains:
- **API_SERVERS**: Object with all IP addresses
- **API_PORT**: The port number used by APIs
- **BASE_URLS**: Complete base URLs for different services
- **ENDPOINTS**: Full endpoint URLs ready to use

## Usage

Instead of hardcoding URLs like:
```javascript
fetch('http://192.168.10.118:5001/wandikweza/daily_average_stay')
```

Import and use the configuration:
```javascript
import { ENDPOINTS } from '../config/endpoints';

fetch(ENDPOINTS.DAILY_AVERAGE_STAY)
```

## Updating IP Addresses

To change IP addresses:
1. Edit the `API_SERVERS` object in `endpoints.js`
2. All files using the configuration will automatically use the new IPs

## Current IP Addresses

- **PRIMARY**: 192.168.10.118 (main API server)
- **STATUS_PRIMARY**: 192.168.1.102 (primary status API)
- **STATUS_SECONDARY**: 198.251.76.216 (secondary status API)

All APIs use port **5001**.