import React from 'react';

const FirstTimeUserMessage: React.FC = () => {
  return (
    <div className="fixed bottom-12 inline-flex items-center gap-2 rounded bg-neutral-500 bg-opacity-20 p-1">
      <span className="dark: rounded px-1 text-sm font-normal text-neutral-800 dark:text-white">
        👉 If you are using BabyAGI-UI for the first time, please set your
        OpenAI API Key from the settings on{' '}
        <a href={'/'} className="text-gray-500 underline">
          the top page.
        </a>
      </span>
    </div>
  );
};

export default FirstTimeUserMessage;
