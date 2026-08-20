import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Daily Healer — Louise Hay Affirmation Guide',
  description: 'A compassionate healing assistant inspired by Louise Hay\'s You Can Heal Your Life. Discover affirmations, probable causes, and personalized guidance for mind-body wellness.',
  keywords: ['affirmations', 'Louise Hay', 'healing', 'self-love', 'wellness', 'mental patterns'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scroll">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
