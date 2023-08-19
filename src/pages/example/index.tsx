import React from 'react';
import { useAgent } from '@/hooks/useAgent';
const ExamplePage: React.FC = () => {
  const { agentMessages, input, handleSubmit, handleInputChange } = useAgent({
    api: '/api/agent',
  });
  return (
    <div className="p-12">
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Input your objective..."
          onChange={handleInputChange}
        />
      </form>
      {agentMessages.map((m) => (
        <div key={m.id}>
          {m.title && (
            <div className="font-bold">
              {m.icon}: {m.title}
            </div>
          )}
          <div>{m.content}</div>
        </div>
      ))}
    </div>
  );
};

export default ExamplePage;
