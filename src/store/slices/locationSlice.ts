import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Location, ApiResponse } from '../../types';

interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [],
  selectedLocation: null,
  loading: false,
  error: null,
};

const STORAGE_KEY = 'locations_data';

// Async thunk for fetching locations
export const fetchLocations = createAsyncThunk(
  'location/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      // First, check local storage
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData) as Location[];
      }

      // If not in storage, fetch from API
      const response = await fetch(
        'https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error('API request was not successful');
      }

      // Transform the data to keep only required fields
      const locations: Location[] = data.result.records.map((record) => ({
        city_code: record.city_code,
        city_name_he: record.city_name_he,
        city_name_en: record.city_name_en,
      }));

      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));

      return locations;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location>) => {
      state.selectedLocation = action.payload;
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedLocation, clearSelectedLocation } =
  locationSlice.actions;
export default locationSlice.reducer;
