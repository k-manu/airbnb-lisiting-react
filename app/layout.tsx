import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Airbnb's typeface: one variable file covering every weight.
const airbnb = localFont({
  src: "../public/Airbnb.woff2",
  weight: "200 900",
  variable: "--font-airbnb",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10 - Serviced apartments for Rent in Candolim, Goa, India - Airbnb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${airbnb.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
