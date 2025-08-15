import { Location, CachedLocationData } from '../types';

const STORAGE_KEY = 'locations_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Checks if the cached data is still valid (less than 24 hours old)
 */
export const isCacheValid = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp < CACHE_DURATION;
};

/**
 * Retrieves cached location data from localStorage
 * Returns null if no data exists or if data is expired
 */
export const getCachedLocations = (): Location[] | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      console.log('No cached location data found');
      return null;
    }

    const cachedData: CachedLocationData = JSON.parse(storedData);

    // Check if the cached data structure is valid
    if (!cachedData.locations || !cachedData.timestamp) {
      console.log('Invalid cached data structure, clearing cache');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Check if cache is still valid
    if (!isCacheValid(cachedData.timestamp)) {
      console.log(
        'Cached data is expired (older than 24 hours), clearing cache'
      );
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    console.log('Using valid cached location data');
    return cachedData.locations;
  } catch (error) {
    console.error('Error reading cached location data:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Saves location data to localStorage with current timestamp
 */
export const setCachedLocations = (locations: Location[]): void => {
  try {
    const cachedData: CachedLocationData = {
      locations,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    console.log(
      'Location data cached successfully with timestamp:',
      new Date(cachedData.timestamp).toISOString()
    );
  } catch (error) {
    console.error('Error saving location data to cache:', error);
  }
};

/**
 * Clears all cached location data
 */
export const clearCachedLocations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cached location data cleared');
  } catch (error) {
    console.error('Error clearing cached location data:', error);
  }
};

/**
 * Gets information about the current cache status
 */
export const getCacheInfo = (): {
  hasCache: boolean;
  isValid: boolean;
  age: number | null;
  expiresAt: Date | null;
} => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return { hasCache: false, isValid: false, age: null, expiresAt: null };
    }

    const cachedData: CachedLocationData = JSON.parse(storedData);

    if (!cachedData.timestamp) {
      return { hasCache: true, isValid: false, age: null, expiresAt: null };
    }

    const now = Date.now();
    const age = now - cachedData.timestamp;
    const isValid = age < CACHE_DURATION;
    const expiresAt = new Date(cachedData.timestamp + CACHE_DURATION);

    return {
      hasCache: true,
      isValid,
      age,
      expiresAt,
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return { hasCache: false, isValid: false, age: null, expiresAt: null };
  }
};
