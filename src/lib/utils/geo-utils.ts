import iso3166 from "iso-3166-2";

/**
 * Get the full name of a region based on country and region code
 *
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "CA")
 * @param regionCode Region code (e.g., "ON")
 * @returns The full region name or the original code if not found
 */
export function getRegionName(countryCode: string, regionCode: string): string {
  try {
    const iso3166Code = `${countryCode}-${regionCode}`;
    const subdivision = iso3166.subdivision(iso3166Code);

    if (subdivision?.name) {
      return subdivision.name;
    }
  } catch (error) {
    console.error("Error getting region name:", error);
  }

  return regionCode;
}

/**
 * Format a location string using available geolocation data
 *
 * @param geo The geolocation data from Cloudflare or local API
 * @returns A formatted location string
 */
export function formatLocation(geo: {
  city?: string;
  country?: string;
  countryRegion?: string;
  flag?: string;
}) {
  const { city, country, countryRegion, flag } = geo;
  const parts: string[] = [];

  if (city) {
    parts.push(city);
  }

  if (countryRegion && country) {
    parts.push(getRegionName(country, countryRegion));
  } else if (countryRegion) {
    parts.push(countryRegion);
  }

  let formattedLocation = parts.join(", ");

  if (flag && formattedLocation) {
    formattedLocation += ` ${flag}`;
  }

  if (!formattedLocation) {
    return "unknown location";
  }

  return formattedLocation;
}
