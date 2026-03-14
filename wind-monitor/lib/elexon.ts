export interface ElexonActual {
  dataset: string;
  publishTime: string;
  startTime: string;
  settlementDate: string;
  settlementPeriod: number;
  fuelType: string;
  generation: number;
}

export interface ElexonForecast {
  dataset: string;
  publishTime: string;
  startTime: string;
  generation: number;
}

// The base URL for the true Elexon Insights Solution REST API
const BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets";

/**
 * Fetches stream data from the Elexon API, handling pagination.
 * The instructions specify the API might use `from` and `to`.
 */
async function fetchElexonStream<T>(
  dataset: string,
  start: string,
  end: string
): Promise<T[]> {
  let allResults: T[] = [];
  let hasMore = true;
  let page = 1;

  // Sometimes Elexon uses from/to, sometimes publishTimeFrom/publishTimeTo
  // Based on instructions, we use `from` and `to` and handle pagination.
  while (hasMore && page < 50) { // arbitrary safety cap to prevent infinite loops
    try {
      const url = new URL(`${BASE_URL}/${dataset}/stream`);
      if (start) url.searchParams.append("from", start);
      if (end) url.searchParams.append("to", end);
      url.searchParams.append("page", page.toString());
      // some APIs use limit/offset or size, Elexon Insights uses size
      url.searchParams.append("size", "5000");

      console.log(`Fetching ${url.toString()}...`);
      const response = await fetch(url.toString(), {
        headers: { "Accept": "application/json" },
        next: { revalidate: 3600 } // Cache for 1 hour to prevent over-fetching
      });

      if (!response.ok) {
        console.error(`Elexon API error: ${response.status} ${response.statusText}`);
        break; // Stop fetching on error
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        // Elexon stream sometimes returns an array directly, or { data: [...] }
        const items: T[] = Array.isArray(data) ? data : data.data || [];
        
        if (items.length === 0) {
          hasMore = false;
        } else {
          allResults = allResults.concat(items);
          page++;
          // If the length is less than the page size, we probably reached the end
          if (items.length < 5000) {
            hasMore = false;
          }
        }
      } else {
        console.error("Elexon API did not return JSON");
        break;
      }
    } catch (e) {
      console.error("Exception fetching Elexon API:", e);
      break;
    }
  }

  return allResults;
}

/**
 * Fetches Actual Generation (FUELHH series)
 */
export async function fetchActualsRaw(start: string, end: string): Promise<ElexonActual[]> {
  const data = await fetchElexonStream<ElexonActual>("FUELHH", start, end);
  return data;
}

/**
 * Fetches Forecasted Generation (WINDFOR series)
 */
export async function fetchForecastsRaw(start: string, end: string): Promise<ElexonForecast[]> {
  const data = await fetchElexonStream<ElexonForecast>("WINDFOR", start, end);
  return data;
}
