import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { formatLocation, getRegionName } from "@/lib/geoUtils";
import iso3166 from "iso-3166-2";

export async function GET(request: Request) {
  // Get geolocation data from the request
  const geo = geolocation(request);

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
