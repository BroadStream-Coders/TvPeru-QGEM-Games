import localFont from "next/font/local";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const jetBrainsMono = localFont({
  src: "../assets/fonts/JetBrainsMono.ttf",
  variable: "--font-jetbrains",
  display: "swap",
});

export const geniusTechno = localFont({
  src: "../assets/fonts/GeniusTechno-Regular.ttf",
  variable: "--font-genius-techno",
  display: "swap",
});

export const poppinsSemiBold = localFont({
  src: "../assets/fonts/Poppins-SemiBold.ttf",
  variable: "--font-poppins-semibold",
  display: "swap",
});
