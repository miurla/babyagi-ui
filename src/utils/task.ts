import { AgentTask } from '@/types';

const camelToSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const snakeToCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const convertKeys = (obj: any, converter: (key: string) => string): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter));
  }

  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = converter(key);
      newObj[newKey] = convertKeys(obj[key], converter);
    }
  }
  return newObj;
};

export const stringifyTasks = (tasks: AgentTask[]): string => {
  const snakeCaseTasks = convertKeys(tasks, camelToSnakeCase);
  return JSON.stringify(snakeCaseTasks);
};

export const parseTasks = (jsonString: string): AgentTask[] => {
  const parsedObj = JSON.parse(jsonString);
  const camelCaseObj = convertKeys(parsedObj, snakeToCamelCase);
  return camelCaseObj;
};

export const getTaskById = (taskList: AgentTask[], id: number) => {
  return taskList.find((task) => task.id === id);
};
