# BabyAGI UI

BabyAGI UI is designed to make it easier to run and develop with [babyagi](https://github.com/yoheinakajima/babyagi) in a web app, like a ChatGPT.
This is a port of [babyagi](https://github.com/yoheinakajima/babyagi) from Python to TypeScript with [Langchain.js](https://github.com/hwchase17/langchainjs) and build a user interface.

![](./public/screenshot-230425.png)

## Roadmap

- [ ] Display the current task and task list
- [ ] User feedback
- [ ] Other LLM models support
- [ ] i18n support
- [ ] Execution history
- [ ] Exporting Execution Results

and more ...

## Stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## Getting Started

1. Clone the repository

```sh
git clone https://github.com/miurla/babyagi-ui
```

2. Go to the project holder

```sh
cd babyagi-ui
```

3. Install packages with npm

```sh
npm install
```

4. Setup your .env file. And set the variables.

   - 👉 If you set values from the app, you can skip this step.

```sh
cp .env.example .env.
```

5. Run the project

```sh
npm run dev
```

## Deploy

### Vercel

Host your own live version of BabyAGI UI with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmiurla%2Fbabyagi-ui)

## Warning

This script is designed to be run continuously as part of a task management system. Running this script continuously can result in high API usage, so please use it responsibly. Additionally, the script requires the OpenAI API to be set up correctly, so make sure you have set up the API before running the script.

[original](https://github.com/yoheinakajima/babyagi#warning)
