import { NextResponse } from "next/server";
import forecastsData from "@/data/forecasts-jan2024.json";

interface ForecastRecord {
  targetTime: string;
  publishTime: string;
  generation: number;
}

const allForecasts: ForecastRecord[] = forecastsData as ForecastRecord[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const horizonParam = searchParams.get("horizon");

  if (!start || !end || horizonParam === null) {
    return NextResponse.json(
      { error: "Missing start, end, or horizon params" },
      { status: 400 }
    );
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const horizonHours = parseFloat(horizonParam);
  const horizonMs = horizonHours * 3600 * 1000;

  // Step 1: Filter forecasts to the requested date range (by targetTime)
  const inRange = allForecasts.filter((f) => {
    const t = new Date(f.targetTime).getTime();
    return t >= startMs && t <= endMs;
  });

  // Step 2: For each targetTime, find the LATEST forecast where
  // publishTime <= targetTime - horizon
  const targetMap = new Map<string, ForecastRecord>();

  for (const f of inRange) {
    const targetMs = new Date(f.targetTime).getTime();
    const publishMs = new Date(f.publishTime).getTime();

    // Condition: publishTime <= (targetTime - horizon)
    if (publishMs <= targetMs - horizonMs) {
      const existing = targetMap.get(f.targetTime);
      if (
        !existing ||
        new Date(f.publishTime).getTime() > new Date(existing.publishTime).getTime()
      ) {
        targetMap.set(f.targetTime, f);
      }
    }
  }

  // Format output
  const result = Array.from(targetMap.values())
    .map((d) => ({
      targetTime: d.targetTime,
      generation: d.generation,
    }))
    .sort(
      (a, b) =>
        new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime()
    );

  return NextResponse.json(result);
}
