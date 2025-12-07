import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formatLocation, getRegionName } from "@/lib/utils/geoUtils";
import iso3166 from "iso-3166-2";

// Helper function to get country flag emoji from country code
function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return "";

  // Convert country code to flag emoji
  // Each country code letter maps to a regional indicator symbol
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

export async function GET() {
  // Get Cloudflare context which contains cf object with geolocation data
  const { cf } = getCloudflareContext();

  // Build geo object from Cloudflare's cf properties
  const geo = {
    city: cf?.city,
    country: cf?.country,
    countryRegion: cf?.region,
    flag: getCountryFlag(cf?.country),
    latitude: cf?.latitude,
    longitude: cf?.longitude,
  };

  // Format the location using our utility
  const formattedLocation = formatLocation(geo);

  // Get extra information for the response
  const countryName = geo.country;
  const regionName =
    geo.country && geo.countryRegion
      ? getRegionName(geo.country, geo.countryRegion)
      : null;

  // Get the raw subdivision data to show details
  let subdivisionDetails = null;
  if (geo.country && geo.countryRegion) {
    try {
      const code = `${geo.country}-${geo.countryRegion}`;
      subdivisionDetails = iso3166.subdivision(code);
    } catch {
      // Ignore errors
    }
  }

  // Return the data for testing
  return NextResponse.json({
    geo,
    countryName,
    regionName,
    subdivisionDetails,
    formattedLocation,
    example: `${geo.city || "City"}, ${regionName || "Region"} ${geo.flag || "🏳️"}`,
    message: "This endpoint is for testing geolocation only",
  });
}
