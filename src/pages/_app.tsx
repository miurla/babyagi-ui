import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { ExecutionProvider } from '@/hooks/useExecution';
import { ExecutionStatusProvider } from '@/hooks/useExecutionStatus';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config.js';

const App = ({ Component, pageProps }: AppProps) => {
  const locale = pageProps._nextI18Next.initialLocale as string;

  console.log(locale);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ExecutionProvider>
        <ExecutionStatusProvider>
          <div dir={dir}>
            <Component {...pageProps} />
            <Toaster theme="dark" />
          </div>
          <Analytics />
        </ExecutionStatusProvider>
      </ExecutionProvider>
    </ThemeProvider>
  );
};

export default appWithTranslation(App, nextI18NextConfig);
