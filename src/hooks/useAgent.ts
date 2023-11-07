import { AgentMessage } from '@/types';
import { parseMessage } from '@/utils/message';
import { getUserApiKey } from '@/utils/settings';
import { i18n } from 'next-i18next';
import { useRef, useState, useEffect, useCallback } from 'react';

export type UseAgentOptions = {
  api?: string;
  agentId?: string;
  modelName?: string;
  onResponse?: (event: MessageEvent) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  verbose?: boolean;
};

export type UseAgentHelpers = {
  agentMessages: AgentMessage[];
  setAgentMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>;
  handleCancel: () => void;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isRunning: boolean;
  reset: () => void;
};

export function useAgent({
  api = '/api/agent',
  agentId,
  modelName,
  onResponse,
  onError,
  onFinish,
  onSubmit,
  onCancel,
  verbose = false,
}: UseAgentOptions = {}): UseAgentHelpers {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [language] = useState(i18n?.language);
  const [isRunning, setIsRunning] = useState(false);
  const messageMap = useRef(new Map<string, AgentMessage>());

  // Handle input change
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
  };

  // Function to send the request
  const sendRequest = async (abortController: AbortController) => {
    const userKey = getUserApiKey();
    try {
      let currentMesageType;
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          agent_id: agentId,
          model_name: modelName,
          language,
          user_key: userKey,
          verbose,
        }),
        signal: abortController.signal,
      });

      const reader = response.body?.getReader();
      let partialMessage;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (value) {
            // Decode the value using TextDecoder
            const decodedValue = new TextDecoder().decode(value);
            // Split the decoded value into messages
            const splitMessages = decodedValue.split('\n\n');

            // If there is a partial message and the first split message does not start with '{"message":'
            // then prepend the partial message to the first split message
            if (partialMessage && !splitMessages[0].startsWith('{"message":')) {
              splitMessages[0] = partialMessage + splitMessages[0];
              partialMessage = null;
            }

            // If the decoded value does not end with '\n\n', then the last message is partial
            // So, pop the last message and store it as partial message
            if (!decodedValue.endsWith('\n\n')) {
              partialMessage = splitMessages.pop() || '';
            }
            // If there are no split messages, then continue to the next iteration
            if (splitMessages.length === 0) {
              continue;
            }

            // Combine the split messages into a single message
            let combinedMessage = splitMessages.join('\n\n');

            // Parse the combined message and exclude 'ping' type messages
            const newAgentMessages: AgentMessage[] = combinedMessage
              .trim()
              .split('\n\n')
              .map(parseMessage)
              .filter(
                (m): m is AgentMessage => m !== null && m.type !== 'ping',
              );

            // Update the message map
            newAgentMessages.forEach((newMsg) => {
              if (newMsg.id) {
                const existingMsg = messageMap.current.get(newMsg.id);
                if (
                  existingMsg &&
                  existingMsg.id === newMsg.id &&
                  existingMsg.type === newMsg.type &&
                  existingMsg.style === newMsg.style
                ) {
                  existingMsg.content += newMsg.content;
                  existingMsg.status = newMsg.status;
                } else {
                  messageMap.current.set(newMsg.id, newMsg);
                }
              }
            });

            // Update the current message type
            if (newAgentMessages.length > 0) {
              currentMesageType =
                newAgentMessages[newAgentMessages.length - 1]?.type;
            }

            // Update the agent messages state
            const updatedNewMessages = Array.from(messageMap.current.values());
            setAgentMessages(updatedNewMessages);

            // Call onResponse with the new message
            if (onResponse) {
              onResponse(
                new MessageEvent('message', { data: updatedNewMessages }),
              );
            }
          }

          if (abortController.signal.aborted) {
            reader.cancel();
            break;
          }
        }

        // Call onFinish when the stream is finished
        const hadFinishMessage = currentMesageType === 'finish';
        if (onFinish && hadFinishMessage) {
          onFinish();
          return;
        }
        // Call onError when there is no result message
        // stream is finished
        if (onError && !hadFinishMessage) {
          if (!currentMesageType) {
            onError(
              new Error(
                'Error: OpenAI API error occurred or Invalid OpenAI API key',
              ),
            );
            reset();
          } else {
            onError(new Error('Error: OpenAI API error occurred'));
            reset();
          }
        }
      }
    } catch (error) {
      // Call onError when an error occurs
      if (onError) {
        // If the reason for the error is abort, ignore it
        if (error instanceof Error && error.name === 'AbortError') {
          // ignore
        } else {
          onError(error as Error);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    event.preventDefault();

    // Create a new AbortController instance for each request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsRunning(true);
    setInput('');
    messageMap.current = new Map<string, AgentMessage>();

    if (onSubmit) {
      onSubmit();
    }

    try {
      await sendRequest(abortController);
    } finally {
      setIsRunning(false);
    }
  };

  // Stop function to abort the connection
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsRunning(false);

    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Reset function to reset the state
  const reset = () => {
    setAgentMessages([]);
    setInput('');
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      // Abort any ongoing request when the component is unmounted
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    agentMessages,
    setAgentMessages,
    handleCancel,
    handleInputChange,
    handleSubmit,
    input,
    setInput,
    isRunning,
    reset,
  };
}
