import { Agent } from '@/components/Agent/Agent';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';
import { languages } from '../utils/languages';
import { STATE_KEY } from '@/utils/constants';
import { UIState } from '@/types/index.js';
import { CollapsedButton } from '@/components/Sidebar/CollapsedButton';

function Home() {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  useEffect(() => {
    const item = localStorage.getItem(STATE_KEY);
    let show = false;
    if (!item) {
      if (window.innerWidth <= 768) {
        show = false;
      } else {
        show = true;
      }
    } else {
      const state = JSON.parse(item) as UIState;
      if (state?.showSidebar === undefined) {
      } else {
        show = state.showSidebar;
      }
    }
    setShowSidebar(show);
    saveSidebarState(show);
  }, []);

  const saveSidebarState = (show: boolean) => {
    const state: UIState = { showSidebar: show };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  };

  const menuClickHandler = () => {
    setShowSidebar(!showSidebar);
    saveSidebarState(!showSidebar);
  };

  return (
    <>
      <Head>
        <title>BabyAGI-UI</title>
        <meta
          name="description"
          content="BabyAGI UI is designed to make it easier to run and develop with babyagi in a web app, like a ChatGPT."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="BabyAGI-UI" />
        <meta
          property="og:description"
          content="BabyAGI UI is designed to make it easier to run and develop with babyagi in a web app, like a ChatGPT."
        />
        <meta property="og:url" content="https://babyagi-ui.vercel.app/" />
        <meta
          property="og:image"
          content="https://babyagi-ui.vercel.app/og-image.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BabyAGI-UI" />
        <meta
          name="twitter:description"
          content="BabyAGI UI is designed to make it easier to run and develop with babyagi in a web app, like a ChatGPT."
        />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <main
        className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white`}
      >
        <div className="flex h-full w-full">
          {showSidebar && (
            <div>
              <Sidebar onMenuClick={menuClickHandler} />
            </div>
          )}
          <Agent />
        </div>
        <div className="absolute left-2 top-2">
          <CollapsedButton
            onClick={menuClickHandler}
            isWhite={false}
            isLeft={false}
          />
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  const supportedLocales = languages.map((language) => language.code);
  const chosenLocale = supportedLocales.includes(locale) ? locale : 'en';

  return {
    props: {
      ...(await serverSideTranslations(
        chosenLocale,
        nextI18NextConfig.ns as string[],
      )),
    },
  };
};

export default Home;
