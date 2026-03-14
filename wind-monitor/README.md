# UK Wind Power Forecast Monitor

This is a full-stack Next.js application designed to monitor UK wind power forecasts. It compares actual historical wind power generation with forecasted generation retrieved from the Elexon BMRS API. The application highlights forecast errors (MAE, RMSE, Bias) dynamically as users shift the forecast horizon from 0 to 48 hours.

## Installation

First, clone the repository or change to the project directory, then install the dependencies:

```bash
npm install
```

## Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will fetch live data from the Elexon API on load.

## Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Since this project uses Next.js App Router and doesn't require complex external database environments, it can be deployed with zero configuration:
1. Push your code to a GitHub/GitLab repository.
2. Import the project into Vercel.
3. Vercel will automatically detect `npm run build` as the build command.
4. Deploy!

**Live Vercel Deployment:** <YOUR_VERCEL_URL>

## Notes

> Note: AI tools were used to assist in building this application as part of a coding exercise.
