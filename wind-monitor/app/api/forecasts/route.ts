import { NextResponse } from "next/server";
import { fetchForecastsRaw } from "@/lib/elexon";
import { filterForecastsByHorizon } from "@/lib/forecast-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const horizonParam = searchParams.get("horizon");

  if (!start || !end || horizonParam === null) {
    return NextResponse.json({ error: "Missing start, end, or horizon params" }, { status: 400 });
  }

  const horizon = parseFloat(horizonParam);

  try {
    const rawData = await fetchForecastsRaw(start, end);

    // Filter by horizon
    const filtered = filterForecastsByHorizon(rawData, horizon);

    // Format and sort Data
    const formatted = filtered
      .filter((d) => d.startTime && d.generation !== undefined)
      .map((d) => ({
        targetTime: d.startTime,
        generation: d.generation,
      }))
      .sort((a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime());

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching forecasts:", error);
    return NextResponse.json({ error: "Failed to fetch forecasts" }, { status: 500 });
  }
}
