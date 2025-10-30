import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SolanaProvider } from "@/components/SolanaProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoltChain Dashboard",
  description: "Monitor your energy production and earnings",
  icons: {
    // Use the official VoltChain SVG logo as favicon
    icon: "/voltchain-logo.svg",
    shortcut: "/voltchain-logo.svg",
    apple: "/voltchain-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaProvider>
            {children}
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}