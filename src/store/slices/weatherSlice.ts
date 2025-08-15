import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Location,
  WeatherData,
  WeatherApiResponse,
  WeatherApiError,
} from '../../types';
import {
  itmToLatLng,
  formatCoordinatesForWeatherAPI,
  validateIsraeliCoordinates,
} from '../../utils/coordinateUtils';

interface WeatherState {
  selectedLocation: Location | null;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  usedCoordinates: boolean; // Track if we used coordinates as fallback
  fromCache: boolean; // Track if data came from cache
}

const initialState: WeatherState = {
  selectedLocation: null,
  weatherData: null,
  loading: false,
  error: null,
  usedCoordinates: false,
  fromCache: false,
};

const API_KEY = '33e82af910564a92a3591251251408';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';

// Enhanced async thunk for fetching weather data with coordinate fallback
export const fetchWeatherData = createAsyncThunk<
  { weatherData: WeatherData; usedCoordinates: boolean },
  { location: Location; language?: string },
  { rejectValue: string }
>(
  'weather/fetchWeatherData',
  async ({ location, language = 'en' }, { rejectWithValue }) => {
    try {
      console.log('Fetching weather for location:', location);

      // Always use English name for weather API, regardless of selected language
      const locationQuery = location.name_in_english;

      // First attempt: Try with location name
      let response = await fetch(
        `${WEATHER_API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
          locationQuery
        )}&aqi=no`
      );

      let data: WeatherApiResponse | WeatherApiError;
      let usedCoordinates = false;

      if (response.ok) {
        data = await response.json();

        // Check if it's an error response
        if ('error' in data) {
          console.log('Weather API returned error:', data.error);
          throw new Error(`Weather API error: ${data.error.message}`);
        }

        // Check if the country is Israel
        if (data.location.country.toLowerCase() !== 'israel') {
          console.log(
            `Location found but not in Israel (${data.location.country}). Trying with coordinates...`
          );
          throw new Error('Location not in Israel');
        }

        console.log('Successfully fetched weather by location name');
      } else {
        console.log(
          'Initial weather request failed, trying with coordinates...'
        );
        throw new Error('Location not found');
      }

      // If we reach here without throwing, we have valid data
      if ('error' in data) {
        throw new Error(`Weather API error: ${(data.error as any).message}`);
      }

      // Transform the API response to our WeatherData structure
      const weatherData: WeatherData = {
        location: data.location,
        last_updated: data.current.last_updated,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition,
        wind_mph: data.current.wind_mph,
        wind_kph: data.current.wind_kph,
        wind_dir: data.current.wind_dir,
        pressure_mb: data.current.pressure_mb,
        pressure_in: data.current.pressure_in,
        humidity: data.current.humidity,
        vis_km: data.current.vis_km,
        vis_miles: data.current.vis_miles,
      };

      return { weatherData, usedCoordinates };
    } catch (firstError) {
      console.log('First attempt failed, trying with coordinates:', firstError);

      try {
        // Second attempt: Try with coordinates
        if (!location.X || !location.Y) {
          throw new Error('No coordinates available for location');
        }

        // Convert ITM coordinates to Lat/Lng
        const { latitude, longitude } = itmToLatLng(location.X, location.Y);

        console.log(
          `Converted ITM coordinates (${location.X}, ${location.Y}) to Lat/Lng (${latitude}, ${longitude})`
        );

        // Validate coordinates are within Israel bounds
        if (!validateIsraeliCoordinates(latitude, longitude)) {
          throw new Error('Converted coordinates are outside Israel bounds');
        }

        // Format coordinates for weather API
        const coordinateQuery = formatCoordinatesForWeatherAPI(
          latitude,
          longitude
        );

        console.log('Fetching weather with coordinates:', coordinateQuery);

        const coordinateResponse = await fetch(
          `${WEATHER_API_BASE_URL}?key=${API_KEY}&q=${coordinateQuery}&aqi=no`
        );

        if (!coordinateResponse.ok) {
          throw new Error(
            `Weather API error with coordinates! status: ${coordinateResponse.status}`
          );
        }

        const coordinateData: WeatherApiResponse | WeatherApiError =
          await coordinateResponse.json();

        // Check if it's an error response
        if ('error' in coordinateData) {
          throw new Error(
            `Weather API error with coordinates: ${coordinateData.error.message}`
          );
        }

        // Double-check the country is Israel (should be, since we're using Israeli coordinates)
        if (coordinateData.location.country.toLowerCase() !== 'israel') {
          console.warn(
            `Warning: Coordinate-based location shows country as ${coordinateData.location.country}, but continuing...`
          );
        }

        console.log('Successfully fetched weather by coordinates');

        // Transform the API response to our WeatherData structure
        const weatherData: WeatherData = {
          location: coordinateData.location,
          last_updated: coordinateData.current.last_updated,
          temp_c: coordinateData.current.temp_c,
          temp_f: coordinateData.current.temp_f,
          condition: coordinateData.current.condition,
          wind_mph: coordinateData.current.wind_mph,
          wind_kph: coordinateData.current.wind_kph,
          wind_dir: coordinateData.current.wind_dir,
          pressure_mb: coordinateData.current.pressure_mb,
          pressure_in: coordinateData.current.pressure_in,
          humidity: coordinateData.current.humidity,
          vis_km: coordinateData.current.vis_km,
          vis_miles: coordinateData.current.vis_miles,
        };

        return { weatherData, usedCoordinates: true };
      } catch (coordinateError) {
        console.error(
          'Both location name and coordinate attempts failed:',
          coordinateError
        );
        return rejectWithValue(
          `Failed to fetch weather data. Location name error: ${
            firstError instanceof Error ? firstError.message : 'Unknown'
          }. Coordinate error: ${
            coordinateError instanceof Error
              ? coordinateError.message
              : 'Unknown'
          }`
        );
      }
    }
  }
);

// Simplified thunk for backwards compatibility (if needed)
export const fetchWeatherDataByName = createAsyncThunk<
  WeatherData,
  string,
  { rejectValue: string }
>(
  'weather/fetchWeatherDataByName',
  async (locationQuery: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
          locationQuery
        )}&aqi=no`
      );

      if (!response.ok) {
        throw new Error(`Weather API error! status: ${response.status}`);
      }

      const data: WeatherApiResponse | WeatherApiError = await response.json();

      // Check if it's an error response
      if ('error' in data) {
        throw new Error(`Weather API error: ${data.error.message}`);
      }

      // Transform the API response to our WeatherData structure
      const weatherData: WeatherData = {
        location: data.location,
        last_updated: data.current.last_updated,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition,
        wind_mph: data.current.wind_mph,
        wind_kph: data.current.wind_kph,
        wind_dir: data.current.wind_dir,
        pressure_mb: data.current.pressure_mb,
        pressure_in: data.current.pressure_in,
        humidity: data.current.humidity,
        vis_km: data.current.vis_km,
        vis_miles: data.current.vis_miles,
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch weather data'
      );
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location>) => {
      state.selectedLocation = action.payload;
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
      state.weatherData = null;
      state.usedCoordinates = false;
      state.fromCache = false;
    },
    clearWeatherData: (state) => {
      state.weatherData = null;
      state.error = null;
      state.usedCoordinates = false;
      state.fromCache = false;
    },
    // New action to set cached weather data
    setCachedWeatherData: (
      state,
      action: PayloadAction<{
        weatherData: WeatherData;
        usedCoordinates: boolean;
      }>
    ) => {
      state.loading = false;
      state.weatherData = action.payload.weatherData;
      state.usedCoordinates = action.payload.usedCoordinates;
      state.fromCache = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle enhanced fetchWeatherData
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.usedCoordinates = false;
        state.fromCache = false;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.weatherData = action.payload.weatherData;
        state.usedCoordinates = action.payload.usedCoordinates;
        state.fromCache = false;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.weatherData = null;
        state.usedCoordinates = false;
        state.fromCache = false;
      })
      // Handle backwards compatible fetchWeatherDataByName
      .addCase(fetchWeatherDataByName.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.usedCoordinates = false;
        state.fromCache = false;
      })
      .addCase(fetchWeatherDataByName.fulfilled, (state, action) => {
        state.loading = false;
        state.weatherData = action.payload;
        state.usedCoordinates = false;
        state.fromCache = false;
      })
      .addCase(fetchWeatherDataByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.weatherData = null;
        state.usedCoordinates = false;
        state.fromCache = false;
      });
  },
});

export const {
  setSelectedLocation,
  clearSelectedLocation,
  clearWeatherData,
  setCachedWeatherData,
} = weatherSlice.actions;
export default weatherSlice.reducer;
