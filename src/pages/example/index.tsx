import React from 'react';
import { useAgent } from '@/hooks/useAgent';
const ExamplePage: React.FC = () => {
  const { agentMessages, input, handleSubmit, handleInputChange } = useAgent();
  return (
    <div className="p-12">
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
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Input your objective..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
};

export default ExamplePage;
