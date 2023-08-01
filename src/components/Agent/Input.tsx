import TextareaAutosize from 'react-textarea-autosize';
import { AgentType } from '@/types';
import { translate } from '@/utils/translate';
import {
  ClipboardIcon,
  DividerVerticalIcon,
  DotFilledIcon,
  DownloadIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { ThumbsUp, ThumbsDown } from 'react-feather';
import { FC } from 'react';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  onStart: (value: string) => void;
  onStop: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onFeedback: (value: boolean) => void;
  isExecuting: boolean;
  hasMessages: boolean;
  agent: AgentType;
  evaluation?: 'good' | 'bad';
};

export const Input: FC<InputProps> = ({
  value,
  onChange,
  onStart,
  onStop,
  onClear,
  onCopy,
  onDownload,
  onFeedback,
  isExecuting,
  hasMessages,
  agent,
  evaluation,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasMessages) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onStart(value);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent !bg-transparent bg-gradient-to-t from-white via-white to-neutral-900/0 pt-6 dark:border-white/20 dark:bg-[#444654] dark:from-black dark:via-neutral-950 md:pt-2">
      <div className="stretch last:mb-2md:last:mb-6 mx-4 flex flex-col gap-3 lg:mx-auto lg:max-w-3xl">
        <div className="flex-cols flex justify-between">
          <div className="w-1/3"></div>
          <div className="flex w-1/3 justify-center">
            {isExecuting ? (
              <button
                className="rounded border border-neutral-500 bg-white px-4 py-2 text-black hover:opacity-80 dark:bg-neutral-900 dark:text-white md:top-0"
                onClick={() => {
                  onStop();
                }}
              >
                <StopIcon className="mb-[2px] inline-block" />{' '}
                {translate('Stop')}
              </button>
            ) : hasMessages ? (
              <button
                className="rounded border border-neutral-500 bg-white px-4 py-2 text-black hover:opacity-80 dark:bg-neutral-900 dark:text-white md:top-0"
                onClick={() => {
                  onClear();
                }}
              >
                <PlusIcon className="mb-[2px] inline-block" />{' '}
                {translate('New')}
              </button>
            ) : null}
          </div>
          <div className="flex w-1/3 justify-end">
            {!isExecuting && hasMessages && (
              <div className="inline-flex items-center gap-2">
                <div className="flex gap-1">
                  {!evaluation || evaluation === 'good' ? (
                    <button
                      className="w-fit rounded p-2 text-black hover:opacity-50 disabled:opacity-30 dark:text-white md:top-0"
                      onClick={() => {
                        onFeedback(true);
                      }}
                      disabled={evaluation === 'good'}
                    >
                      <ThumbsUp className="mb-[2px] inline-block h-4 w-4" />
                    </button>
                  ) : null}
                  {!evaluation || evaluation === 'bad' ? (
                    <button
                      className="w-fit rounded p-2 text-black hover:opacity-50 disabled:opacity-30 dark:text-white md:top-0"
                      onClick={() => {
                        onFeedback(false);
                      }}
                      disabled={evaluation === 'bad'}
                    >
                      <ThumbsDown className="mb-[2px] inline-block h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div>
                  <DividerVerticalIcon className="text-black opacity-30 dark:text-white" />
                </div>
                <div className="flex gap-1">
                  <button
                    className="w-fit rounded p-2 text-black hover:opacity-50 dark:text-white md:top-0"
                    onClick={onCopy}
                  >
                    <ClipboardIcon className="mb-[2px] inline-block" />
                  </button>
                  <button
                    className="w-fit rounded p-2 text-black hover:opacity-50 dark:text-white md:top-0"
                    onClick={onDownload}
                  >
                    <DownloadIcon className="mb-[2px] inline-block" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative flex w-full flex-grow flex-col justify-end rounded-xl border border-black/10 bg-white py-3 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-neutral-800 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] md:py-4 md:pl-4">
          <TextareaAutosize
            className="m-0 h-6 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-12 text-black outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:text-white dark:placeholder-neutral-600 md:pl-0"
            placeholder={
              agent !== 'babyagi'
                ? 'Input your objective here...'
                : 'Input your objective here... (e.g. Solve world hunger)'
            }
            value={value}
            maxRows={8}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute right-5 rounded-sm p-1 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none disabled:opacity-30 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            onClick={() => {
              onStart(value);
            }}
            disabled={value.length === 0 || isExecuting || hasMessages}
          >
            {isExecuting ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              <PlayIcon className="opacity-60" />
            )}
          </button>
          <div
            className={`absolute -right-7 ${
              isExecuting && 'animate-pulse text-green-500'
            }`}
          >
            {isExecuting ? <DotFilledIcon className="h-5 w-5" /> : null}
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2 text-center text-xs text-black/50 dark:text-white/30 md:px-4 md:pb-6 md:pt-3">
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
