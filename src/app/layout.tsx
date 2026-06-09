import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const appFont = DM_Sans({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PCF Report Generator",
  description: "Generate ISO 14067 Product Carbon Footprint PDF reports",
};

const themeScript = `
  try {
    const stored = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', stored === 'dark' ? 'dark' : 'light');
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${appFont.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
