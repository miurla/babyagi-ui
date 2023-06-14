import { AgentTask } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { relevantInfoExtractionAgent } from '../agents/relevantInfoExtraction/agent';
import axios from 'axios';
import React from 'react';

export const largeTextExtract = async (
  objective: string,
  largeString: string,
  task: AgentTask,
  isRunningRef: React.MutableRefObject<boolean>,
  signal?: AbortSignal,
) => {
  const chunkSize = 1500;
  const overlap = 500;
  let notes = '';

  for (let i = 0; i < largeString.length; i += chunkSize - overlap) {
    if (!isRunningRef.current) break;

    const chunk = largeString.slice(i, i + chunkSize);
    // Client side call
    if (getUserApiKey()) {
      const response = await relevantInfoExtractionAgent(
        objective,
        task.task,
        notes,
        chunk,
        'gpt-3.5-turbo-0613',
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
