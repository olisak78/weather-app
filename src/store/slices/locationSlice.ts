// src/store/slices/locationSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Location,
  ApiResponse,
  FetchLocationsResponse,
  LOCATIONS_API_URL,
} from '../../types';
import { getCachedLocations, setCachedLocations } from '../../utils/cacheUtils';
import { formatEnglishLocationName } from '../../utils/stringUtils';

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  cacheStatus: 'fresh' | 'expired' | 'none';
}

const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null,
  lastUpdated: null,
  cacheStatus: 'none',
};

/*
 * NOTE: I fetch and cache the entire list of Israeli locations because:
 * 1. The data.gov.il API does not support partial name search queries
 * 2. I need all location data locally to implement client-side autocomplete functionality
 * 3. This enables instant search results without repeated API calls for each keystroke
 * 4. The full dataset is relatively small and cached for 24 hours
 * 5. Without local caching, users would have to type exact location names, making the app unusable
 */

// Async thunk for fetching locations with improved caching logic
export const fetchLocations = createAsyncThunk<
  FetchLocationsResponse,
  boolean | undefined,
  { rejectValue: string }
>(
  'location/fetchLocations',
  async (forceRefresh: boolean | undefined = false, { rejectWithValue }) => {
    try {
      // First, check cached data if not forcing refresh
      if (!forceRefresh) {
        const cachedLocations = getCachedLocations();
        if (cachedLocations) {
          return {
            locations: cachedLocations,
            source: 'cache' as const,
            timestamp: Date.now(),
          };
        }
      }

      // Fetch fresh data from API with new URL
      const response = await fetch(LOCATIONS_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error('API request was not successful');
      }

      if (!data.result || !data.result.records) {
        throw new Error('Invalid API response structure');
      }

      // Transform the data to keep only required fields with new structure and format English names
      const locations: Location[] = data.result.records
        .filter((record) => {
          // Filter out records with missing essential data
          return (
            record.name_in_hebrew &&
            record.name_in_english &&
            typeof record.X === 'number' &&
            typeof record.Y === 'number'
          );
        })
        .map((record) => ({
          symbol_number: record.symbol_number,
          name_in_hebrew: record.name_in_hebrew?.trim() || '',
          // Format English names to proper case (first letter capitalized, rest lowercase)
          name_in_english: formatEnglishLocationName(
            record.name_in_english?.trim() || ''
          ),
          X: record.X,
          Y: record.Y,
        }));

      // Validate that we have data
      if (locations.length === 0) {
        throw new Error('No location data received from API');
      }

      // Cache the fresh data
      setCachedLocations(locations);

      return {
        locations,
        source: 'api' as const,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching locations:', error);

      // If API fails, try to use cached data even if expired as fallback
      const cachedLocations = getCachedLocations();
      if (cachedLocations && cachedLocations.length > 0) {
        return {
          locations: cachedLocations,
          source: 'expired-cache' as const,
          timestamp: Date.now(),
        };
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCacheStatus: (
      state,
      action: PayloadAction<'fresh' | 'expired' | 'none'>
    ) => {
      state.cacheStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchLocations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations;
        state.lastUpdated = action.payload.timestamp;

        // Set cache status based on data source
        switch (action.payload.source) {
          case 'cache':
            state.cacheStatus = 'fresh';
            break;
          case 'api':
            state.cacheStatus = 'fresh';
            break;
          case 'expired-cache':
            state.cacheStatus = 'expired';
            break;
          default:
            state.cacheStatus = 'none';
        }
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.cacheStatus = 'none';
      });
  },
});

export const { setCacheStatus } = locationSlice.actions;
export default locationSlice.reducer;
