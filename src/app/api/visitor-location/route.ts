import { NextResponse } from "next/server";
import { getLastVisitorLocation } from "@/middleware";

export async function GET() {
  return NextResponse.json({
    location: getLastVisitorLocation(),
  });
}
