import { Message } from '@/types';
import {
  AirtableSaver,
  CodeReader,
  CodeReviewer,
  CodeWriter,
  DirectoryStructure,
  SkillSaver,
  TextCompletion,
  WebLoader,
  WebSearch,
  YoutubeSearch,
} from '../skills';
import { Skill } from '../skills/skill';
import { getUserApiKey } from '@/utils/settings';

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
    messageCallback?: (message: Message) => void,
    abortController?: AbortController,
    isRunningRef?: React.MutableRefObject<boolean>,
    verbose: boolean = false,
    language: string = 'en',
  ) {
    this.skillClasses = SkillRegistry.getSkillClasses();
    this.apiKeys = SkillRegistry.apiKeys;
    //
    this.messageCallback = messageCallback || (() => {});
    this.abortController = abortController || new AbortController();
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
      AirtableSaver,
      CodeReader,
      CodeWriter,
      SkillSaver,
      DirectoryStructure,
      YoutubeSearch,
      CodeReviewer,
      WebLoader,
    ];
    return skills;
  }

  static apiKeys = {
    openai: getUserApiKey() || process.env.OPENAI_API_KEY || '',
    airtable: 'keyXXXXXXXXXXXXXX', // Your Airtable API key here
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
