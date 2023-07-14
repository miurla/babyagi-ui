export class Skill {
  name: string = 'base skill';
  description: string = 'This is the base skill.';
  apiKeysRequired: Array<string | Array<string>> = [];
  valid: boolean;
  apiKeys: { [key: string]: string };

  // This index signature allows dynamic assignment of properties
  [key: string]: any;

  constructor(apiKeys: { [key: string]: string }) {
    this.apiKeys = apiKeys;
    const missingKeys = this.checkRequiredKeys(apiKeys);
    if (missingKeys.length > 0) {
      console.log(`Missing API keys for ${this.name}: ${missingKeys}`);
      this.valid = false;
    } else {
      this.valid = true;
    }
    for (const key of this.apiKeysRequired) {
      if (Array.isArray(key)) {
        for (const subkey of key) {
          if (subkey in apiKeys) {
            this[`${subkey}_apiKey`] = apiKeys[subkey];
          }
        }
      } else if (key in apiKeys) {
        this[`${key}_apiKey`] = apiKeys[key];
      }
    }
  }

  checkRequiredKeys(apiKeys: {
    [key: string]: string;
  }): Array<string | Array<string>> {
    const missingKeys: Array<string | Array<string>> = [];
    for (const key of this.apiKeysRequired) {
      if (Array.isArray(key)) {
        if (!key.some((k) => k in apiKeys)) {
          missingKeys.push(key);
        }
      } else if (!(key in apiKeys)) {
        missingKeys.push(key);
      }
    }
    return missingKeys;
  }

  execute(
    params: any,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<any> {
    // This method should be overridden by subclasses
    throw new Error("Method 'execute' must be implemented");
  }
}
