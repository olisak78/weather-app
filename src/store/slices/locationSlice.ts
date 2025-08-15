// src/store/slices/locationSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Location, ApiResponse, FetchLocationsResponse } from '../../types';
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

// Updated API URL for locations with coordinates
const LOCATIONS_API_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=e9701dcb-9f1c-43bb-bd44-eb380ade542f';

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

      console.log('Fetching fresh location data from API...');

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

      console.log(
        `Loaded ${locations.length} locations from API with formatted English names`
      );

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
        console.log('API failed, using expired cache as fallback');
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

// Async thunk to force refresh data
export const refreshLocations = createAsyncThunk<
  FetchLocationsResponse,
  void,
  { rejectValue: string }
>('location/refreshLocations', async (_, { rejectWithValue }) => {
  try {
    console.log('Force refreshing location data...');

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

    console.log(
      `Refreshed ${locations.length} locations from API with formatted English names`
    );

    // Cache the fresh data
    setCachedLocations(locations);

    return {
      locations,
      source: 'api' as const,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error refreshing locations:', error);
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to refresh data'
    );
  }
});

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
      })
      // Handle refreshLocations
      .addCase(refreshLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations;
        state.lastUpdated = action.payload.timestamp;
        state.cacheStatus = 'fresh';
      })
      .addCase(refreshLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCacheStatus } = locationSlice.actions;
export default locationSlice.reducer;
