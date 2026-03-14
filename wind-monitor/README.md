# UK Wind Power Forecast Monitor

A full-stack Next.js application that helps users intuitively understand the accuracy of UK national-level wind power generation forecasts. It compares actual generation values with forecasted generation values sourced from the [Elexon BMRS API](https://bmrs.elexon.co.uk/), for January 2024.

> **Note:** AI tools were used to assist in building this application as part of a coding exercise.

## Project Structure

```
monitering_app/
├── wind-monitor/           # Next.js frontend + API application
│   ├── app/
│   │   ├── page.tsx        # Main dashboard page
│   │   └── api/            # API routes (actuals & forecasts)
│   ├── components/
│   │   ├── Chart.tsx       # Recharts line chart (Actual vs Forecast)
│   │   ├── Controls.tsx    # Date pickers & horizon slider
│   │   └── MetricsSummary.tsx  # MAE, RMSE, Bias metric cards
│   ├── data/               # Pre-fetched January 2024 data (static JSON)
│   │   ├── actuals-jan2024.json    # 1,488 actual WIND generation records
│   │   └── forecasts-jan2024.json  # 9,200 forecast records (0–48h horizon)
│   ├── lib/
│   │   ├── elexon.ts       # Elexon API client utilities
│   │   └── forecast-utils.ts  # Forecast horizon filtering & metric calculation
│   └── scripts/
│       └── fetch-jan2024-data.mjs  # Script to re-fetch January 2024 data
│
├── analysis/               # Jupyter notebooks for forecast analysis
│   ├── forecast_error_analysis.ipynb   # Error characteristics analysis
│   ├── forecast_error_analysis.py      # Source script for the notebook
│   ├── wind_reliability_analysis.ipynb # Wind reliability & MW recommendation
│   └── wind_reliability_analysis.py    # Source script for the notebook
│
└── README.md
```

## Features

- **Interactive Chart**: Compare actual wind generation (blue) vs forecasted generation (green) on a time-series line chart
- **Date Range Selection**: Calendar widgets to select start and end times within January 2024
- **Forecast Horizon Slider**: Configurable 0–48h horizon — for each target time T, shows the latest forecast published at least H hours before T
- **Error Metrics**: Real-time calculation of Mean Absolute Error (MAE), RMSE, and Mean Bias
- **Responsive Design**: Works on both desktop and mobile viewports

## Data

All data is sourced from the [Elexon BMRS API](https://data.elexon.co.uk/bmrs/api/v1/):

- **Actuals**: `FUELHH` dataset filtered for `fuelType = "WIND"` (30-minute resolution)
- **Forecasts**: `WINDFOR` dataset with `publishTime` and `startTime` fields (horizon 0–48h)

Data is pre-fetched for January 2024 and bundled as static JSON for fast loading.

## Installation

```bash
cd wind-monitor
npm install
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Re-fetching Data

To re-fetch the January 2024 data from the Elexon API:

```bash
node scripts/fetch-jan2024-data.mjs
```

## Deploying to Vercel

1. Push your code to a GitHub repository
2. Import the project into [Vercel](https://vercel.com/new)
3. Vercel will auto-detect the Next.js build
4. Deploy!

**Live Deployment:** <YOUR_VERCEL_URL>

## Analysis Notebooks

### Forecast Error Analysis (`analysis/forecast_error_analysis.ipynb`)
- Overall error statistics: MAE, RMSE, Bias, P25/P75/P90/P99
- Error distribution histogram
- Error variation by forecast horizon (0–4h, 4–8h, 8–12h, 12–24h, 24–48h)
- Error by hour of day and day of month

### Wind Reliability Analysis (`analysis/wind_reliability_analysis.ipynb`)
- Descriptive statistics and time-series visualization
- Exceedance probability curve
- Reliability recommendation: MW that can be reliably expected at 90%, 95%, 99% confidence
- Low-generation event analysis (sustained dips below P10 threshold)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Charting**: Recharts
- **Styling**: Tailwind CSS
- **Data**: Static JSON (pre-fetched from Elexon BMRS API)
- **Analysis**: Python, Pandas, NumPy, Matplotlib, Seaborn
