import { FC, useEffect, useRef, useState } from 'react';
import va from '@vercel/analytics';
import { Execution, SelectItem, Block } from '@/types';
import { AgentInput } from './AgentInput';
import { AgentParameter } from './AgentParameter';
import { ProjectTile } from './ProjectTile';
import { AgentMessageHeader } from './AgentMessageHeader';
import {
  getExportAgentMessage,
  getAgentLoadingMessage,
  groupMessages,
  convertToAgentMessages,
} from '../../utils/message';
import { AGENT, ITERATIONS, MODELS } from '@/utils/constants';
import { translate } from '@/utils/translate';
import { useTranslation } from 'next-i18next';
import { IntroGuide } from './IntroGuide';
import { SkillsList } from './SkillList';
import { AgentBlock } from './AgentBlock';
import AgentLoading from './AgentLoading';
import {
  useAgent,
  useSkills,
  useExecutionManagement,
  useApiKeyCheck,
  useNotifications,
  useErrorHandler,
  useResetAndDeselect,
  useClipboard,
  useFileDownload,
  useFeedback,
  useScrollControl,
  useCurrentEvaluation,
} from '@/hooks';
import { toast } from 'sonner';

export const AgentView: FC = () => {
  // Custom hooks
  const { i18n } = useTranslation();

  // useState hooks
  const [model, setModel] = useState<SelectItem>(MODELS[0]);
  const [iterations, setIterations] = useState<SelectItem>(ITERATIONS[0]);
  const [objective, setObjective] = useState<string>('');
  const [firstTask, setFirstTask] = useState<string>(
    translate('FIRST_TASK_PLACEHOLDER', 'constants'),
  );
  const [selectedAgent, setSelectedAgent] = useState<SelectItem>(AGENT[0]);
  const [language, setLanguage] = useState(i18n.language);
  const [agentBlocks, setAgentBlocks] = useState<Block[]>([]);

  // useRef hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const skills = useSkills(selectedAgent.id);
  const {
    saveNewData,
    updateExec,
    executions,
    selectedExecutionId,
    selectExecution,
  } = useExecutionManagement();
  const { checkAndAlertApiKeySetting } = useApiKeyCheck();
  const { notifyTaskCompletion } = useNotifications();
  const { errorHandler } = useErrorHandler();
  const { copyToClipboard } = useClipboard();
  const { downloadFile } = useFileDownload();
  const { currentEvaluation } = useCurrentEvaluation(
    executions,
    selectedExecutionId,
  );

  // Functions
  const stopHandler = () => {
    va.track('Stop');
    toast(translate('EXECUTION_STOPPED', 'agent'));
  };

  const startHandler = async () => {
    if (checkAndAlertApiKeySetting()) {
      return;
    }

    saveNewData(
      input,
      model,
      iterations,
      firstTask,
      selectedAgent,
      agentMessages,
    );
    va.track('Start', {
      model: model.id,
      agent: selectedAgent.id,
      iterations: iterations.id,
    });
  };

  const finishHandler = async () => {
    notifyTaskCompletion(input);
  };

  const copyHandler = () => {
    copyToClipboard(getExportAgentMessage(agentBlocks));
  };

  const downloadHandler = () => {
    const filename =
      objective.length > 0
        ? `${objective.replace(/\s/g, '_')}.txt`
        : 'download.txt';
    downloadFile(filename, getExportAgentMessage(agentBlocks));
  };

  const {
    input,
    setInput,
    agentMessages,
    setAgentMessages,
    isRunning,
    handleInputChange,
    handleSubmit,
    handleCancel,
    reset,
  } = useAgent({
    api: '/api/agent',
    agentId: selectedAgent.id,
    modelName: model.id,
    verbose: false,
    onSubmit: startHandler,
    onCancel: stopHandler,
    onFinish: finishHandler,
    onError: errorHandler,
  });
  const { clearHandler } = useResetAndDeselect(reset, selectExecution);
  const { feedbackHandler } = useFeedback(
    updateExec,
    executions,
    selectedExecutionId,
    agentMessages,
    setAgentMessages,
  );
  const { scrollToBottom } = useScrollControl(
    messagesEndRef,
    agentBlocks,
    isRunning,
  );

  useEffect(() => {
    if (selectedExecutionId) {
      const selectedExecution = executions.find(
        (exe) => exe.id === selectedExecutionId,
      );
      if (selectedExecution) {
        if (selectedExecution.messages) {
          const messages = convertToAgentMessages(selectedExecution.messages);
          setAgentMessages(messages);
        } else {
          setAgentMessages(selectedExecution.agentMessages);
        }
      }
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExecutionId]);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n]);

  useEffect(() => {
    const execution = executions.find((exe) => exe.id === selectedExecutionId);
    if (execution) {
      const updatedExecution: Execution = {
        ...execution,
        agentMessages,
      };
      updateExec(updatedExecution);
    }

    const newGroupedMessages = groupMessages(agentMessages, isRunning);
    setAgentBlocks(newGroupedMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentMessages, isRunning]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <div className="overflow-none relative flex-1 bg-white dark:bg-black">
      {agentMessages.length === 0 ? (
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
          {selectedAgent.id !== 'babyagi' && <SkillsList skills={skills} />}
          <div className="h-[calc(100vh-600px)]">
            <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
              <ProjectTile />
              {(selectedAgent.id === 'babydeeragi' ||
                selectedAgent.id === 'babyelfagi') && (
                <IntroGuide
                  onClick={(value) => setInput(value)}
                  agent={selectedAgent.id}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="max-h-full overflow-scroll">
          <AgentMessageHeader model={model} agent={selectedAgent} />
          {agentBlocks.map((block, index) => (
            <AgentBlock key={index} block={block} />
          ))}
          {isRunning && (
            <AgentLoading message={getAgentLoadingMessage(agentBlocks)} />
          )}
          <div
            className="h-[162px] bg-white dark:bg-black"
            ref={messagesEndRef}
          />
        </div>
      )}
      <AgentInput
        value={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleCancel={handleCancel}
        handleClear={clearHandler}
        handleCopy={copyHandler}
        handleDownload={downloadHandler}
        handleFeedback={feedbackHandler}
        isRunning={isRunning}
        hasMessages={agentMessages.length > 0}
        type={selectedAgent.id}
        evaluation={currentEvaluation()}
      />
    </div>
  );
};
