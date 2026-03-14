import React from "react";
import { Activity, Target, TrendingUp } from "lucide-react";

interface MetricsSummaryProps {
  mae: number;
  rmse: number;
  bias: number;
}

export default function MetricsSummary({ mae, rmse, bias }: MetricsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-red-50 text-red-500 rounded-lg">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Mean Abs. Error (MAE)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{mae.toFixed(2)}</h3>
            <span className="text-sm text-slate-400 font-medium">MW</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">RMSE</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{rmse.toFixed(2)}</h3>
            <span className="text-sm text-slate-400 font-medium">MW</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Mean Bias (Forecast - Actual)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{bias > 0 ? "+" : ""}{bias.toFixed(2)}</h3>
            <span className="text-sm text-slate-400 font-medium">MW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
