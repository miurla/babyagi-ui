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
  onError?: (event: Event | ErrorEvent) => void;
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

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (value) {
            const message = new TextDecoder().decode(value);
            const newAgentMessages: AgentMessage[] = message
              .trim()
              .split('\n')
              .map((m) => parseMessage(m));

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
        if (onFinish) {
          onFinish();
        }
      }
    } catch (error) {
      // Call onError when an error occurs
      if (onError) {
        // If the reason for the error is abort, ignore it
        if (error instanceof Error && error.name === 'AbortError') {
          // ignore
        } else {
          onError(
            new ErrorEvent('error', {
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          );
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
    } catch (error) {
      // Call onError when an error occurs
      if (onError) {
        onError(new ErrorEvent('error', { error }));
      }
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
