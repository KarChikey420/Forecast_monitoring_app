"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

export interface ChartDataPoint {
  targetTime: string;
  actualGeneration?: number;
  forecastGeneration?: number;
}

interface ChartProps {
  data: ChartDataPoint[];
}

export default function Chart({ data }: ChartProps) {
  const formatXAxis = (tickItem: string) => {
    try {
      return format(new Date(tickItem), "HH:mm dd/MM/yy");
    } catch {
      return tickItem;
    }
  };

  const formatYAxis = (tickItem: number) => {
    return `${(tickItem / 1000).toFixed(0)}k`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-lg">
          <p className="font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-2">
            {format(new Date(label), "HH:mm dd/MM/yyyy (UTC)")}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 my-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-slate-600">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-bold text-slate-800">
                {entry.value !== undefined ? `${entry.value.toLocaleString()} MW` : "N/A"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Check if data is completely empty to show fallback
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100">
        <p className="text-slate-400 font-medium">No data available for this range</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] pr-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="targetTime"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            dy={15}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={40} 
            iconType="circle"
            wrapperStyle={{ fontSize: "14px", fontWeight: 600, color: "#334155", paddingBottom: "20px" }}
          />
          <Line
            type="monotone"
            dataKey="actualGeneration"
            name="Actual"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            connectNulls
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="forecastGeneration"
            name="Forecast"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            connectNulls
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
