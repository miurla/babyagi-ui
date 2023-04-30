import { FC } from 'react';
import { Select } from './Select';
import { SelectItem } from '@/types';
import { ITERATIONS, MODELS } from '@/utils/constants';

interface AgentParameterProps {
  model: SelectItem;
  setModel: (model: SelectItem) => void;
  iterations: SelectItem;
  setIterations: (iterations: SelectItem) => void;
  firstTask: string;
  setFirstTask: (firstTask: string) => void;
}

export const AgentParameter: FC<AgentParameterProps> = ({
  model,
  setModel,
  iterations,
  setIterations,
  firstTask,
  setFirstTask,
}) => {
  return (
    <div className="mx-auto flex flex-col items-center space-y-3 p-4 pt-12 lg:w-2/3 xl:w-2/4">
      <div className="flex w-full items-start justify-center gap-2">
        <Select
          label="Model"
          item={model}
          items={MODELS}
          onChange={(value) => {
            setModel(MODELS.find((model) => model.id === value)!);
          }}
        />
        <Select
          label="Iterations"
          item={iterations}
          items={ITERATIONS}
          onChange={(value) => {
            setIterations(
              ITERATIONS.find((iterations) => iterations.id === value)!,
            );
          }}
        />
      </div>
      <div className="flex w-full flex-col">
        <label className="mb-2 text-left text-xs text-neutral-700 dark:text-neutral-400">
          {'First Task'}
        </label>
        <input
          className="w-full rounded-lg border border-neutral-200 p-3 text-neutral-600 focus:outline-none dark:border-neutral-600 dark:bg-[#343541] dark:text-white"
          value={firstTask}
          onChange={(e) => setFirstTask(e.target.value)}
        ></input>
      </div>
    </div>
  );
};
