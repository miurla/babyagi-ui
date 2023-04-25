import '@/styles/globals.css';
import { ThemeProvider } from 'next-theme';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}
