import { getUserApiKey } from '@/utils/settings';
import { FC, useEffect, useState } from 'react';
import { translate } from '../../utils/translate';

export const ProjectTile: FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    const key = getUserApiKey();
    const useUserApiKey = process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true';
    setShowMessage(!key && useUserApiKey);
  }, []);

  return (
    <div className="flex select-none flex-col items-center justify-center gap-2 p-2 text-3xl font-semibold text-neutral-300 dark:text-neutral-500 md:text-4xl">
      {/* <div className="inline-flex items-center gap-2">
        BabyAGI{' '}
        <span className="rounded bg-blue-200 px-1 text-lg text-blue-600 dark:bg-blue-500 dark:bg-opacity-30 dark:text-blue-300 md:text-2xl">
          UI
        </span>
      </div> */}
      {showMessage && (
        <div className="inline-flex items-center gap-2">
          <span className="rounded px-1 text-sm font-normal md:text-base">
            {translate('TITLE_INSTRUCTION_OPENAI_API_KEY')}
          </span>
        </div>
      )}
    </div>
  );
};
