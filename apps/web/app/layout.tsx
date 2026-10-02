import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppContextProvider from "@/src/context/AppContext";
import { ThemeProvider } from "@healhub/ui/theme";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import FloatingDemoButton from "@/src/components/FloatingDemoButton";
import MobileAppHeader from "@/src/components/MobileAppHeader";
import MobileTabBar from "@/src/components/MobileTabBar";
import ToastWrapper from "@/src/components/ToastWrapper";
import RegisterSW from "@/src/components/RegisterSW";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "HealHub - Book Appointments Online",
  description: "Book doctors and hospital appointments online.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5f6FFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppContextProvider>
            <ToastWrapper>
              <div className="mx-0 sm:mx-[3%] bg-background-base md:bg-background-card min-h-screen">
                <MobileAppHeader />
                <div className="hidden md:block">
                  <Navbar />
                </div>
                <main className="min-h-screen px-4 md:px-0 pb-[96px] md:pb-0">
                  {children}
                </main>
                <div className="hidden md:block">
                  <Footer />
                </div>
                <FloatingDemoButton />
                <MobileTabBar />
              </div>
              <RegisterSW />
            </ToastWrapper>
          </AppContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
