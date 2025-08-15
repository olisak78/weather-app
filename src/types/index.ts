export interface Location {
  city_code: number;
  city_name_he: string;
  city_name_en: string;
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
    q: any;
    records_format: string;
    resource_id: string;
    total_estimation_threshold: null;
    records: Array<{
      _id: number;
      city_code: number;
      city_name_he: string;
      city_name_en: string;
      region_code: number;
      region_name: string;
      PIBA_bureau_code: number;
      PIBA_bureau_name: string;
      Regional_Council_code: number;
      Regional_Council_name: string;
      'rank city_name_en': number;
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

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'he';
export type Units = 'metric' | 'imperial';
