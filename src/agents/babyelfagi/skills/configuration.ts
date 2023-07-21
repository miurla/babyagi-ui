import { Skill } from './skill';

export interface ConfigurationParams {
  skillClasses: (typeof Skill)[];
  apiKeys: { [key: string]: string };
}

export class Configuration {
  skillClasses: (typeof Skill)[];
  apiKeys: { [key: string]: string };

  constructor(params: ConfigurationParams) {
    this.skillClasses = params.skillClasses;
    this.apiKeys = params.apiKeys;
  }
}
