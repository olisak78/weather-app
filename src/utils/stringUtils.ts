// src/utils/stringUtils.ts

/**
 * Formats English location names to proper case (first letter capitalized, rest lowercase)
 * Examples: "TEL AVIV" -> "Tel Aviv", "ELAT" -> "Elat", "BEN GURION" -> "Ben Gurion"
 */
export function formatEnglishLocationName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Get display name for a location based on language preference
 * Always formats English names to proper case
 */
export function getLocationDisplayName(
  location: any,
  language: 'en' | 'he' = 'en'
): string {
  if (!location) return '';

  // Handle both old and new location structure
  const hebrewName = location.name_in_hebrew || location.city_name_he || '';
  const englishName = location.name_in_english || location.city_name_en || '';

  if (language === 'he') {
    return hebrewName || formatEnglishLocationName(englishName);
  } else {
    return formatEnglishLocationName(englishName) || hebrewName;
  }
}

/**
 * Get secondary name (opposite language) for display
 * Always formats English names to proper case
 */
export function getSecondaryLocationName(
  location: any,
  language: 'en' | 'he' = 'en'
): string {
  if (!location) return '';

  // Handle both old and new location structure
  const hebrewName = location.name_in_hebrew || location.city_name_he || '';
  const englishName = location.name_in_english || location.city_name_en || '';

  if (language === 'he') {
    const formattedEnglish = formatEnglishLocationName(englishName);
    return formattedEnglish !== hebrewName ? formattedEnglish : '';
  } else {
    const formattedEnglish = formatEnglishLocationName(englishName);
    return hebrewName !== formattedEnglish ? hebrewName : '';
  }
}

/**
 * Format location name for weather API (always English, properly formatted)
 */
export function formatLocationNameForWeatherAPI(location: any): string {
  if (!location) return '';

  const englishName = location.name_in_english || location.city_name_en || '';
  return formatEnglishLocationName(englishName);
}

/**
 * Normalize search terms for better matching
 */
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if a location name matches a search term (case-insensitive)
 */
export function locationNameMatches(
  locationName: string,
  searchTerm: string
): boolean {
  if (!locationName || !searchTerm) return false;

  const normalizedLocation = normalizeSearchTerm(locationName);
  const normalizedSearch = normalizeSearchTerm(searchTerm);

  return normalizedLocation.includes(normalizedSearch);
}

/**
 * Get all searchable names for a location (for multi-language search)
 */
export function getSearchableLocationNames(location: any): string[] {
  const names: string[] = [];

  // Hebrew name
  if (location.name_in_hebrew || location.city_name_he) {
    names.push(location.name_in_hebrew || location.city_name_he);
  }

  // English name (formatted)
  if (location.name_in_english || location.city_name_en) {
    const englishName = location.name_in_english || location.city_name_en;
    names.push(formatEnglishLocationName(englishName));
    // Also add original case for matching
    if (englishName !== formatEnglishLocationName(englishName)) {
      names.push(englishName);
    }
  }

  return names.filter(Boolean); // Remove empty strings
}
