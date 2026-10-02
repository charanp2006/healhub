import type { Metadata } from "next";
import "./endpoints.css";

export const metadata: Metadata = {
  title: "Healhub API · Endpoint Directory",
  description: "Authenticated directory of all Healhub API endpoints",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}