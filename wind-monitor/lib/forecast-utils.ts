import { ElexonActual, ElexonForecast } from "./elexon";

export interface DataPoint {
  targetTime: string;
  actualGeneration?: number;
  forecastGeneration?: number;
}

export interface MetricSummary {
  mae: number;
  rmse: number;
  bias: number;
}

/**
 * Applies horizon logic to forecasts.
 * For each target time T, finds all forecasts where publishTime <= T - H.
 * From those, picks the one with the LATEST publishTime.
 */
export function filterForecastsByHorizon(
  forecasts: ElexonForecast[],
  horizonHours: number
): ElexonForecast[] {
  // Map targetTime to the best forecast
  const targetMap = new Map<string, ElexonForecast>();

  // A helper to convert ISO date string to JS timestamp (ms)
  const parseTime = (dateStr: string) => new Date(dateStr).getTime();

  for (const f of forecasts) {
    if (!f.startTime || !f.publishTime) continue;

    const targetMs = parseTime(f.startTime);
    const publishMs = parseTime(f.publishTime);
    const horizonMs = horizonHours * 3600 * 1000;

    // Condition: publishTime <= (T - H)
    if (publishMs <= targetMs - horizonMs) {
      const existing = targetMap.get(f.startTime);
      if (!existing || parseTime(f.publishTime) > parseTime(existing.publishTime)) {
        targetMap.set(f.startTime, f);
      }
    }
  }

  // Convert map back to an array
  return Array.from(targetMap.values());
}

/**
 * Calculates error metrics.
 */
export function calculateMetrics(
  actuals: { targetTime: string; generation: number }[],
  forecasts: { targetTime: string; generation: number }[]
): MetricSummary {
  // We need to pair them by targetTime
  const actualMap = new Map<string, number>();
  for (const a of actuals) {
    actualMap.set(a.targetTime, a.generation);
  }

  let count = 0;
  let sumAbsError = 0;
  let sumSqError = 0;
  let sumBias = 0;

  for (const f of forecasts) {
    const act = actualMap.get(f.targetTime);
    if (act !== undefined) {
      // error = forecast_generation - actual_generation
      const err = f.generation - act;
      sumAbsError += Math.abs(err);
      sumSqError += err * err;
      sumBias += err;
      count++;
    }
  }

  if (count === 0) {
    return { mae: 0, rmse: 0, bias: 0 };
  }

  return {
    mae: sumAbsError / count,
    rmse: Math.sqrt(sumSqError / count),
    bias: sumBias / count,
  };
}
