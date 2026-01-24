import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartSaarthi",
  keywords: [
    "SmartSaarthi",
    "AI",
    "Voicebot"
  ],
  authors: [
    {
      name: "NullPointers",
      url: "https://github.com/SuhasKanwar/SmartSaarthi"
    },
    {
      name: "Suhas Kanwar",
      url: "https://suhaskanwar.tech",
    },
    {
      name: "Pratyaksh Saluja",
      url: "https://github.com/PratyakshSaluja"
    }
  ],
  description: "SmartSaarthi is a multilingual AI voice assistant that intelligently resolves Tier-1 driver and rider queries through natural Hindi conversations. It maintains context across calls, handles real-world noise, and ensures a smooth, confidence-based warm handoff to human agents—preventing frustration and improving resolution quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}