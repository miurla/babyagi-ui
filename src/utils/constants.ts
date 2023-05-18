import { translate } from './translate';

export const SETTINGS_KEY = 'BABYAGIUI_SETTINGS';
export const EXECUTIONS_KEY = 'BABYAGIUI_EXECUTIONS';

export const MODELS = [
  {
    id: 'gpt-4',
    name: 'OpenAI gpt-4',
    message: `GPT_4_WARNING`,
    icon: 'openai-logo.svg',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'OpenAI gpt-3.5-turbo',
    icon: 'openai-logo.svg',
  },
  {
    id: 'text-davinci-003',
    name: 'OpenAI text-davinci-003',
    icon: 'openai-logo.svg',
  },
];

export const ITERATIONS = [
  { id: '0', name: 'Infinity' }, // translate('INFINITY', 'constants') this translation is not working
  { id: '1', name: '1' },
  { id: '3', name: '3' },
  { id: '5', name: '5' },
  { id: '10', name: '10' },
  { id: '20', name: '20' },
  { id: '50', name: '50' },
];

export const BABYBEEAGI_ITERATIONS = [
  { id: '0', name: 'Until All tasks completed 🐝' }, //${translate('UNTIL_ALL_TASKS_COMPLETED', 'constants') this translation is not working
];

export const AGENT = [
  {
    id: 'babycatagi',
    name: 'BabyCatAGI',
    icon: '🐱',
    message: 'TOOLS: 🤖/🔎+📄',
    badge: 'NEW',
  },
  {
    id: 'babybeeagi',
    name: 'BabyBeeAGI',
    icon: '🐝',
    message: 'TOOLS: 🤖/🔎/📄',
  },
  { id: 'babyagi', name: 'BabyAGI', icon: '👶', message: 'TOOLS: 🤖' },
];
