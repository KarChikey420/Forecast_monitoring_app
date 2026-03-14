"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Controls from "@/components/Controls";
import { ChartDataPoint } from "@/components/Chart";
const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });
import MetricsSummary from "@/components/MetricsSummary";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [horizon, setHorizon] = useState<number>(0);

  // Initialize dates only on the client
  useEffect(() => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    setStartDate(twoDaysAgo);
    setEndDate(today);
  }, []);

  const [actuals, setActuals] = useState<{ targetTime: string; generation: number }[]>([]);
  const [forecasts, setForecasts] = useState<{ targetTime: string; generation: number }[]>([]);
  
  const [isLoadingActuals, setIsLoadingActuals] = useState(false);
  const [isLoadingForecasts, setIsLoadingForecasts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch actuals when date range changes
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchActuals = async () => {
      setIsLoadingActuals(true);
      setError(null);
      try {
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();
        const res = await fetch(`/api/actuals?start=${startIso}&end=${endIso}`);
        if (!res.ok) throw new Error("Failed to fetch actuals");
        const data = await res.json();
        setActuals(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoadingActuals(false);
      }
    };

    fetchActuals();
  }, [startDate, endDate]);

  // Fetch forecasts when date range or horizon changes
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchForecasts = async () => {
      setIsLoadingForecasts(true);
      setError(null);
      try {
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();
        const res = await fetch(`/api/forecasts?start=${startIso}&end=${endIso}&horizon=${horizon}`);
        if (!res.ok) throw new Error("Failed to fetch forecasts");
        const data = await res.json();
        setForecasts(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoadingForecasts(false);
      }
    };

    fetchForecasts();
  }, [startDate, endDate, horizon]);

  // Merge actuals and forecasts for the chart
  const mergedData = useMemo(() => {
    const map = new Map<string, ChartDataPoint>();

    for (const act of actuals) {
      map.set(act.targetTime, {
        targetTime: act.targetTime,
        actualGeneration: act.generation,
      });
    }

    for (const fcast of forecasts) {
      if (!map.has(fcast.targetTime)) {
        map.set(fcast.targetTime, {
          targetTime: fcast.targetTime,
        });
      }
      map.get(fcast.targetTime)!.forecastGeneration = fcast.generation;
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime()
    );
  }, [actuals, forecasts]);

  // Calculate metrics
  const metrics = useMemo(() => {
    let count = 0;
    let sumAbsErr = 0;
    let sumSqErr = 0;
    let sumBias = 0;

    for (const d of mergedData) {
      if (d.actualGeneration !== undefined && d.forecastGeneration !== undefined) {
        const err = d.forecastGeneration - d.actualGeneration;
        sumAbsErr += Math.abs(err);
        sumSqErr += err * err;
        sumBias += err;
        count++;
      }
    }

    if (count === 0) return { mae: 0, rmse: 0, bias: 0 };

    return {
      mae: sumAbsErr / count,
      rmse: Math.sqrt(sumSqErr / count),
      bias: sumBias / count,
    };
  }, [mergedData]);

  const isLoading = isLoadingActuals || isLoadingForecasts;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              UK Wind Power Forecast Monitor
            </h1>
            {isLoading && (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            )}
          </div>
          <p className="text-slate-500 mt-2 font-medium bg-blue-50/50 inline-block px-3 py-1 rounded-md text-sm border border-blue-100">
            Compare actual generation against historical Elexon prognosticative forecasts
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        <Controls
          startDate={startDate}
          endDate={endDate}
          horizon={horizon}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onHorizonChange={setHorizon}
        />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col relative transition-all">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Generation Overview
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LIVE</span>
          </h2>
          
          <div className="flex-1 w-full">
            <Chart data={mergedData} />
          </div>
        </div>

        <MetricsSummary mae={metrics.mae} rmse={metrics.rmse} bias={metrics.bias} />
        
        <footer className="mt-12 text-center text-sm text-slate-400 font-medium pb-8 border-t border-slate-200 pt-8">
          Built for analysis using Next.js App Router and Tailwind CSS
        </footer>
      </div>
    </main>
  );
}
