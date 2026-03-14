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
    <div className="flex flex-col md:flex-row gap-6 items-end justify-between z-10 relative mb-4">
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-700">Start Time:</label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="dd/MM/yyyy HH:mm"
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-[150px]"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-700">End Time:</label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="dd/MM/yyyy HH:mm"
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-[150px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-1/3 min-w-[200px] max-w-[300px] mb-1">
        <label className="text-sm text-slate-700" htmlFor="horizon-slider">
          Forecast Horizon: {horizon}h
        </label>
        <input
          id="horizon-slider"
          type="range"
          min="0"
          max="48"
          step="1"
          value={horizon}
          onChange={(e) => onHorizonChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
        />
      </div>
    </div>
  );
}
