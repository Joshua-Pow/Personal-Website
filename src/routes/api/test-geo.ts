import { createFileRoute } from "@tanstack/react-router";
import iso3166 from "iso-3166-2";

import { getRequestCf } from "@/lib/cf";
import { getCountryFlag } from "@/lib/country-flag";
import { formatLocation, getRegionName } from "@/lib/utils/geo-utils";

export const Route = createFileRoute("/api/test-geo")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const cf = getRequestCf(request);
        const geo = {
          city: cf?.city,
          country: cf?.country,
          countryRegion: cf?.region,
          flag: getCountryFlag(cf?.country),
          latitude: cf?.latitude,
          longitude: cf?.longitude,
        };

        const formattedLocation = formatLocation(geo);
        const countryName = geo.country;
        const regionName =
          geo.country && geo.countryRegion
            ? getRegionName(geo.country, geo.countryRegion)
            : null;

        let subdivisionDetails = null;
        if (geo.country && geo.countryRegion) {
          try {
            const code = `${geo.country}-${geo.countryRegion}`;
            subdivisionDetails = iso3166.subdivision(code);
          } catch {
            // Ignore lookup errors for this debug endpoint.
          }
        }

        return Response.json({
          geo,
          countryName,
          regionName,
          subdivisionDetails,
          formattedLocation,
          example: `${geo.city || "City"}, ${regionName || "Region"} ${geo.flag || "🏳️"}`,
          message: "This endpoint is for testing geolocation only",
        });
      },
    },
  },
});
