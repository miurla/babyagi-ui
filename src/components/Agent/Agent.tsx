import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  AgentStatus,
  AgentType,
  Execution,
  Message,
  SelectItem,
  UserSettings,
} from '@/types';
import { Input } from './Input';
import AgentMessage from './AgentMessage';
import { AgentParameter } from './AgentParameter';
import { ProjectTile } from './ProjectTile';
import { AgentMessageHeader } from './AgentMessageHeader';
import { getExportText, loadingAgentMessage } from '../../utils/message';
import { BabyAGI } from '@/agents/babyagi';
import { BabyBeeAGI } from '@/agents/babybeeagi/agent';
import { BabyCatAGI } from '@/agents/babycatagi/agent';
import { AGENT, ITERATIONS, MODELS, SETTINGS_KEY } from '@/utils/constants';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useExecution } from '@/hooks/useExecution';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';

export const Agent: FC = () => {
  const [model, setModel] = useState<SelectItem>(MODELS[0]);
  const [iterations, setIterations] = useState<SelectItem>(ITERATIONS[0]);
  const [objective, setObjective] = useState<string>('');
  const [firstTask, setFirstTask] = useState<string>('Develop a task list');
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    type: 'ready',
  });
  const [agent, setAgent] = useState<BabyAGI | BabyBeeAGI | BabyCatAGI | null>(
    null,
  );
  const [modeChecked, setModeChecked] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<SelectItem>(AGENT[0]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    addExecution,
    updateExec,
    executions,
    selectedExecutionId,
    selectExecution,
  } = useExecution();
  const { isExecuting, setExecuting } = useExecutionStatus();

  const scrollToBottom = useCallback(() => {
    const behavior = isExecuting ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (selectedExecutionId) {
      const selectedExecution = executions.find(
        (exe) => exe.id === selectedExecutionId,
      );
      if (selectedExecution) {
        setMessages(selectedExecution.messages);
      }
    } else {
      setMessages([]);
      setObjective('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExecutionId]);

  useEffect(() => {
    const execution = executions.find((exe) => exe.id === selectedExecutionId);
    if (execution) {
      const updatedExecution: Execution = {
        ...execution,
        messages: messages,
      };
      updateExec(updatedExecution);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // manage data
  const saveNewData = async () => {
    const execution: Execution = {
      id: uuidv4(),
      name: objective,
      date: new Date().toISOString(),
      params: {
        objective: objective,
        model: model,
        iterations: iterations,
        firstTask: firstTask,
        agent: selectedAgent.id as AgentType,
      },
      messages: messages,
    };

    selectExecution(execution.id);
    await new Promise((resolve) => {
      addExecution(execution);
      resolve(null);
    });

    return execution;
  };

  // handler functions
  const messageHandler = (message: Message) => {
    setMessages((messages) => [...messages, message]);

    // show toast notification
    if (message.type === 'complete') {
      toast.success('All Tasks Completed!');
    } else if (message.type === 'done') {
      toast.success('Task Completed!');
    }
  };

  const inputHandler = (value: string) => {
    setObjective(value);
  };

  const startHandler = async () => {
    if (needSettingsAlert()) {
      alert('Please set up your OpenAI API key from the settings menu.');
      return;
    }

    setMessages([]);
    setExecuting(true);
    const execution = await saveNewData();
    const verbose = true;
    let agent = null;
    switch (selectedAgent.id) {
      case 'babyagi':
        agent = new BabyAGI(
          objective,
          model.id,
          Number(iterations.id),
          firstTask,
          execution.id,
          messageHandler,
          setAgentStatus,
          () => {
            setAgent(null);
            setExecuting(false);
          },
          verbose,
        );
        break;
      case 'babybeeagi':
        agent = new BabyBeeAGI(
          objective,
          model.id,
          firstTask,
          messageHandler,
          setAgentStatus,
          () => {
            setAgent(null);
            setExecuting(false);
          },
          verbose,
        );
        break;
      case 'babycatagi':
        agent = new BabyCatAGI(
          objective,
          model.id,
          messageHandler,
          setAgentStatus,
          () => {
            setAgent(null);
            setExecuting(false);
          },
          verbose,
        );
        break;
    }
    setAgent(agent);
    agent?.start();
  };

  const stopHandler = () => {
    setExecuting(false);
    agent?.stop();
  };

  const clearHandler = () => {
    setMessages([]);
    selectExecution(undefined);
    // setStatus('ready');
    setAgentStatus({ type: 'ready' });
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(getExportText(messages));
    toast.success('Copied to clipboard');
  };

  const downloadHandler = () => {
    const element = document.createElement('a');
    const file = new Blob([getExportText(messages)], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${objective.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
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
            agent={selectedAgent}
            setAgent={setSelectedAgent}
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
          {isExecuting && (
            <AgentMessage message={loadingAgentMessage(agentStatus)} />
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
        onCopy={copyHandler}
        onDownload={downloadHandler}
        isExecuting={isExecuting}
        hasMessages={messages.length > 0}
        isBabyBeeAGIMode={modeChecked && model.id === 'gpt-4'}
      />
    </div>
  );
};
