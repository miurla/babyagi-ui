import { Agent } from '@/components/Agent/Agent';
import { Navbar } from '@/components/Mobile/Navbar';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';
import { languages } from '../utils/languages';

function Home() {
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [newObjectiveClicked, setNewObjectiveClicked] = useState(false);

  const menuClickHandler = () => {
    setShowSidebar(!showSidebar);
  };

  const newObjectiveClickHandler = () => {
    setNewObjectiveClicked(true);
    setTimeout(() => {
      setNewObjectiveClicked(false);
    }, 100);
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
        <div className="fixed top-0 w-full sm:hidden">
          <Navbar onMenuClick={menuClickHandler} />
        </div>
        <div className="flex h-full w-full pt-12 sm:pt-0">
          {showSidebar && (
            <div>
              <Sidebar onMenuClick={menuClickHandler} />
            </div>
          )}
          <Agent />
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
