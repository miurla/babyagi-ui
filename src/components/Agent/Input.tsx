import {
  PlayIcon,
  ReloadIcon,
  StopIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { FC } from 'react';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  onStart: (value: string) => void;
  onStop: () => void;
  onClear: () => void;
  isStreaming: boolean;
  hasMessages: boolean;
};

export const Input: FC<InputProps> = ({
  value,
  onChange,
  onStart,
  onStop,
  onClear,
  isStreaming,
  hasMessages,
}) => {
  return (
    <div className="dark:bg-vert-dark-gradient absolute bottom-0 left-0 w-full border-transparent bg-white from-[#343541] via-[#343541] to-[#343541]/0 pt-6 dark:border-white/20 dark:!bg-transparent dark:bg-[#444654] dark:bg-gradient-to-t md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-11 md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {isStreaming ? (
          <button
            className="absolute -top-2 left-0 right-0 mx-auto w-fit rounded border border-gray-500 px-4 py-2 text-black hover:opacity-50 dark:bg-[#343541] dark:text-white md:top-0"
            onClick={() => {
              onStop();
            }}
          >
            <StopIcon className="mb-[2px] inline-block" /> {'Stop'}
          </button>
        ) : hasMessages ? (
          <button
            className="absolute -top-2 left-0 right-0 mx-auto w-fit rounded border border-gray-500 px-4 py-2 text-black hover:opacity-50 dark:bg-[#343541] dark:text-white md:top-0"
            onClick={() => {
              onClear();
            }}
          >
            <ReloadIcon className="mb-[2px] inline-block" /> {'Reset'}
          </button>
        ) : null}
        <div className="relative flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white py-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] md:py-3 md:pl-4">
          <input
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 text-black outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:text-white md:pl-0"
            placeholder="Input your objective here... (e.g. Solve world hunger)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            className="absolute right-5 rounded-sm p-1 text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900 focus:outline-none disabled:opacity-30 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => {
              onStart(value);
            }}
            disabled={value.length === 0 || isStreaming}
          >
            {isStreaming ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              <PlayIcon className="opacity-60" />
            )}
          </button>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pb-6 md:pt-3">
        <a
          href="https://github.com/miurla/babyagi-ui"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          BabyAGI UI
        </a>
        {' is designed to make it easier to run and develop with '}
        <a
          href="https://github.com/yoheinakajima/babyagi"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          babyagi
        </a>
        {' in a web app, like a ChatGPT.'}
      </div>
    </div>
  );
};
