import { AgentMessage } from '@/types';
import { parseMessage } from '@/utils/message';
import { i18n } from 'next-i18next';
import { useRef, useState, useEffect, useCallback } from 'react';

export type UseAgentOptions = {
  api?: string;
  id?: string;
  onResponse?: (event: MessageEvent) => void;
  onError?: (event: Event | ErrorEvent) => void;
  onFinish?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
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
  id,
  onResponse,
  onError,
  onFinish,
  onSubmit,
  onCancel,
}: UseAgentOptions = {}): UseAgentHelpers {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [language] = useState(i18n?.language);
  const [isRunning, setIsRunning] = useState(false);

  // Handle input change
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
  };

  // Function to send the request
  const sendRequest = async (abortController: AbortController) => {
    const response = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, input, language }),
      signal: abortController.signal, // Add the abort signal
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
          const agentMessages: AgentMessage[] = message
            .trim()
            .split('\n')
            .map((m) => parseMessage(m));

          setAgentMessages((prevMessages) => [
            ...prevMessages,
            ...agentMessages,
          ]);

          // Call onResponse with the new message
          if (onResponse) {
            onResponse(new MessageEvent('message', { data: message }));
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
