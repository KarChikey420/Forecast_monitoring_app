import { NextResponse } from "next/server";
import actualsData from "@/data/actuals-jan2024.json";

interface ActualRecord {
  targetTime: string;
  generation: number;
}

const allActuals: ActualRecord[] = actualsData as ActualRecord[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end params" }, { status: 400 });
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  // Filter actuals within the requested date range
  const filtered = allActuals.filter((d) => {
    const t = new Date(d.targetTime).getTime();
    return t >= startMs && t <= endMs;
  });

  return NextResponse.json(filtered);
}
