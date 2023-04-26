import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SelectItem, UserSettings } from '@/types';
import { Input } from './Input';
import AgentMessage from './AgentMessage';
import { AgentParameter, iterationList, models } from './AgentParameter';
import { ProjectTile } from './ProjectTile';
import { AgentMessageHeader } from './AgentMessageHeader';
import { getAgentMessage, loadingAgentMessage } from '../../utils';

export const Agent: FC = () => {
  const [model, setModel] = useState<SelectItem>(models[1]);
  const [iterations, setIterations] = useState<SelectItem>(iterationList[0]);
  const [objective, setObjective] = useState<string>('');
  const [firstTask, setFirstTask] = useState<string>('Develop a task list');
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const fetchAgent = async () => {
    const userSettings = localStorage.getItem('userSettings');

    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objective,
        firstTask,
        model: model.id,
        iterations: iterations.id,
        userSettings: userSettings ? JSON.parse(userSettings) : null,
      }),
      signal: abortControllerRef.current.signal,
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedValue = decoder.decode(value);
        const lines = decodedValue.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const unescapedData = line.slice(6).replace(/\\n/g, '\n');
            setMessages((messages) => [...messages, unescapedData]);
          }
        }
      }

      // Complete the stream
      setIsStreaming(false);
      // Reset abortControllerRef
      abortControllerRef.current = new AbortController();
    }
  };

  const inputHandler = (value: string) => {
    setObjective(value);
  };

  const startHandler = () => {
    if (!availableUserSettings()) {
      alert(
        'Please set up your OpenAI API key and Pinecone config from the settings menu.',
      );
      return;
    }

    setMessages([]);
    setIsStreaming(true);
    fetchAgent();
  };

  const stopHandler = () => {
    console.log('Stop streaming');
    setIsStreaming(false);
    abortControllerRef.current.abort();
    // Reset abortControllerRef
    abortControllerRef.current = new AbortController();
  };

  const clearHandler = () => {
    setMessages([]);
  };

  const availableUserSettings = () => {
    const useEnvValues = process.env.NEXT_PUBLIC_USE_ENV_VALUES;
    if (useEnvValues === 'true') {
      return true;
    }

    const userSettings = localStorage.getItem('userSettings');
    if (userSettings) {
      const { openAIApiKey, pineconeApiKey, pineconeEnvironment } = JSON.parse(
        userSettings,
      ) as UserSettings;
      if (
        openAIApiKey &&
        openAIApiKey?.length > 0 &&
        pineconeApiKey &&
        pineconeApiKey?.length > 0 &&
        pineconeEnvironment &&
        pineconeEnvironment?.length > 0
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="overflow-none relative flex-1 bg-white dark:bg-[#343541]">
      {messages.length === 0 ? (
        <>
          <AgentParameter
            model={model}
            setModel={setModel}
            iterations={iterations}
            setIterations={setIterations}
            firstTask={firstTask}
            setFirstTask={setFirstTask}
          />
          <div className="h-[calc(100vh-317px)]">
            <ProjectTile />
          </div>
        </>
      ) : (
        <div className="max-h-full overflow-scroll">
          <AgentMessageHeader model={model} iterations={iterations} />
          {messages.map((message, index) => (
            <AgentMessage key={index} message={getAgentMessage(message)} />
          ))}
          {isStreaming && <AgentMessage message={loadingAgentMessage} />}
          <div
            className="h-[162px] bg-white dark:bg-[#343541]"
            ref={messagesEndRef}
          />
        </div>
      )}
      <Input
        value={objective}
        onChange={inputHandler}
        onStart={startHandler}
        onStop={stopHandler}
        onClear={clearHandler}
        isStreaming={isStreaming}
        hasMessages={messages.length > 0}
      />
    </div>
  );
};
