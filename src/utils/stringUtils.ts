/**
 * Converts a string to title case (first letter of each word capitalized)
 * Handles special cases for common location prefixes and suffixes
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Remove extra whitespace
      word = word.trim();
      if (!word) return '';

      // Default: capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter((word) => word.length > 0) // Remove empty strings
    .join(' ')
    .trim();
};

/**
 * Formats location name based on language
 * English: Converts from ALL CAPS to Title Case
 * Hebrew: Returns as-is (no formatting needed)
 */
export const formatLocationName = (
  name: string,
  language: 'en' | 'he'
): string => {
  if (!name) return '';

  if (language === 'he') {
    // Hebrew names are already properly formatted
    return name.trim();
  }

  // English names need title case formatting
  return toTitleCase(name.trim());
};

/**
 * Gets the display name for a location in the specified language with proper formatting
 */
export const getLocationDisplayName = (
  location: { city_name_en: string; city_name_he: string },
  language: 'en' | 'he'
): string => {
  const name =
    language === 'he' ? location.city_name_he : location.city_name_en;
  return formatLocationName(name, language);
};
