import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import SystemGuardian from "@/components/SystemGuardian";
import BackendGuard from "@/components/BackendGuard";
import { UsersProvider } from "@/context/UsersContext";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { RemindersProvider } from "@/context/RemindersContext";
import { CashBookProvider } from "@/context/CashBookContext";
import { FinancialYearProvider } from "@/context/FinancialYearContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Buddy",
  description: "Your AI Financial Advisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackendGuard>
          <UsersProvider>
            <RemindersProvider>
              <PermissionsProvider>
                <FeedbackProvider>
                  <CashBookProvider>
                    <FinancialYearProvider>
                      <SmoothScroll />
                      <SystemGuardian />
                      {children}
                    </FinancialYearProvider>
                  </CashBookProvider>
                </FeedbackProvider>
              </PermissionsProvider>
            </RemindersProvider>
          </UsersProvider>
        </BackendGuard>
      </body>
    </html>
  );
}

