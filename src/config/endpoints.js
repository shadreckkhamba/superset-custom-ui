/**
 * API Endpoints Configuration
 * Central place to manage all IP addresses and API endpoints
 */

// API Server IPs
export const API_SERVERS = {
  PRIMARY: '192.168.10.118',
  STATUS_PRIMARY: '192.168.10.118', 
  STATUS_SECONDARY: '192.168.10.118'
};

// API Port
export const API_PORT = '5001';

// Base URLs
export const BASE_URLS = {
  PRIMARY: `http://${API_SERVERS.PRIMARY}:${API_PORT}`,
  STATUS_PRIMARY: `http://${API_SERVERS.STATUS_PRIMARY}:${API_PORT}`,
  STATUS_SECONDARY: `http://${API_SERVERS.STATUS_SECONDARY}:${API_PORT}`
};

// API Endpoints
export const ENDPOINTS = {
  DAILY_AVERAGE_STAY: `${BASE_URLS.PRIMARY}/wandikweza/daily_average_stay`,
  STAY_TIMES_DISTRIBUTION: `${BASE_URLS.PRIMARY}/wandikweza/stay_times_distribution`,
  STAY_TIMES_TREND: `${BASE_URLS.PRIMARY}/wandikweza/stay_times_trend`,
  PATIENT_RECORDS: `${BASE_URLS.PRIMARY}/wandikweza/patient_records`,
  LAST_UPDATE_STATUS: `${BASE_URLS.STATUS_PRIMARY}/wandikweza/last_update_status`,
  LAST_UPDATE_STATUS_SECONDARY: `${BASE_URLS.STATUS_SECONDARY}/wandikweza/last_update_status`
};
