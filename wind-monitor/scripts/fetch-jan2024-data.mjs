/**
 * Fetches January 2024 wind generation data from the Elexon API (non-stream endpoints)
 * and saves it as static JSON files for the app to use.
 * 
 * Non-stream FUELHH endpoint: /datasets/FUELHH?publishDateTimeFrom=...&publishDateTimeTo=...&fuelType=WIND
 * Non-stream WINDFOR endpoint: /datasets/WINDFOR?publishDateTimeFrom=...&publishDateTimeTo=...
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

const BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets";

/**
 * Fetch paginated data from the non-stream Elexon API for a specific date range.
 * The non-stream endpoints use publishDateTimeFrom/To parameters.
 */
async function fetchBatch(dataset, startDate, endDate, extraParams = {}) {
  let allResults = [];
  let offset = 0;
  const limit = 10000;

  while (true) {
    const url = new URL(`${BASE_URL}/${dataset}`);
    url.searchParams.append("publishDateTimeFrom", startDate);
    url.searchParams.append("publishDateTimeTo", endDate);
    url.searchParams.append("format", "json");

    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.append(key, value);
    }

    console.log(`Fetching ${dataset} [${startDate} → ${endDate}]...`);
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text.slice(0, 500));
      break;
    }

    const body = await response.json();
    const items = Array.isArray(body) ? body : body.data || [];

    if (items.length === 0) break;
    allResults = allResults.concat(items);
    console.log(`  Got ${items.length} items (total: ${allResults.length})`);

    // If we got fewer than typical page size, we're done
    if (items.length < limit) break;
    offset += limit;
  }

  return allResults;
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // ============ Fetch Actuals (FUELHH - WIND only) ============
  // Fetch day-by-day to avoid API limits
  console.log("\n=== Fetching FUELHH (Actuals) ===\n");
  let allActuals = [];
  for (let day = 1; day <= 31; day++) {
    const d = day.toString().padStart(2, "0");
    const nextDay = (day + 1).toString().padStart(2, "0");
    
    let startDate, endDate;
    if (day < 31) {
      startDate = `2024-01-${d}T00:00:00Z`;
      endDate = `2024-01-${nextDay}T00:00:00Z`;
    } else {
      startDate = `2024-01-31T00:00:00Z`;
      endDate = `2024-02-01T00:00:00Z`;
    }

    const items = await fetchBatch("FUELHH", startDate, endDate, { fuelType: "WIND" });
    allActuals = allActuals.concat(items);
    
    // Small delay to be polite to the API
    await new Promise((r) => setTimeout(r, 300));
  }

  const actuals = allActuals
    .filter((d) => d.fuelType === "WIND" && d.startTime && d.generation !== undefined)
    .map((d) => ({
      targetTime: d.startTime,
      generation: d.generation,
    }))
    // Deduplicate by targetTime
    .reduce((map, item) => {
      map.set(item.targetTime, item);
      return map;
    }, new Map());
  
  const actualsArr = Array.from(actuals.values())
    .filter((d) => {
      const t = new Date(d.targetTime);
      return t >= new Date("2024-01-01T00:00:00Z") && t < new Date("2024-02-01T00:00:00Z");
    })
    .sort((a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime());
  
  console.log(`\nTotal WIND actuals for Jan 2024: ${actualsArr.length}`);

  // ============ Fetch Forecasts (WINDFOR) ============
  console.log("\n=== Fetching WINDFOR (Forecasts) ===\n");
  let allForecasts = [];
  
  // Fetch in 2-day chunks to get enough data
  for (let day = 1; day <= 31; day += 2) {
    const d = day.toString().padStart(2, "0");
    const endDay = Math.min(day + 2, 32);
    
    let startDate = `2024-01-${d}T00:00:00Z`;
    let endDate;
    if (endDay <= 31) {
      endDate = `2024-01-${endDay.toString().padStart(2, "0")}T00:00:00Z`;
    } else {
      endDate = `2024-02-01T00:00:00Z`;
    }
    
    const items = await fetchBatch("WINDFOR", startDate, endDate);
    allForecasts = allForecasts.concat(items);
    
    await new Promise((r) => setTimeout(r, 300));
  }

  const forecasts = allForecasts
    .filter((d) => d.startTime && d.publishTime && d.generation !== undefined)
    .map((d) => ({
      targetTime: d.startTime,
      publishTime: d.publishTime,
      generation: d.generation,
    }));

  // Filter: horizon 0-48 hours
  const filteredForecasts = forecasts.filter((f) => {
    const targetMs = new Date(f.targetTime).getTime();
    const publishMs = new Date(f.publishTime).getTime();
    const horizonHours = (targetMs - publishMs) / (3600 * 1000);
    return horizonHours >= 0 && horizonHours <= 48;
  });

  // Filter to Jan 2024 target times
  const jan2024Forecasts = filteredForecasts.filter((f) => {
    const t = new Date(f.targetTime);
    return t >= new Date("2024-01-01T00:00:00Z") && t < new Date("2024-02-01T00:00:00Z");
  });

  // Sort
  jan2024Forecasts.sort(
    (a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime()
  );

  console.log(`\nTotal forecasts for Jan 2024 (0-48h horizon): ${jan2024Forecasts.length}`);

  // ============ Save ============
  const actualsPath = path.join(DATA_DIR, "actuals-jan2024.json");
  const forecastsPath = path.join(DATA_DIR, "forecasts-jan2024.json");

  fs.writeFileSync(actualsPath, JSON.stringify(actualsArr, null, 2));
  fs.writeFileSync(forecastsPath, JSON.stringify(jan2024Forecasts, null, 2));

  console.log(`\nSaved ${actualsArr.length} actuals to ${actualsPath}`);
  console.log(`Saved ${jan2024Forecasts.length} forecasts to ${forecastsPath}`);
  console.log("\nDone!");
}

main().catch(console.error);
