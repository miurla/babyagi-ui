import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Message, MessageStatus, SelectItem, UserSettings } from '@/types';
import { Input } from './Input';
import AgentMessage from './AgentMessage';
import { AgentParameter } from './AgentParameter';
import { ProjectTile } from './ProjectTile';
import { AgentMessageHeader } from './AgentMessageHeader';
import { loadingAgentMessage } from '../../utils/message';
import { BabyAGI } from '@/agents/babyagi';
import { ITERATIONS, MODELS, SETTINGS_KEY } from '@/utils/constants';
import { BabyBeeAGI } from '@/agents/babybeeagi/agent';

export const Agent: FC = () => {
  const [model, setModel] = useState<SelectItem>(MODELS[0]);
  const [iterations, setIterations] = useState<SelectItem>(ITERATIONS[0]);
  const [objective, setObjective] = useState<string>('');
  const [firstTask, setFirstTask] = useState<string>('Develop a task list');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<MessageStatus>('ready');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [agent, setAgent] = useState<BabyAGI | BabyBeeAGI | null>(null);
  const [modeChecked, setModeChecked] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const messageHandler = (message: Message) => {
    setMessages((messages) => [...messages, message]);
  };

  const inputHandler = (value: string) => {
    setObjective(value);
  };

  const startHandler = () => {
    if (needSettingsAlert()) {
      alert('Please set up your OpenAI API key from the settings menu.');
      return;
    }

    setMessages([]);
    setIsStreaming(true);

    const useBabyBeeAgi = modeChecked && model.id === 'gpt-4';
    const verbose = false;
    let agent = null;
    if (useBabyBeeAgi) {
      agent = new BabyBeeAGI(
        objective,
        model.id,
        firstTask,
        messageHandler,
        setStatus,
        () => {
          setAgent(null);
          setIsStreaming(false);
        },
        verbose,
      );
    } else {
      agent = new BabyAGI(
        objective,
        model.id,
        Number(iterations.id),
        firstTask,
        messageHandler,
        setStatus,
        () => {
          setAgent(null);
          setIsStreaming(false);
        },
        verbose,
      );
    }
    setAgent(agent);
    agent.start();
  };

  const stopHandler = () => {
    setIsStreaming(false);
    agent?.stop();
  };

  const clearHandler = () => {
    setMessages([]);
    setStatus('ready');
  };

  const needSettingsAlert = () => {
    const useUserApiKey = process.env.NEXT_PUBLIC_USE_USER_API_KEY;
    if (useUserApiKey === 'false') {
      return false;
    }

    const userSettings = localStorage.getItem(SETTINGS_KEY);
    if (userSettings) {
      const { openAIApiKey } = JSON.parse(userSettings) as UserSettings;
      if (openAIApiKey && openAIApiKey?.length > 0) {
        return false;
      }
    }
    return true;
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
            checked={modeChecked}
            setChecked={setModeChecked}
          />
          <div className="h-[calc(100vh-450px)]">
            <ProjectTile />
          </div>
        </>
      ) : (
        <div className="max-h-full overflow-scroll">
          <AgentMessageHeader model={model} iterations={iterations} />
          {messages.map((message, index) => (
            <AgentMessage key={index} message={message} />
          ))}
          {isStreaming && (
            <AgentMessage message={loadingAgentMessage(status)} />
          )}
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
