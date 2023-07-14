import { ConfigurationParams } from '../skills';
import { Skill } from '../skills/skill';

export class SkillRegistry {
  skills: { [key: string]: Skill };
  skillClasses: (typeof Skill)[];
  apiKeys: { [key: string]: string };

  constructor(config: ConfigurationParams) {
    this.skills = {};
    this.skillClasses = config.skillClasses;
    this.apiKeys = config.apiKeys;

    // Load all skills
    for (let SkillClass of this.skillClasses) {
      let skill = new SkillClass(this.apiKeys);
      if (skill.valid) {
        this.skills[skill.name] = skill;
      }
    }

    // Print the names and descriptions of all loaded skills
    let skillInfo = Object.values(this.skills)
      .map((skill) => `${skill.name}: ${skill.description}`)
      .join('\n');
    console.log(skillInfo);
  }

  getSkill(skillName: string): Skill {
    let skill = this.skills[skillName];
    if (!skill) {
      throw new Error(
        `Skill '${skillName}' not found. Please make sure the skill is loaded and all required API keys are set.`,
      );
    }
    return skill;
  }

  getAllSkills(): { [key: string]: Skill } {
    return this.skills;
  }

  getSkillDescriptions(): string {
    return Object.values(this.skills)
      .map((skill) => `${skill.name}: ${skill.description}`)
      .join(',');
  }
}
