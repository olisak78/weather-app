import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Location, WeatherData, WeatherApiResponse } from '../../types';

interface WeatherState {
  selectedLocation: Location | null;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  selectedLocation: null,
  weatherData: null,
  loading: false,
  error: null,
};

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk<
  WeatherData,
  string,
  { rejectValue: string }
>(
  'weather/fetchWeatherData',
  async (locationQuery: string, { rejectWithValue }) => {
    try {
      const API_KEY = '33e82af910564a92a3591251251408';
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
          locationQuery
        )}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error! status: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();

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
    },
    clearWeatherData: (state) => {
      state.weatherData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.weatherData = action.payload;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.weatherData = null;
      });
  },
});

export const { setSelectedLocation, clearSelectedLocation, clearWeatherData } =
  weatherSlice.actions;
export default weatherSlice.reducer;
