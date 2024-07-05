import "./globals.css";
import { Inter, Source_Code_Pro } from "next/font/google";
import { getAnalytics, isSupported } from "firebase/analytics";
import { app } from "../../firebase-config";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const scp = Source_Code_Pro({ subsets: ["latin"], variable: "--font-scp" });

export const metadata = {
  title: "Conselheiro Bíblico",
  description: "Receba conselhos baseados em versículos da bíblia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const setupAnalytics = async () => {
      if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
          getAnalytics(app);
        }
      }
    };
    setupAnalytics();
  }, []);
  return (
    <html lang="en">
      <body className={`${inter.variable} ${scp.variable} h-full`}>
        {children}
      </body>
    </html>
  );
}
