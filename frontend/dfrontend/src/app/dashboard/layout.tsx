// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../Components/theme-provider";
import Provider from "../Components/provider";
import SessionWrapper from "../Components/sessionwrapper";
import "../globals.css";

// Fonts (same as root layout)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
 <html lang="en" suppressHydrationWarning>
<body
className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
suppressHydrationWarning
 >
<ThemeProvider
attribute="class"
defaultTheme="system"
enableSystem
disableTransitionOnChange
>
            <SessionWrapper>
                {/*  No Navbar here */}
             <Provider>{children}</Provider>
         </SessionWrapper>
      </ThemeProvider>
     </body>
    </html>
 );
}
