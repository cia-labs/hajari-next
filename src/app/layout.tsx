import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import PlausibleProvider from "next-plausible";
import "react-day-picker/dist/style.css";
// import "@/styles/au-theme-sidebar.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AU Apps",
  description: "Atria University Attendance System",
  icons: {
    icon: "/Atria logo white.svg",
  },
};

const plausibleSite = process.env.NEXT_PUBLIC_PLAUSIBLE_SITE;
const plausibleURL = process.env.NEXT_PUBLIC_PLAUSIBLE_URL;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>AU Apps</title>
          <meta
            name="description"
            content="Atria University Attendance System"
          />
          <link rel="icon" href="/Atria logo white.svg" type="image/svg+xml" />

          <PlausibleProvider
            domain={plausibleSite || "localhost"}
            customDomain={plausibleURL || "http://localhost"}
            trackOutboundLinks={true}
            trackFileDownloads={true}
            taggedEvents={true}
            pageviewProps={true}
            hash={true}
          />
        </head>
        <body className={inter.className}>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
