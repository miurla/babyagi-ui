import { AIStreamCallbacks, createCallbacksTransformer } from 'ai';
import { AgentMessage } from '@/types';

export function AgentStream(callbacks?: AIStreamCallbacks) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let observers: ((isActive: boolean) => void)[] = [];

  let wasActive: boolean | null = null;
  const isWriterActive = () => writer.desiredSize !== null;
  const notifyObservers = () => {
    const isActive = isWriterActive();
    if (wasActive !== isActive) {
      observers.forEach((observer) => observer(isActive));
      wasActive = isActive;
    }
  };

  return {
    stream: stream.readable.pipeThrough(createCallbacksTransformer(callbacks)),
    handlers: {
      handleMessage: async (message: AgentMessage) => {
        notifyObservers();
        if (!isWriterActive()) return;
        await writer.ready;
        await writer.write(
          `${JSON.stringify({
            message,
          })}\n\n`,
        );
      },
      handleEnd: async () => {
        notifyObservers();
        if (!isWriterActive()) return;
        await writer.ready;
        await writer.close();
      },
      handleError: async (e: Error) => {
        notifyObservers();
        if (!isWriterActive()) return;
        await writer.ready;
        await writer.abort(e);
      },
    },
    addObserver: (observer: (isActive: boolean) => void) => {
      observers.push(observer);
    },
  };
}
