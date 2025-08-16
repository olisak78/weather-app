import {
  Location,
  CachedLocationData,
  CACHE_KEY,
  CACHE_DURATION_LOCATION_MS,
} from '../types';

export function setCachedLocations(locations: Location[]): void {
  try {
    const cacheData: CachedLocationData = {
      locations,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching locations:', error);
  }
}

export function getCachedLocations(): Location[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('No cached location data found');
      return null;
    }
    const cacheData: CachedLocationData = JSON.parse(cached);

    // Check if cache is expired
    const isExpired =
      Date.now() - cacheData.timestamp > CACHE_DURATION_LOCATION_MS;
    if (isExpired) {
      console.log('Cached location data is expired, removing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cacheData.locations;
  } catch (error) {
    console.error('Error retrieving cached locations:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function clearCachedLocations(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cleared cached location data');
  } catch (error) {
    console.error('Error clearing cached locations:', error);
  }
}

export function getCacheInfo(): {
  hasCache: boolean;
  timestamp?: number;
  age?: number;
  isExpired?: boolean;
  count?: number;
} {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { hasCache: false };
    }

    const cacheData: CachedLocationData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;
    const isExpired = age > CACHE_DURATION_LOCATION_MS;

    return {
      hasCache: true,
      timestamp: cacheData.timestamp,
      age,
      isExpired,
      count: cacheData.locations?.length || 0,
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return { hasCache: false };
  }
}
