import { AgentMessage, AgentTask } from '@/types';
import { relevantInfoExtraction } from './relevantInfoExtraction';
import { chunk } from 'lodash';

export const largeTextExtract = async (
  id: string,
  objective: string,
  largeString: string,
  task: AgentTask,
  userApiKey?: string,
  callback?: (message: AgentMessage) => void,
  signal?: AbortSignal,
  model?: string,
) => {
  const chunkSize = model === 'gpt-4-1106-preview' ? 127000 : 15000;
  const overlap = 500;
  let notes = '';

  // for status message
  const total = Math.ceil(largeString.length / (chunkSize - overlap));

  for (let i = 0; i < largeString.length; i += chunkSize - overlap) {
    callback?.({
      content: `    - chunk ${i / (chunkSize - overlap) + 1} of ${total}\n`,
      style: 'log',
      type: task.skill,
      id: id,
      taskId: task.id.toString(),
      status: 'running',
    });

    const chunk = largeString.slice(i, i + chunkSize);

    const response = await relevantInfoExtraction(
      objective,
      task.task,
      notes,
      chunk,
      userApiKey,
      signal,
      model,
    );
    notes += response;
  }
  return notes;
};
