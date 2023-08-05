import { useRef, useEffect, useState } from 'react';

export type UseAgentOptions = {
  api?: string;
  id?: string;
  onResponse?: (event: MessageEvent) => void;
  onError?: (event: Event | ErrorEvent) => void;
  onFinish?: () => void;
};

export type UseAgentHelpers = {
  agentMessages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  stop: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export function useAgent({
  api = '/api/agent',
  id,
  onResponse,
  onError,
  onFinish,
}: UseAgentOptions = {}): UseAgentHelpers {
  const abortControllerRef = useRef<AbortController | null>(
    new AbortController(),
  );
  const [agentMessages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create a new AbortController instance for each request
    abortControllerRef.current = new AbortController();

    try {
      // Send POST request with input and id
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, input }),
        signal: abortControllerRef.current.signal, // Add the abort signal
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
            setMessages((prevMessages) => [...prevMessages, message]);

            // Call onResponse with the new message
            if (onResponse) {
              onResponse(new MessageEvent('message', { data: message }));
            }
          }

          if (abortControllerRef.current === null) {
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
        onError(new ErrorEvent('error', { error }));
      }
    }
  };

  // Stop function to abort the connection
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    agentMessages,
    setMessages,
    stop,
    handleInputChange,
    handleSubmit,
    input,
    setInput,
  };
}
