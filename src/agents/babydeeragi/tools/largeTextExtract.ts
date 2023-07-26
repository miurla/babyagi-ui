import { AgentStatus, AgentTask } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { relevantInfoExtractionAgent } from '../agents/relevantInfoExtraction/agent';
import axios from 'axios';
import React from 'react';

export const largeTextExtract = async (
  objective: string,
  largeString: string,
  task: AgentTask,
  isRunningRef?: React.MutableRefObject<boolean>,
  callback?: (message: string) => void,
  signal?: AbortSignal,
) => {
  const chunkSize = 15000;
  const overlap = 500;
  let notes = '';

  // for status message
  const total = Math.ceil(largeString.length / (chunkSize - overlap));

  for (let i = 0; i < largeString.length; i += chunkSize - overlap) {
    if (!isRunningRef?.current) break;

    callback?.(`    - chunk ${i / (chunkSize - overlap) + 1} of ${total}\n`);

    const chunk = largeString.slice(i, i + chunkSize);
    // Client side call
    if (getUserApiKey()) {
      const response = await relevantInfoExtractionAgent(
        objective,
        task.task,
        notes,
        chunk,
      );
      notes += response;
    } else {
      // Server side call
      const response = await axios
        .post(
          '/api/tools/extract',
          {
            objective: objective,
            task: task.task,
            chunk,
            notes,
          },
          {
            signal: signal,
          },
        )
        .catch((error) => {
          if (error.name === 'AbortError') {
            console.log('Request aborted', error.message);
          } else {
            console.log(error.message);
          }
        });
      notes += response?.data?.response;
    }
  }
  return notes;
};
