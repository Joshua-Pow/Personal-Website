import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

export async function GET(request: Request) {
  // Get geolocation data from the request
  const geo = geolocation(request);

  // Return the raw geolocation data for testing
  return NextResponse.json({
    geo,
    message: "This endpoint is for testing geolocation only",
  });
}
