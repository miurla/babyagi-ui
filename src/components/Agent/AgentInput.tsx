import TextareaAutosize from 'react-textarea-autosize';
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
import { FC, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { FeedbackButtons } from './FeedbackButtons';

type InputProps = {
  value: string;
  handleSubmit: (
    event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>,
  ) => void;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleCancel: () => void;
  handleClear: () => void;
  handleCopy: () => void;
  handleDownload: () => void;
  handleFeedback: (isGood: boolean) => void;
  isRunning: boolean;
  hasMessages: boolean;
  type?: string;
  evaluation?: 'good' | 'bad';
};

// Extracted the button components to make the main component cleaner
const StopButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="rounded border border-neutral-500 bg-white px-4 py-2 text-black hover:opacity-80 dark:bg-neutral-900 dark:text-white md:top-0"
    onClick={onClick}
  >
    <StopIcon className="mb-[2px] inline-block" /> {translate('Stop')}
  </button>
);

const NewButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="rounded border border-neutral-500 bg-white px-4 py-2 text-black hover:opacity-80 dark:bg-neutral-900 dark:text-white md:top-0"
    onClick={onClick}
  >
    <PlusIcon className="mb-[2px] inline-block" /> {translate('New')}
  </button>
);

export const AgentInput: FC<InputProps> = ({
  value,
  handleSubmit,
  handleInputChange,
  handleCancel,
  handleClear,
  handleCopy,
  handleDownload,
  handleFeedback,
  isRunning,
  hasMessages,
  type,
  evaluation,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasMessages) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Simplified the button rendering logic
  const renderButton = () => {
    if (isRunning) {
      return <StopButton onClick={handleCancel} />;
    }

    if (hasMessages) {
      return <NewButton onClick={handleClear} />;
    }

    return null;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent !bg-transparent bg-gradient-to-t from-white via-white to-neutral-900/0 pt-6 dark:border-white/20 dark:bg-[#444654] dark:from-black dark:via-neutral-950 md:pt-2">
      <div className="stretch last:mb-2md:last:mb-6 mx-4 flex flex-col gap-3 lg:mx-auto lg:max-w-3xl">
        <div className="flex-cols flex justify-between">
          <div className="w-1/3"></div>
          <div className="flex w-1/3 justify-center">{renderButton()}</div>
          <div className="flex w-1/3 justify-end">
            {!isRunning && hasMessages && (
              <div className="inline-flex items-center gap-2">
                <FeedbackButtons
                  handleFeedback={handleFeedback}
                  evaluation={evaluation}
                />
                <div>
                  <DividerVerticalIcon className="text-black opacity-30 dark:text-white" />
                </div>
                <div className="flex gap-1">
                  <button
                    className="w-fit rounded p-2 text-black hover:opacity-50 dark:text-white md:top-0"
                    onClick={handleCopy}
                  >
                    <ClipboardIcon className="mb-[2px] inline-block" />
                  </button>
                  <button
                    className="w-fit rounded p-2 text-black hover:opacity-50 dark:text-white md:top-0"
                    onClick={handleDownload}
                  >
                    <DownloadIcon className="mb-[2px] inline-block" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative flex w-full flex-grow flex-col justify-end rounded-xl border border-black/10 bg-white py-3 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-neutral-800 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] md:py-4 md:pl-4">
          <form onSubmit={handleSubmit}>
            <TextareaAutosize
              className="m-0 h-6 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-12 text-black outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:text-white dark:placeholder-neutral-600 md:pl-0"
              placeholder={
                type === 'babyagi'
                  ? 'Input your objective here... (e.g. Solve world hunger)'
                  : 'Input your objective here...'
              }
              value={value}
              maxRows={8}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              className="absolute right-5 rounded-sm p-1 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none disabled:opacity-30 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              disabled={value.length === 0 || isRunning || hasMessages}
              type="submit"
            >
              {isRunning ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                <PlayIcon className="opacity-60" />
              )}
            </button>
          </form>

          <div
            className={`absolute -right-7 ${
              isRunning && 'animate-pulse text-green-500'
            }`}
          >
            {isRunning ? <DotFilledIcon className="h-5 w-5" /> : null}
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
