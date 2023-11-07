import { translate } from './translate';

export const SETTINGS_KEY = 'BABYAGIUI_SETTINGS';
export const EXECUTIONS_KEY = 'BABYAGIUI_EXECUTIONS';
export const STATE_KEY = 'BABYAGIUI_STATE';
export const EXAMPLES_KEY = 'BABYAGIUI_EXAMPLES';

export const MODELS = [
  {
    id: 'gpt-4-1106-preview',
    name: 'OpenAI GPT-4 Turbo',
    icon: 'openai-logo.svg',
    badge: 'Preview',
  },
  {
    id: 'gpt-4',
    name: 'OpenAI GPT-4',
    icon: 'openai-logo.svg',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'OpenAI GPT-3.5 Turbo',
    icon: 'openai-logo.svg',
  },
];

export const ITERATIONS = [
  { id: '0', name: 'Infinity' },
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
    id: 'babydeeragi',
    name: 'BabyDeerAGI',
    icon: '🦌',
    badge: 'STABLE',
  },
  {
    id: 'babyelfagi',
    name: 'BabyElfAGI',
    icon: '🧝',
    badge: 'BETA',
  },
];

export const ALL_AGENTS = [
  {
    id: 'babyelfagi',
    name: 'BabyElfAGI',
    icon: '🧝',
    badge: 'BETA',
  },
  {
    id: 'babydeeragi',
    name: 'BabyDeerAGI',
    icon: '🦌',
    message: '🤖/🔎+📄/🧑‍💻',
    badge: 'STABLE',
  },
  {
    id: 'babycatagi',
    name: 'BabyCatAGI',
    icon: '🐱',
    message: '🤖/🔎+📄',
  },
  {
    id: 'babybeeagi',
    name: 'BabyBeeAGI',
    icon: '🐝',
    message: '🤖/🔎/📄',
  },
  { id: 'babyagi', name: 'BabyAGI', icon: '👶', message: '🤖' },
];

export const THEME = [
  { id: 'system', name: 'SYSTEM', icon: '🖥️' },
  { id: 'light', name: 'LIGHT', icon: '🌞' },
  { id: 'dark', name: 'DARK', icon: '🌚' },
];

export const SPECIFIED_SKILLS = ['text_completion', 'web_search']; // for BabyDeerAGI
