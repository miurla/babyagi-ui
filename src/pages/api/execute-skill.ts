import { SkillRegistry } from '@/agents/babyelfagi/registory/skillRegistry';
import { AgentTask } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { task, dependent_task_outputs, objective, skill_name } = req.body;

  const agentTask: AgentTask = JSON.parse(task);
  const skillRegistry = new SkillRegistry();
  const skill = skillRegistry.getSkill(skill_name as string); // Get the skill by its name

  try {
    const taskOutput = await skill.execute(
      agentTask,
      dependent_task_outputs,
      objective,
    );
    res.status(200).json({ taskOutput });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
}
