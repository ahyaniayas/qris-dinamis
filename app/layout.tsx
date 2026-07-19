import type { Metadata } from 'next';
import './globals.css';
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme-provider';

const plusJakarta = Plus_Jakarta_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'QRIS Dinamis',
  description: 'Ubah QRIS Statis menjadi Dinamis dengan mudah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", plusJakarta.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="pattern-dots"></div>
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <main className="container">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
