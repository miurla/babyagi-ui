import { Message } from '@/types';
import { translate } from '@/utils/translate';
import { FC, FormEvent, useState } from 'react';
import { Check } from 'react-feather';

export interface AgentMessageInputProps {
  id: number;
  message: Message;
  onSubmit: (id: number, message: string) => Promise<void>;
}

export const AgentMessageInput: FC<AgentMessageInputProps> = ({
  id,
  message,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmit(id, text);
    setSubmitted(true);
    setText('');
  };

  return (
    <div className="relative m-auto flex w-full flex-col gap-4 p-6 px-4 text-base text-neutral-900 dark:text-neutral-300 md:max-w-2xl md:gap-6 md:p-8 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <div className="flex w-full gap-4">
          <div className="flex aspect-square h-9 items-center justify-center rounded-full border border-neutral-200 text-lg dark:border-neutral-800">
            {message.icon}
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="focus:border-1 w-full pt-1.5 text-base font-medium focus:border-purple-500 focus:bg-white">
              <span>{`${message.id}. `}</span>
              <span>{message.text}</span>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full items-center">
              <input
                type="text"
                placeholder={translate('USER_INPUT_PLACEHOLDER', 'constants')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitted}
                className="datk:placeholder-neutral-500  w-full rounded-l-lg border border-neutral-200 bg-white py-2 pl-4 pr-12 text-base placeholder-neutral-300 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-black dark:placeholder-neutral-600 focus:dark:border-neutral-500"
              />
              <button
                type="submit"
                disabled={text.length === 0}
                hidden={submitted}
                className="rounded-r-lg border-y border-r border-neutral-200 bg-neutral-100 px-3 py-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
