import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import EventStudioBar from "./components/EventStudioBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Studio",
  description:
    "Créez, personnalisez et gérez vos invitations événementielles.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full overflow-x-hidden antialiased`}
    >
      <body className="min-h-full w-full max-w-full flex flex-col overflow-x-hidden">
        <ThemeProvider>
          <EventStudioBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
