import proj4 from 'proj4';

/**
 * Coordinates interface
 */
export interface LatLng {
  latitude: number;
  longitude: number;
}

// Define the ITM (Israeli Transverse Mercator) projection
// This is the official projection used by the Survey of Israel
const ITM_PROJ =
  '+proj=tmerc +lat_0=31.734393892 +lon_0=35.204516667 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=-48,55,52,0,0,0,0 +units=m +no_defs';

// WGS84 projection (standard GPS coordinates)
const WGS84_PROJ = '+proj=longlat +datum=WGS84 +no_defs';

/**
 * Convert ITM coordinates to WGS84 Lat/Lng using proj4
 * This provides accurate conversion for Israeli coordinates
 */
export function itmToLatLng(x: number, y: number): LatLng {
  try {
    // Use proj4 for accurate coordinate conversion
    const [longitude, latitude] = proj4(ITM_PROJ, WGS84_PROJ, [x, y]);

    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    };
  } catch (error) {
    console.error('Error converting ITM to LatLng using proj4:', error);

    // Fallback to simplified conversion if proj4 fails
    return itmToLatLngSimplified(x, y);
  }
}

/**
 * Simplified ITM to LatLng conversion as fallback
 * Less accurate but still usable for weather API purposes
 */
export function itmToLatLngSimplified(x: number, y: number): LatLng {
  // ITM parameters for Israel
  const lat0 = 31.734393892; // Origin latitude (degrees)
  const lon0 = 35.204516667; // Origin longitude (degrees)
  const x0 = 219529.584; // False easting
  const y0 = 626907.39; // False northing

  // Convert to radians for calculation
  const lat0_rad = (lat0 * Math.PI) / 180;

  // Calculate relative coordinates
  const dx = x - x0;
  const dy = y - y0;

  // Simplified conversion (accurate enough for weather API purposes)
  const dLat = dy / 111320; // Approximate meters per degree latitude
  const dLon = dx / (111320 * Math.cos(lat0_rad)); // Adjust for longitude at latitude

  const latitude = lat0 + dLat;
  const longitude = lon0 + dLon;

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

/**
 * Convert WGS84 Lat/Lng to ITM coordinates (if needed for reverse conversion)
 */
export function latLngToItm(
  latitude: number,
  longitude: number
): { x: number; y: number } {
  try {
    const [x, y] = proj4(WGS84_PROJ, ITM_PROJ, [longitude, latitude]);

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  } catch (error) {
    console.error('Error converting LatLng to ITM using proj4:', error);
    throw new Error('Failed to convert coordinates');
  }
}

/**
 * Validates if coordinates are within reasonable bounds for Israel
 */
export function validateIsraeliCoordinates(
  latitude: number,
  longitude: number
): boolean {
  // Extended bounds for Israel including surrounding areas
  const minLat = 29.0; // Southern border area
  const maxLat = 33.5; // Northern border area including Golan Heights
  const minLon = 34.0; // Western Mediterranean area
  const maxLon = 36.0; // Eastern border area

  const isValid =
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLon &&
    longitude <= maxLon;

  if (!isValid) {
    console.warn(
      `Coordinates (${latitude}, ${longitude}) are outside Israel bounds`
    );
  }

  return isValid;
}

/**
 * Validates if ITM coordinates are within reasonable bounds for Israel
 */
export function validateITMCoordinates(x: number, y: number): boolean {
  // ITM coordinate bounds for Israel (approximate)
  const minX = 120000; // Western bound
  const maxX = 320000; // Eastern bound
  const minY = 350000; // Southern bound
  const maxY = 800000; // Northern bound

  const isValid = x >= minX && x <= maxX && y >= minY && y <= maxY;

  if (!isValid) {
    console.warn(
      `ITM coordinates (${x}, ${y}) are outside expected Israel bounds`
    );
  }

  return isValid;
}

/**
 * Format coordinates for weather API query
 */
export function formatCoordinatesForWeatherAPI(
  latitude: number,
  longitude: number
): string {
  return `${latitude},${longitude}`;
}

/**
 * Test coordinate conversion with known reference points
 */
export function testCoordinateConversion(): void {
  console.log('Testing coordinate conversion...');

  // Test with Jerusalem coordinates (known reference point)
  const jerusalemITM = { x: 222285, y: 631555 };
  const jerusalemExpected = { latitude: 31.7784, longitude: 35.2066 };

  const jerusalemConverted = itmToLatLng(jerusalemITM.x, jerusalemITM.y);

  console.log('Jerusalem test:');
  console.log('ITM input:', jerusalemITM);
  console.log('Expected LatLng:', jerusalemExpected);
  console.log('Converted LatLng:', jerusalemConverted);
  console.log(
    'Lat difference:',
    Math.abs(jerusalemConverted.latitude - jerusalemExpected.latitude)
  );
  console.log(
    'Lng difference:',
    Math.abs(jerusalemConverted.longitude - jerusalemExpected.longitude)
  );

  // Test with Tel Aviv coordinates
  const telAvivITM = { x: 180500, y: 665500 };
  const telAvivConverted = itmToLatLng(telAvivITM.x, telAvivITM.y);

  console.log('\nTel Aviv test:');
  console.log('ITM input:', telAvivITM);
  console.log('Converted LatLng:', telAvivConverted);
  console.log(
    'Is valid:',
    validateIsraeliCoordinates(
      telAvivConverted.latitude,
      telAvivConverted.longitude
    )
  );
}

/**
 * Get distance between two lat/lng points (in kilometers)
 * Useful for validation and debugging
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
