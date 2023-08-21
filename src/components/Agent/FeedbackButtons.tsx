import { FC } from 'react';
import { ThumbsUp, ThumbsDown } from 'react-feather';

type FeedbackButtonsProps = {
  handleFeedback: (value: boolean) => void;
  evaluation?: 'good' | 'bad';
};

export const FeedbackButtons: FC<FeedbackButtonsProps> = ({
  handleFeedback,
  evaluation,
}) => (
  <div className="flex gap-1">
    {!evaluation || evaluation === 'good' ? (
      <button
        className="w-fit rounded p-2 text-black hover:opacity-50 disabled:opacity-30 dark:text-white md:top-0"
        onClick={() => {
          handleFeedback(true);
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
          handleFeedback(false);
        }}
        disabled={evaluation === 'bad'}
      >
        <ThumbsDown className="mb-[2px] inline-block h-4 w-4" />
      </button>
    ) : null}
  </div>
);
