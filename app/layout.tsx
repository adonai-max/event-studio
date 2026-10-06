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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <EventStudioBar />
          <div className="flex min-h-0 flex-1 flex-col">
            {children}
          </div>
          <footer className="event-studio-footer relative overflow-hidden border-t border-white/10 px-4 py-7 text-white shadow-[0_-12px_40px_rgba(2,6,23,0.12)] sm:px-6">
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-200">Event Studio</p>
                <p className="mt-1 text-[10px] text-white/55">Centre de pilotage événementiel</p>
              </div>
              <p className="text-[9px] font-medium text-white/40">Créez · Invitez · Contrôlez</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
