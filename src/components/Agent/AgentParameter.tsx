import { FC, use, useEffect, useState } from 'react';
import { Select } from './Select';
import { SelectItem } from '@/types';
import { AGENT, ITERATIONS, MODELS } from '@/utils/constants';
import Link from 'next/link';

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
    if (model.id !== 'gpt-4') {
      setAgentOption(AGENT.filter((agent) => agent.id === 'babyagi'));
    } else {
      setAgentOption(AGENT);
    }
    setAgent(agentOption[0]);
  }, [agentOption, model, setAgent]);

  return (
    <div className="mx-auto flex flex-col items-start space-y-3 p-4 pt-12 lg:w-2/3 xl:w-2/4">
      <div className="z-10 flex w-full items-start justify-center gap-2">
        <Select
          label="Model"
          item={model}
          items={MODELS}
          onChange={(value) => {
            setModel(MODELS.find((model) => model.id === value)!);
          }}
        />
        <Select
          label="Agent"
          item={agent}
          items={agentOption}
          onChange={(value) => {
            setAgent(AGENT.find((agent) => agent.id === value)!);
          }}
        />
      </div>
      {agent.id === 'babyagi' && (
        <div className="flex w-1/2 items-start pr-1">
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
      )}
      {agent.id !== 'babycatagi' && (
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
      )}
      {agent.id !== 'babyagi' && (
        <div className="flex w-full flex-col rounded bg-neutral-50 p-2 dark:bg-neutral-600 dark:bg-opacity-20">
          <label className="pl-1 text-xs text-neutral-400 dark:text-neutral-400">
            {`This BabyAGI can search and scrape the web. However, since this is an experimental feature, it may not always work and may be slow. `}
            {'For more details: '}
            <Link
              href={
                'https://twitter.com/yoheinakajima/status/1657448504112091136'
              }
              passHref
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {'Please refer to the original paper.'}
            </Link>
          </label>
        </div>
      )}
    </div>
  );
};
