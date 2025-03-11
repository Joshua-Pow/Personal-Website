import iso3166 from "iso-3166-2";

/**
 * Format a location string using available geolocation data
 *
 * @param geo The geolocation data from Vercel
 * @returns A formatted location string
 */
export function formatLocation(geo: {
  city?: string;
  country?: string;
  countryRegion?: string;
  flag?: string;
}) {
  const { city, country, countryRegion, flag } = geo;

  // Build location parts
  const parts: string[] = [];

  // Add city if available
  if (city) {
    parts.push(city);
  }

  // Add region if available - try to get full name
  if (countryRegion && country) {
    const regionName = getRegionName(country, countryRegion);
    parts.push(regionName);
  } else if (countryRegion) {
    parts.push(countryRegion);
  }

  // Build the formatted location string
  let formattedLocation = parts.join(", ");

  // Add the flag if available
  if (flag && formattedLocation) {
    formattedLocation += ` ${flag}`;
  }

  // If we have no location data, return default message
  if (!formattedLocation) {
    return "unknown location";
  }

  return formattedLocation;
}

/**
 * Get the full name of a region based on country and region code
 *
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "CA")
 * @param regionCode Region code (e.g., "ON")
 * @returns The full region name or the original code if not found
 */
export function getRegionName(countryCode: string, regionCode: string): string {
  try {
    // Create the ISO 3166-2 code for the region by combining country and region
    const iso3166Code = `${countryCode}-${regionCode}`;

    // Lookup the subdivision using the iso-3166-2 library
    const subdivision = iso3166.subdivision(iso3166Code);

    // Return the full name if found
    if (subdivision && subdivision.name) {
      return subdivision.name;
    }
  } catch (error) {
    console.error("Error getting region name:", error);
  }

  // If not found or error, return the original code
  return regionCode;
}
