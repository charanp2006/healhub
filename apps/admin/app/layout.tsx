import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import PanelShell from "@/src/components/PanelShell";
import Providers from "@/src/components/Providers";
import RegisterSW from "@/src/components/RegisterSW";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Healhub Admin Panel",
  description: "Admin Control Panel",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5f6FFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <PanelShell>{children}</PanelShell>
        </Providers>
        <RegisterSW />
      </body>
    </html>
  );
}