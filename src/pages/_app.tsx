import '@/styles/globals.css';
import { ThemeProvider } from 'next-theme';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Component {...pageProps} />
      <Analytics />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}
