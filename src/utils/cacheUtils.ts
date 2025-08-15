import { Location, CachedLocationData } from '../types';

const CACHE_KEY = 'israeli_locations_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function setCachedLocations(locations: Location[]): void {
  try {
    const cacheData: CachedLocationData = {
      locations,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`Cached ${locations.length} locations with new structure`);
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
    const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION_MS;
    if (isExpired) {
      console.log('Cached location data is expired, removing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Validate the structure of cached data (migration check)
    if (!cacheData.locations || !Array.isArray(cacheData.locations)) {
      console.log('Invalid cached data structure, removing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if the first location has the new structure
    const firstLocation = cacheData.locations[0];
    if (
      !firstLocation ||
      typeof firstLocation.symbol_number === 'undefined' ||
      typeof firstLocation.name_in_hebrew === 'undefined' ||
      typeof firstLocation.name_in_english === 'undefined' ||
      typeof firstLocation.X === 'undefined' ||
      typeof firstLocation.Y === 'undefined'
    ) {
      console.log('Cached data uses old structure, removing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log(
      `Retrieved ${cacheData.locations.length} cached locations with new structure`
    );
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
    const isExpired = age > CACHE_DURATION_MS;

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
