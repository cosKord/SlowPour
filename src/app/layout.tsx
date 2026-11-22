import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import "./globals.css";
import "./typography.css";

const fraunces = localFont({ src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2", weight: "100 900", style: "normal", variable: "--font-fraunces", display: "swap" });

export const metadata:Metadata={title:{default:"SlowPour — Every cup has a story",template:"%s · SlowPour"},description:"A personal coffee collection, recipe, and brew journal."};

export default function RootLayout({children}:LayoutProps<"/">){return <html lang="en" className={fraunces.variable}><body><Suspense fallback={children}><SmoothScroll>{children}</SmoothScroll></Suspense></body></html>}
