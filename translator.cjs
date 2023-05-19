require('dotenv').config();
const fs = require('fs');
const path = require('path');

class Translator {
  constructor(srcLang, targetLang, transService, settings = {}) {
    this.srcLang = srcLang;
    this.targetLang = targetLang;
    this.keyNamespacePairs = [];
    this.keyTextNamespacePairs = [];
    this.manualMode = false;
    this.translatorService =
      transService || process.env.TRANSLATOR_SERVICE || 'google';
    this.openaiTranslationMethod =
      settings.openaiTranslationMethod ||
      process.env.OPENAI_TRANSLATION_METHOD ||
      'chat';

    if (
      this.translatorService === 'openai' &&
      process.env.OPENAI_API_KEY !== ''
    ) {
    const { Configuration, OpenAIApi } = require('openai');
      this.configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.openai = new OpenAIApi(this.configuration);
    } else {
      return "ERROR: OpenAI API key is not set but the translator service is set to 'openai'";
    }
  }

  collectKeyNamespacePairs(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        this.collectKeyNamespacePairs(filePath); // Recursively process subdirectories
      } else if (
        stats.isFile() &&
        (file.endsWith('.ts') || file.endsWith('.tsx'))
      ) {
        this.extractKeyNamespacePairs(filePath);
      }
    });
  }

  extractKeyNamespacePairs(filePath) {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    const regex =
      /(?:translate\(|i18n\?\.t\(|t\()['"](?!(?:\\n|a)['"])([^'"]+)['"](?:\s?,\s?['"]([^'"]+)['"])?(?:,\s?['"]([^'"]+)['"])?\)/g;
    let match;

    while ((match = regex.exec(fileContent)) !== null) {
      const key = match[1];
      let defaultText = match[3]
        ? match[2]
        : match[2] !== ''
        ? match[2]
        : 'common';
      let namespace = match[3]
        ? match[3] !== ''
          ? match[3]
          : 'common'
        : match[2]
        ? match[2] !== ''
          ? match[2]
          : 'common'
        : 'common';
      if (this.debug && !match[3] && !match[4]) {
        console.log(
          key +
            ' at line ' +
            fileContent.substring(0, regex.lastIndex).split('\n').length +
            ' ' +
            filePath,
        );
      }

      if (match[3]) {
        this.keyTextNamespacePairs.push({ key, defaultText, namespace });
        const replacement = `translate("${key}", "${namespace}")`;
        fileContent = fileContent.replace(match[0], replacement);
      } else {
        this.keyNamespacePairs.push({ key, namespace });
      }
    }
    fs.writeFileSync(filePath, fileContent, 'utf8');
  }

  async translateAndWriteFiles() {
    const translationDir = path.join(
      __dirname,
      'public',
      'locales',
      'translation',
    );

    if (fs.existsSync(translationDir)) {
      fs.rmdirSync(translationDir, { recursive: true, force: true });
    }

    fs.mkdirSync(translationDir);

    await Promise.all(
      this.keyNamespacePairs.map(async ({ key, namespace }) => {
        const srcLangFilePath = path.join(
          __dirname,
          'public',
          'locales',
          this.srcLang,
          `${namespace}.json`,
        );
        const targetLangFilePath = path.join(
          translationDir,
          `${namespace}.json`,
        );
        if (!fs.existsSync(targetLangFilePath)) {
          fs.writeFileSync(targetLangFilePath, '{}');
        }

        const sourceTranslationValue = this.getTranslationValue(
          srcLangFilePath,
          key,
          namespace
        );
        if (sourceTranslationValue !== '') {
          const translatedValue = await this.translateText(
            sourceTranslationValue,
          );
          this.writeTranslationFile(targetLangFilePath, key, translatedValue);
        } else {
          if (this.manualMode) {
            rl.question(
              `Would you like to manually enter the translation for the key ${key} on ${this.targetLang} language?`,
              async (answer) => {
                if (answer === 'yes' || answer === 'y') {
                  rl.question(
                    `Enter the translation for the key "${key}": `,
                    (enteredTranslation) => {
                      this.writeTranslationFile(
                        targetLangFilePath,
                        key,
                        enteredTranslation
                      );
                      rl.close();
                    },
                  );
                } else {
                  this.writeTranslationFile(
                    targetLangFilePath,
                    key,
                    'MISSING_TRANSLATION',
                  );
                  rl.close();
                }
              },
            );
          } else {
            this.writeTranslationFile(
              targetLangFilePath,
              key,
              'MISSING_TRANSLATION',
            );
          }
        }
      }),
    );

    if (this.keyTextNamespacePairs.length > 0) {
      await Promise.all(
        this.keyTextNamespacePairs.map(
          async ({ key, defaultText, namespace }) => {
            const targetLangFilePath = path.join(
              translationDir,
              `${namespace}.json`,
            );
            if (!fs.existsSync(targetLangFilePath)) {
              fs.writeFileSync(targetLangFilePath, '{}');
            }
            const sourceTranslationValue = defaultText;
            if (sourceTranslationValue !== '') {
              const translatedValue = await this.translateText(
                sourceTranslationValue,
              );
              this.writeTranslationFile(
                targetLangFilePath,
                key,
                translatedValue,
              );
            } else {
              if (this.manualMode) {
                rl.question(
                  `Would you like to manually enter the translation for the key ${key} on ${this.targetLang} language?`,
                  async (answer) => {
                    if (answer === 'yes' || answer === 'y') {
                      rl.question(
                        `Enter the translation for the key "${key}": `,
                        (enteredTranslation) => {
                          this.writeTranslationFile(
                            targetLangFilePath,
                            key,
                            enteredTranslation,
                          );
                          rl.close();
                        },
                      );
                    } else {
                      this.writeTranslationFile(
                        targetLangFilePath,
                        key,
                        'MISSING_TRANSLATION',
                      );
                      rl.close();
                    }
                  },
                );
              } else {
                this.writeTranslationFile(
                  targetLangFilePath,
                  key,
                  'MISSING_TRANSLATION',
                );
              }
            }
          },
        ),
      );
    }
  }

  
getTranslationValue(filePath, key, namespace) {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = JSON.parse(content);
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) {
    if (value.hasOwnProperty(k)) {
      value = value[k];
    } else {
      value = '';
      break;
    }
  }
  return value;
}



  async translateText(sourceTranslationValue) {
    if (this.translatorService === 'google') {
      return await this.GoogleTranslate(
        this.srcLang,
        this.targetLang,
        sourceTranslationValue,
      );
    } else if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'chat'
    ) {
      const USER_PROMPT = `What you have to translate is: "${sourceTranslationValue}"\nThe language code you have to use is: ${this.targetLang}`;
      return await this.translateViaChatCompletion(USER_PROMPT);
    } else if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'text'
    ) {
      const TRANSLATE_PROMPT = `Translate the ${sourceTranslationValue} text using the ${this.targetLang} language code then respond only with the translated text.`;
      return await this.translateViaTextCompletion(TRANSLATE_PROMPT);
    } else {
      return console.log('No translator service selected.');
    }
  }

  writeTranslationFile(filePath, key, translatedValue) {
    const translation = { [key]: translatedValue };

    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath, 'utf8');
      let existingTranslations = {};

      try {
        existingTranslations = JSON.parse(existingContent);
      } catch (error) {
        console.error(`Error parsing existing translations file: ${filePath}`);
      }

      const mergedTranslations = { ...existingTranslations, ...translation };

      const sortedTranslations = Object.keys(mergedTranslations)
        .sort()
        .reduce((sortedObj, sortedKey) => {
          sortedObj[sortedKey] = mergedTranslations[sortedKey];
          return sortedObj;
        }, {});

      const mergedContent = JSON.stringify(sortedTranslations, null, 2);

      fs.writeFileSync(filePath, mergedContent, 'utf8');
    } else {
      const content = JSON.stringify(translation, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  async manageFolders() {
  const allowedLocales = await this.detectAllowedLocales();
  // Perform folder management operations based on the allowedLocales
}

async detectAllowedLocales() {
  // Detect the allowed locales by analyzing the existing translation files
  // and return an array of detected locales
  return ["en", "de", "hu", "ja", "ko", "pt"]; // test
}

async translateProject() {
  const allowedLocales = await this.detectAllowedLocales();
  const sourceTranslationDir = path.join(
    __dirname,
    'public',
    'locales',
    'translation'
  );

  if (fs.existsSync(sourceTranslationDir)) {
    const files = fs.readdirSync(sourceTranslationDir);
    files.forEach(async (file) => {
      const srcFilePath = path.join(sourceTranslationDir, file);
      const stats = fs.statSync(srcFilePath);

      if (stats.isFile()) {
        const content = fs.readFileSync(srcFilePath, 'utf8');
        const translations = JSON.parse(content);

        for (const locale of allowedLocales) {
          const targetDir = path.join(
            __dirname,
            'public',
            'locales',
            locale,
            'translation'
          );

          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const targetFilePath = path.join(targetDir, file);
          const targetContent = await this.translateJSON(translations, locale);
          fs.writeFileSync(targetFilePath, targetContent, 'utf8');
        }
      }
    });
  }
}

async translateJSON(json, locale) {
  const translatedJson = {};

  await Promise.all(
    Object.entries(json).map(async ([key, value]) => {
      if (typeof value === 'object') {
        translatedJson[key] = await this.translateJSON(value, locale);
      } else {
        this.targetLang = locale;
        const translatedValue = await this.translateText(value);
        translatedJson[key] = translatedValue;
      }
    })
  );

  return JSON.stringify(translatedJson, null, 2);
}

  // Services
  // GoogleTranslate
  GoogleTranslate = async (
    sourceLanguageCode,
    targetLanguageCode,
    sourceTranslationValue,
  ) => {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLanguageCode,
      tl: targetLanguageCode,
      dt: 't',
      q: sourceTranslationValue,
    }).toString();

    const url = `https://translate.google.com/translate_a/single?${params}`;

    const translationResult = await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const translatedText = data[0][0][0];
        return translatedText;
      })
      .catch((error) => console.log(error));

    return translationResult !== undefined
      ? translationResult.replace(/^['"`]+|['"`]+$/g, '')
      : '';
  };

  // Translate via OpenAI ChatCompletion
  translateViaChatCompletion = async (USER_PROMPT) => {
    const MASTER_PROMPT = "You are a professional translator named AT-i18n. You have to wait for the user to provide the translatable text and the target language's code. You have to respond ONLY with the translated text."
    const translationResult = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 1,
      messages: [ {role: 'system', content: MASTER_PROMPT},
        { role: 'user', content: USER_PROMPT }],
    });
    return translationResult.data.choices[0].message.content.replace(
      /^['",`]+|['",`]+$/g,
      '',
    );
  };

  // Translate via OpenAI TextCompletion
  translateViaTextCompletion = async (TRANSLATE_PROMPT) => {
    const translationResult = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt: TRANSLATE_PROMPT,
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return translationResult.data.choices[0].text
      .split('\n\n')[1]
      .replace(/^['",`]+|['",`]+$/g, '');
  };
  
  
  // main run
  async run(srcDirectory) {
    this.collectKeyNamespacePairs(srcDirectory);
    await this.translateAndWriteFiles();
    console.log('Translation files generated successfully.');
  }

}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter source language code: ', (srcLang) => {
  srcLang === '' ? (srcLang = 'en') : (srcLang = srcLang);
  rl.question('Enter target language code: ', (targetLang) => {
    targetLang === ''
      ? (targetLang = process.env.DEFAULT_TARGET_LANGUAGE || 'hu')
      : (targetLang = targetLang);
    const translator = new Translator(srcLang, targetLang);
    translator.run('src');
    rl.close();
  });
});
