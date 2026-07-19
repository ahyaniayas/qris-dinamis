import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'QRIS Dinamis Converter',
  description: 'Convert your Static QRIS into Dynamic QRIS easily and securely.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
