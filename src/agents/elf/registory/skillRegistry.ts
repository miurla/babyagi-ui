import { AgentMessage } from '@/types';
import {
  // CodeReader,
  // CodeReviewer,
  // CodeWriter,
  // DirectoryStructure,
  // SkillSaver,
  TextCompletion,
  WebLoader,
  WebSearch,
  YoutubeSearch,
} from '../skills';
import { Skill } from '../skills/skill';

export class SkillRegistry {
  skillClasses: (typeof Skill)[];
  skills: Skill[] = [];
  apiKeys: { [key: string]: string };
  // for UI
  handleMessage: (message: AgentMessage) => Promise<void>;
  verbose: boolean;
  language: string = 'en';

  constructor(
    handleMessage: (message: AgentMessage) => Promise<void>,
    verbose: boolean = false,
    language: string = 'en',
  ) {
    this.skillClasses = SkillRegistry.getSkillClasses();
    this.apiKeys = SkillRegistry.apiKeys;
    //
    this.handleMessage = handleMessage;
    this.verbose = verbose;
    this.language = language;

    // Load all skills
    for (let SkillClass of this.skillClasses) {
      let skill = new SkillClass(
        this.apiKeys,
        this.handleMessage,
        this.verbose,
        this.language,
      );
      if (
        skill.type === 'dev' ? process.env.NODE_ENV === 'development' : true
      ) {
        this.skills.push(skill);
      }
    }

    this.skills.filter((skill) => skill.valid);

    // Print the names and descriptions of all loaded skills
    let loadedSkills = this.skills
      .map((skill) => {
        return `${skill.icon} ${skill.name}: ${skill.descriptionForHuman}`;
      })
      .join('\n');
    if (this.verbose) {
      console.log(`Loaded skills:\n${loadedSkills}`);
    }
  }

  static getSkillClasses(): (typeof Skill)[] {
    const skills: (typeof Skill)[] = [
      TextCompletion,
      WebSearch,
      WebLoader,
      YoutubeSearch,
      // AirtableSaver,
      // CodeReader,
      // CodeWriter,
      // SkillSaver,
      // DirectoryStructure,
      // CodeReviewer,
    ];
    return skills;
  }

  static apiKeys = {
    openai: process.env.OPENAI_API_KEY || '',
    airtable: process.env.AIRTABLE_API_KEY || '',
  };

  getSkill(name: string): Skill {
    const skill = this.skills.find((skill) => {
      return skill.name === name;
    });
    if (!skill) {
      throw new Error(
        `Skill '${name}' not found. Please make sure the skill is loaded and all required API keys are set.`,
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
        return `${skill.icon} ${skill.name}: ${skill.descriptionForModel}`;
      })
      .join(',');
  }
}
