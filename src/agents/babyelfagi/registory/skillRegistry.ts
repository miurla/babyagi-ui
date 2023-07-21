import { Message } from '@/types';
import { ConfigurationParams } from '../skills';
import { Skill } from '../skills/skill';

export class SkillRegistry {
  skillClasses: (typeof Skill)[];
  skills: Skill[] = [];
  apiKeys: { [key: string]: string };
  // for UI
  messageCallback: (message: Message) => void;
  abortController: AbortController;
  isRunningRef?: React.MutableRefObject<boolean>;
  verbose: boolean;
  language: string = 'en';

  constructor(
    config: ConfigurationParams,
    messageCallback: (message: Message) => void,
    abortController: AbortController,
    isRunningRef?: React.MutableRefObject<boolean>,
    verbose: boolean = false,
    language: string = 'en',
  ) {
    this.skillClasses = config.skillClasses;
    this.apiKeys = config.apiKeys;
    //
    this.messageCallback = messageCallback;
    this.abortController = abortController;
    this.isRunningRef = isRunningRef;
    this.verbose = verbose;
    this.language = language;

    // Load all skills
    for (let SkillClass of this.skillClasses) {
      let skill = new SkillClass(
        this.apiKeys,
        this.messageCallback,
        this.abortController,
        this.isRunningRef,
        this.verbose,
        this.language,
      );
      if (skill.valid) {
        this.skills.push(skill);
      }
      console.log(`Loaded skill: ${skill}`);
    }

    // Print the names and descriptions of all loaded skills
    let loadedSkills = this.skills
      .map((skill) => {
        const skillClass = skill.constructor as typeof Skill;
        return `${skillClass.skillIcon} ${skillClass.skillName}: ${skillClass.skillDescriptionForHuman}`;
      })
      .join('\n');
    if (this.verbose) {
      console.log(`Loaded skills:\n${loadedSkills}`);
    }
  }

  getSkill(skillName: string): Skill {
    const skill = this.skills.find((skill) => {
      const skillClass = skill.constructor as typeof Skill;
      return skillClass.skillName === skillName;
    });
    if (!skill) {
      throw new Error(
        `Skill '${skillName}' not found. Please make sure the skill is loaded and all required API keys are set.`,
      );
    }
    return skill;
  }

  getAllSkills(): Skill[] {
    return this.skills;
  }

  getSkillDescriptions(): string {
    return this.skills
      .map((skill) => {
        const skillClass = skill.constructor as typeof Skill;
        return `${skillClass.skillIcon} ${skillClass.skillName}: ${skillClass.skillDescriptionForModel}`;
      })
      .join(',');
  }
}
