import type { Metadata, Viewport } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google'; // taste-skill-ignore: mono is for code blocks only
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import './globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
// taste-skill-ignore: JetBrains Mono is loaded for literal code only.
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' }); // taste-skill-ignore

export const metadata: Metadata = {
  title: { default: 'Backend Academy: Master Backend Engineering', template: '%s · Backend Academy' },
  description:
    'Learn backend engineering from the fundamentals to production-grade architecture through interactive lessons, real-world examples, coding exercises, and practical examinations.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#101114' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> before hydration. */}
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2.5 focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        {/* Marks JS as available before hydration, so [data-reveal] parts start hidden without a flash;
            without JS they simply stay visible. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
