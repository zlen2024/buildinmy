import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NomadMY — Interactive Workspace Finder for Digital Nomads in Malaysia",
  description: "Explore work-friendly venues, co-living spaces, Wi-Fi speeds, and cost indexes across Malaysia. Find your perfect digital nomad workspace.",
  keywords: ["digital nomad", "Malaysia", "coworking", "work cafe", "workspace", "KL", "Penang", "Johor", "remote work"],
  authors: [{ name: "NomadMY" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "NomadMY — Find Your Perfect Workspace in Malaysia",
    description: "Interactive map-based workspace finder for digital nomads living in Malaysia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
