import { Message } from '@/types';
import { translate } from '@/utils/translate';
import { FC, FormEvent, useState } from 'react';
import { Check } from 'react-feather';

export interface AgentMessageInputProps {
  message: Message;
  onSubmit: (message: string) => Promise<void>;
}

export const AgentMessageInput: FC<AgentMessageInputProps> = ({
  message,
  onSubmit,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmit(text);
    setText('');
  };

  return (
    <div
      className={` text-gray-800 dark:border-gray-900/50 dark:text-gray-100 ${message.bgColor}`}
    >
      <div className="relative m-auto flex gap-4 px-4 pb-4 text-base md:max-w-2xl md:gap-6 md:pb-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="invisible w-10 pt-0.5 text-xl">{message.icon}</div>
        <form onSubmit={handleSubmit} className="flex w-full items-center">
          <input
            type="text"
            placeholder={translate('USER_INPUT_PLACEHOLDER', 'constants')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="datk:placeholder-neutral-500  w-full rounded-l-lg border border-neutral-200 bg-white py-2 pl-4 pr-12 text-base placeholder-neutral-300 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-black dark:placeholder-neutral-600 focus:dark:border-neutral-500"
          />
          <button
            type="submit"
            disabled={text.length === 0}
            className="rounded-r-lg border-y border-r border-neutral-200 bg-neutral-100 px-3 py-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <Check className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
