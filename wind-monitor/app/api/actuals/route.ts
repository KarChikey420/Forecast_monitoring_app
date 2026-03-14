import { NextResponse } from "next/server";
import { fetchActualsRaw } from "@/lib/elexon";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end params" }, { status: 400 });
  }

  try {
    const rawData = await fetchActualsRaw(start, end);

    // Format and sort Data
    const formatted = rawData
      .filter((d) => d.fuelType === "WIND" && d.startTime && d.generation !== undefined)
      .map((d) => ({
        targetTime: d.startTime,
        generation: d.generation,
      }))
      .sort((a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime());

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching actuals:", error);
    return NextResponse.json({ error: "Failed to fetch actuals" }, { status: 500 });
  }
}
