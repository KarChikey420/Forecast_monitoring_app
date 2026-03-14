"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ControlsProps {
  startDate: Date | null;
  endDate: Date | null;
  horizon: number;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onHorizonChange: (horizon: number) => void;
}

export default function Controls({
  startDate,
  endDate,
  horizon,
  onStartDateChange,
  onEndDateChange,
  onHorizonChange,
}: ControlsProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between z-10 relative">
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-600">Start Time (UTC)</label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="yyyy-MM-dd HH:mm"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-48 transition-all"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-600">End Time (UTC)</label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="yyyy-MM-dd HH:mm"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-48 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-1/3 min-w-[250px]">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-600" htmlFor="horizon-slider">
            Forecast Horizon
          </label>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {horizon}h
          </span>
        </div>
        <input
          id="horizon-slider"
          type="range"
          min="0"
          max="48"
          step="1"
          value={horizon}
          onChange={(e) => onHorizonChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
          <span>0h</span>
          <span>24h</span>
          <span>48h</span>
        </div>
      </div>
    </div>
  );
}
