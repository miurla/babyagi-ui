import { FC, use, useEffect, useState } from 'react';
import { Select } from './Select';
import { SelectItem } from '@/types';
import { AGENT, ITERATIONS, MODELS } from '@/utils/constants';
import { translate } from '../../utils/translate';
import { getUserApiKey } from '@/utils/settings';

interface AgentParameterProps {
  model: SelectItem;
  setModel: (model: SelectItem) => void;
  iterations: SelectItem;
  setIterations: (iterations: SelectItem) => void;
  firstTask: string;
  setFirstTask: (firstTask: string) => void;
  agent: SelectItem;
  setAgent: (agent: SelectItem) => void;
}

export const AgentParameter: FC<AgentParameterProps> = ({
  model,
  setModel,
  iterations,
  setIterations,
  firstTask,
  setFirstTask,
  agent,
  setAgent,
}) => {
  const [agentOption, setAgentOption] = useState<SelectItem[]>(AGENT);
  useEffect(() => {
    let option: SelectItem[] = [];
    if (model.id !== 'gpt-4') {
      option = AGENT.filter(
        (agent) =>
          agent.id === 'babyagi' ||
          agent.id === 'babydeeragi' ||
          agent.id === 'babyelfagi',
      );
    } else {
      option = AGENT;
    }
    setAgent(option[0]);
    setAgentOption(option);
  }, [model]);

  return (
    <div className="mx-auto flex flex-col items-start space-y-3 p-4 pt-14 lg:w-2/3 xl:w-2/4">
      <div className="z-20 flex w-full items-start justify-center gap-2">
        <Select
          label={translate('MODEL')}
          item={model}
          items={MODELS}
          onChange={(value) => {
            setModel(MODELS.find((model) => model.id === value)!);
          }}
        />
        <Select
          label={translate('AGENT')}
          item={agent}
          items={agentOption}
          onChange={(value) => {
            setAgent(AGENT.find((agent) => agent.id === value)!);
          }}
        />
      </div>
      {agent.id === 'babyagi' && (
        <div className="z-10 flex w-1/2 items-start pr-1">
          <Select
            label={translate('ITERATIONS')}
            item={iterations}
            items={ITERATIONS}
            onChange={(value) => {
              setIterations(
                ITERATIONS.find((iterations) => iterations.id === value)!,
              );
            }}
          />
        </div>
      )}
      {agent.id !== 'babycatagi' &&
        agent.id !== 'babydeeragi' &&
        agent.id !== 'babyelfagi' && (
          <div className="flex w-full flex-col">
            <label className="mb-2 text-left text-xs text-neutral-400 dark:text-neutral-500">
              {translate('FIRST_TASK')}
            </label>
            <input
              className="w-full rounded-lg border border-neutral-200 p-3 text-neutral-600 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              value={firstTask}
              onChange={(e) => setFirstTask(e.target.value)}
            ></input>
          </div>
        )}
    </div>
  );
};
