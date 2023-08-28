import { useState, useEffect } from 'react';
import { BabyElfAGI } from '@/lib/agents/babyelfagi/executer';
import { SPECIFIED_SKILLS } from '@/utils/constants';

type SkillInfo = {
  name: string;
  description: string;
  icon: string;
  badge: string;
};

export const useSkills = (selectedAgentId?: string) => {
  const [skillInfos, setSkillInfos] = useState<SkillInfo[]>([]);

  useEffect(() => {
    const specificSkills =
      selectedAgentId === 'babydeeragi' ? SPECIFIED_SKILLS : [];
    const elf = new BabyElfAGI(
      '',
      '',
      {
        handleMessage: async (message) => {},
        handleEnd: async () => {},
        handleError: async (error) => {},
      },
      'en',
      false,
      specificSkills,
    );
    const skills = elf.skillRegistry.getAllSkills();
    const newSkillInfos = skills.map((skill) => {
      const skillInfo = {
        name: skill.name,
        description: skill.descriptionForHuman,
        icon: skill.icon,
        badge: skill.type,
      };
      return skillInfo;
    });
    setSkillInfos(newSkillInfos);
  }, [selectedAgentId]);

  return skillInfos;
};
