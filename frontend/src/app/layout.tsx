import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | PANOPTICON',
    default: 'PANOPTICON – Forensic Intelligence Platform',
  },
  description:
    'AI-powered forensic intelligence platform for law enforcement. Reconstruct crime scenes, track suspects, and generate forensic reports.',
  keywords: ['forensics', 'AI', 'law enforcement', 'CCTV', 'investigation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
