import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
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
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-hidden`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
