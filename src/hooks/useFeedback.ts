// src/hooks/useFeedback.ts
import axios from 'axios';
import { toast } from 'sonner';
import { translate } from '../utils/translate';
import { AgentMessage, Execution } from '@/types';

export const useFeedback = (
  updateExec: Function,
  executions: Execution[],
  selectedExecutionId: string | undefined,
  agentMessages: AgentMessage[],
  setAgentMessages: Function,
) => {
  const feedbackHandler = (isGood: boolean) => {
    let selectedExecution = executions.find(
      (exe) => exe.id === selectedExecutionId,
    );
    if (selectedExecution) {
      setAgentMessages(selectedExecution.agentMessages);
    }
    const feedbackObjective = selectedExecution?.params.objective;
    const feedbackModel = selectedExecution?.params.model.id;
    const feedbackAgent = selectedExecution?.params.agent;
    const feedbackIterations = Number(selectedExecution?.params.iterations.id);

    let lastResult = agentMessages
      .filter((message) => message.type === 'result')
      .pop()?.content;
    const lastTaskList = agentMessages
      .filter((message) => message.type === 'task-list')
      .pop()?.content;
    const sessionSummary = agentMessages
      .filter((message) => message.type === 'session-summary')
      .pop()?.content;
    const finished = lastResult !== undefined;
    const output = sessionSummary;

    axios.post('/api/feedback', {
      objective: feedbackObjective,
      evaluation: isGood ? 'good' : 'bad',
      model: feedbackModel,
      agent: feedbackAgent,
      iterations: feedbackIterations,
      last_result: lastResult,
      task_list: lastTaskList,
      session_summary: sessionSummary,
      finished: finished,
      output: output,
    });

    toast.success(translate('FEEDBACK_SUBMITTED_TOAST', 'constants'));

    // update execution
    if (selectedExecution) {
      selectedExecution.evaluation = isGood ? 'good' : 'bad';
      updateExec(selectedExecution);
    }
  };

  return { feedbackHandler };
};
