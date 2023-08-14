import { AIStreamCallbacks, createCallbacksTransformer } from 'ai';
import { AgentMessage } from '@/types';

export function AgentStream(callbacks?: AIStreamCallbacks) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  return {
    stream: stream.readable.pipeThrough(createCallbacksTransformer(callbacks)),
    handlers: {
      handleMessage: async (message: AgentMessage) => {
        await writer.ready;
        await writer.write(
          `${JSON.stringify({
            message,
          })}\n`,
        );
      },
      handleEnd: async () => {
        await writer.ready;
        await writer.close();
      },
      handleError: async (e: Error) => {
        await writer.ready;
        await writer.abort(e);
      },
    },
  };
}
