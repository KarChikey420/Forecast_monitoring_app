import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wind Power Forecast Monitor",
  description: "Monitor UK wind power actuals against prognosticative forecasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
