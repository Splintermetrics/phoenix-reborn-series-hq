import { NextResponse } from "next/server";
import { fetchPhoenixFeed } from "@/lib/splinterlands";

export async function GET() {
  try {
    return NextResponse.json(await fetchPhoenixFeed(), { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("Splinterlands tournament sync failed", error);
    return NextResponse.json({ organiser: "phoenixevents", tournaments: [], syncedAt: null, error: "The Splinterlands feed is temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
