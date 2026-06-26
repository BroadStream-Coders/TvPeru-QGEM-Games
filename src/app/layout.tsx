import type { Metadata } from "next";
import {
  ibmPlexSans,
  ibmPlexMono,
  jetBrainsMono,
  poppinsSemiBold,
} from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | QGEM Studio",
    default: "QGEM Studio — TV Perú",
  },
  description: "Colector de datos para el programa Que Gane el Mejor — TV Perú",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${jetBrainsMono.variable} ${poppinsSemiBold.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
