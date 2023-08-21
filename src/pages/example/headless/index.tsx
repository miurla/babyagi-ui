import React from 'react';
import { useAgent } from '@/hooks/useAgent';
const ExampleHeadlessPage: React.FC = () => {
  const { agentMessages, input, handleSubmit, handleInputChange } = useAgent({
    api: '/api/agent',
    agentId: 'babydeeragi',
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
          {m.type}: {m.content}
        </div>
      ))}
    </div>
  );
};

export default ExampleHeadlessPage;
