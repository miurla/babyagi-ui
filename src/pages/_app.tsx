import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { ExecutionProvider } from '@/hooks/useExecution';
import { ExecutionStatusProvider } from '@/hooks/useExecutionStatus';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ExecutionProvider>
        <ExecutionStatusProvider>
          <Component {...pageProps} />
          <Toaster theme="dark" />
          <Analytics />
        </ExecutionStatusProvider>
      </ExecutionProvider>
    </ThemeProvider>
  );
}
