import { ClerkProvider } from "@clerk/nextjs";
// import FluidCursor from "@/components/FluidCursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <main className="px-4 pt-4 min-h-screen bg-background">
        {children}
        {/* <FluidCursor /> */}
      </main>
    </ClerkProvider>
  );
}
