import { useMemo, useCallback } from 'react';
import {
  WeatherData,
  Location,
  MAX_CACHE_SIZE,
  CACHE_DURATION_MS,
} from '../types';

interface CachedWeatherEntry {
  data: WeatherData;
  usedCoordinates: boolean;
  timestamp: number;
  expiresAt: number;
}

interface WeatherCacheResult {
  getCachedWeather: (location: Location) => CachedWeatherEntry | null;
  setCachedWeather: (
    location: Location,
    weatherData: WeatherData,
    usedCoordinates: boolean
  ) => void;
  clearCache: () => void;
  getCacheStats: () => {
    size: number;
    entries: { locationKey: string; expiresAt: number; isExpired: boolean }[];
  };
}

// Global cache object (persists across component re-renders but not page refreshes)
let weatherCache = new Map<string, CachedWeatherEntry>();

export const useWeatherCache = (): WeatherCacheResult => {
  // Generate a unique key for the location
  const generateLocationKey = useCallback((location: Location): string => {
    // Use coordinates if available for more precise caching, otherwise use English name
    if (location.X && location.Y) {
      return `${location.X}_${location.Y}`;
    }
    return location.name_in_english.toLowerCase().replace(/\s+/g, '_');
  }, []);

  // Check if cache entry is expired
  const isExpired = useCallback((entry: CachedWeatherEntry): boolean => {
    return Date.now() > entry.expiresAt;
  }, []);

  // Clean up expired entries
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    weatherCache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => weatherCache.delete(key));
  }, []);

  // Enforce cache size limit (remove oldest entries)
  const enforceCacheLimit = useCallback(() => {
    if (weatherCache.size <= MAX_CACHE_SIZE) return;

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(weatherCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(
      0,
      weatherCache.size - MAX_CACHE_SIZE
    );
    entriesToRemove.forEach(([key]) => weatherCache.delete(key));
  }, []);

  // Memoized cache operations
  const cacheOperations = useMemo(() => {
    const getCachedWeather = (
      location: Location
    ): CachedWeatherEntry | null => {
      const key = generateLocationKey(location);
      const entry = weatherCache.get(key);

      if (!entry) return null;

      if (isExpired(entry)) {
        weatherCache.delete(key);
        return null;
      }

      return entry;
    };

    const setCachedWeather = (
      location: Location,
      weatherData: WeatherData,
      usedCoordinates: boolean
    ): void => {
      const key = generateLocationKey(location);
      const now = Date.now();

      const entry: CachedWeatherEntry = {
        data: weatherData,
        usedCoordinates,
        timestamp: now,
        expiresAt: now + CACHE_DURATION_MS,
      };

      weatherCache.set(key, entry);

      // Cleanup and enforce limits after adding
      cleanupExpiredEntries();
      enforceCacheLimit();

      console.log(
        `Weather cached for ${location.name_in_english} (key: ${key})`
      );
    };

    const clearCache = (): void => {
      weatherCache.clear();
      console.log('Weather cache cleared');
    };

    const getCacheStats = () => {
      const now = Date.now();
      const entries = Array.from(weatherCache.entries()).map(
        ([key, entry]) => ({
          locationKey: key,
          expiresAt: entry.expiresAt,
          isExpired: now > entry.expiresAt,
        })
      );

      return {
        size: weatherCache.size,
        entries,
      };
    };

    return {
      getCachedWeather,
      setCachedWeather,
      clearCache,
      getCacheStats,
    };
  }, [
    generateLocationKey,
    isExpired,
    cleanupExpiredEntries,
    enforceCacheLimit,
  ]);

  return cacheOperations;
};
