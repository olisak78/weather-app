// src/types/index.ts
export interface Location {
  symbol_number: number;
  name_in_hebrew: string;
  name_in_english: string;
  X: number; // ITM X coordinate
  Y: number; // ITM Y coordinate
}

export interface CachedLocationData {
  locations: Location[];
  timestamp: number;
}

export interface FetchLocationsResponse {
  locations: Location[];
  source: 'cache' | 'api' | 'expired-cache';
  timestamp: number;
}

export interface ApiResponse {
  help: string;
  success: boolean;
  result: {
    include_total: boolean;
    limit: number;
    records_format: string;
    resource_id: string;
    total_estimation_threshold: null;
    records: Array<{
      _id: number;
      symbol_number: number;
      name_in_hebrew: string;
      name_in_english: string;
      X: number;
      Y: number;
    }>;
  };
}

export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherData {
  location: WeatherLocation;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  humidity: number;
  vis_km: number;
  vis_miles: number;
}

export interface WeatherApiResponse {
  location: WeatherLocation;
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: WeatherCondition;
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
    short_rad: number;
    diff_rad: number;
    dni: number;
    gti: number;
  };
}

export interface WeatherApiError {
  error: {
    code: number;
    message: string;
  };
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'he';
export type Units = 'metric' | 'imperial';

// Cache configuration for Weather
export const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_CACHE_SIZE = 50; // Maximum number of cached locations

// Cache configuration for Locations
export const CACHE_KEY = 'israeli_locations_cache';
export const CACHE_DURATION_LOCATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const MAX_SEARCH_RESULTS = 50; // limit results for performance

export const API_KEY = '33e82af910564a92a3591251251408';
export const WEATHER_API_BASE_URL =
  'https://api.weatherapi.com/v1/current.json';
export const LOCATIONS_API_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=e9701dcb-9f1c-43bb-bd44-eb380ade542f';
