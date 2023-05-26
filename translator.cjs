require('dotenv').config();
const fs = require('fs');
const path = require('path');

class Translator {
  constructor(options) {
    this.srcLang = options.srcLang || null;
    this.targetLang = options.targetLang || null;
    this.translateToAllAllowed = options.translateToAllAllowed || false;
    this.keyNamespacePairs = [];
    this.keyTextNamespacePairs = [];
    this.manualMode = options.manualMode || false;
    this.translatorService =
      options.transService || process.env.TRANSLATOR_SERVICE || 'google';
    this.openaiTranslationMethod =
      options.openaiTranslationMethod ||
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
    this.translationsDir = path.join(__dirname, 'public', 'locales', 'ati18n');

    if (!fs.existsSync(this.translationsDir)) {
      fs.mkdirSync(this.translationsDir);
    }

    if (this.translateToAllAllowed) {
      const allowedLocales = await this.detectAllowedLocales();
      for (const locale of allowedLocales) {
        this.targetLang = locale;
        this.translationDir = path.join(this.translationsDir, locale);

        if (fs.existsSync(this.translationDir)) {
          fs.rmdirSync(this.translationDir, { recursive: true, force: true });
        }

        fs.mkdirSync(this.translationDir);

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
              this.translationDir,
              `${namespace}.json`,
            );
            if (!fs.existsSync(targetLangFilePath)) {
              fs.writeFileSync(targetLangFilePath, '{}');
            }

            const sourceTranslationValue = this.getTranslationValue(
              srcLangFilePath,
              key,
            );
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
              this.writeTranslationFile(
                targetLangFilePath,
                key,
                'MISSING_TRANSLATION',
              );
            }
            if (this.keyTextNamespacePairs.length > 0) {
              await Promise.all(
                this.keyTextNamespacePairs.map(
                  async ({ key, defaultText, namespace }) => {
                    const targetLangFilePath = path.join(
                      this.translationDir,
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
                      this.writeTranslationFile(
                        targetLangFilePath,
                        key,
                        'MISSING_TRANSLATION',
                      );
                    }
                  },
                ),
              );
            }
          }),
        );
      }
    } else {
      this.translationDir = path.join(
        __dirname,
        'public',
        'locales',
        'ati18n',
        this.targetLang,
      );

      if (fs.existsSync(this.translationDir)) {
        fs.rmdirSync(this.translationDir, { recursive: true, force: true });
      }

      fs.mkdirSync(this.translationDir);

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
            this.translationDir,
            `${namespace}.json`,
          );
          if (!fs.existsSync(targetLangFilePath)) {
            fs.writeFileSync(targetLangFilePath, '{}');
          }

          const sourceTranslationValue = this.getTranslationValue(
            srcLangFilePath,
            key,
          );
          if (sourceTranslationValue !== '') {
            const translatedValue = await this.translateText(
              sourceTranslationValue,
            );
            this.writeTranslationFile(targetLangFilePath, key, translatedValue);
          } else {
            this.writeTranslationFile(
              targetLangFilePath,
              key,
              'MISSING_TRANSLATION',
            );
          }
        }),
      );

      if (this.keyTextNamespacePairs.length > 0) {
        await Promise.all(
          this.keyTextNamespacePairs.map(
            async ({ key, defaultText, namespace }) => {
              const targetLangFilePath = path.join(
                this.translationDir,
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
                this.writeTranslationFile(
                  targetLangFilePath,
                  key,
                  'MISSING_TRANSLATION',
                );
                rl.close();
              }
            },
          ),
        );
      }
    }
  }

  getTranslationValue(filePath, key) {
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
    if (!fs.existsSync(this.translationDir)) {
      fs.mkdirSync(this.translationDir, { recursive: true });
    }

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

  async detectAllowedLocales() {
    // Detect the allowed locales by analyzing the i18n config file and then return an array of detected locales
    return [
      'ar',
      'au',
      'bg',
      'bn',
      'br',
      'cs',
      'da',
      'de',
      'el',
      'es',
      'et',
      'fa',
      'fi',
      'fr',
      'gb',
      'gu',
      'he',
      'hi',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'kn',
      'ko',
      'lt',
      'lv',
      'ml',
      'nl',
      'no',
      'pl',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sr',
      'sv',
      'ta',
      'te',
      'th',
      'tr',
      'uk',
      'ur',
      'vi',
      'zh',
      'zhtw',
    ]; // test
  }

  async suggestKeyAndNamespace(defaultText, fileName) {
    if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'chat'
    ) {
      const MASTER_PROMPT = `As ATi18n, the translation integrator AI, you need to wait for the user to provide a default text and a file name. Once provided, you will suggest a KEY and NAMESPACE based on the given text.\n\nYou should respond only with a JSON-parseable object with the following syntax:\n\n{key: "THE_SUGGESTED_KEY", namespace: "the_suggested_namespace", default_text: "the_given_default_text"}`;
      const USER_PROMPT = `The default text is: "${defaultText}"\nThe filename is: "${fileName}"`;
      const result = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [
          { role: 'system', content: MASTER_PROMPT },
          { role: 'user', content: USER_PROMPT },
        ],
      });

      const suggestion = result.data.choices[0].message.content.trim();
      const [key, namespace] = suggestion.split('|').map((part) => part.trim());

      return { key, namespace };
    } else if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'text'
    ) {
      const MASTER_PROMPT = `Suggest key and namespace for the following default text: "${defaultText}"\nFor the namespace suggestion analyze the following filename: "${fileName}"\nRespond only with a JSON-parseable object by the following syntax: {key: "capitalized_sneak_case_capitalized_suggestion_key", namespace: "suggested_namespace"`;
      const result = await this.openai.createCompletion({
        model: 'text-davinci-003',
        MASTER_PROMPT,
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const suggestion = result.data.choices[0].text.trim();
      const [key, namespace] = suggestion.split('|').map((part) => part.trim());

      return { key, namespace };
    } else {
      throw new Error('Invalid translation service or translation method');
    }
  }

  async generateLanguageSyntaxes(languages) {
    if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'chat'
    ) {
      const MASTER_PROMPT = `As ATi18n, the translation integrator AI, you are tasked with generating the language syntax for a given set of languages. The languages array contains the language codes. You need to return the syntax for each language in the following format:\n\n{ code: '{languageCode}', name: '{languageName}', flag: '{languageFlag}' }\n\nPlease respond with a JSON-parseable array of language syntaxes based on the input languages.`;

      console.log(languages);
      const USER_PROMPT = JSON.stringify(languages);
      console.log(USER_PROMPT);

      const result = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [
          { role: 'system', content: MASTER_PROMPT },
          { role: 'user', content: USER_PROMPT },
        ],
      });

      const response = result.data.choices[0].message.content.trim();
      const syntaxes = JSON.parse(response);

      console.log(syntaxes);

      return syntaxes;
    } else if (
      this.translatorService === 'openai' &&
      this.openaiTranslationMethod === 'text'
    ) {
      const MASTER_PROMPT = `As ATi18n, the translation integrator AI, you are tasked with generating the language syntax for a given set of languages. The languages array contains the language codes. You need to return the syntax for each language in the following format:\n\n{ code: '{languageCode}', name: '{languageName}', flag: '{languageFlag}' }\n\nPlease respond with a JSON-parseable array of language syntaxes based on the input languages. The languages:  ${languages}`;

      const prompt = MASTER_PROMPT;
      const result = await this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const suggestion = result.data.choices[0].text.trim();
      const syntaxes = JSON.parse(suggestion);

      console.log(syntaxes);

      return syntaxes;
    }
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
    const MASTER_PROMPT =
      "You are a professional translator named AT-i18n. You have to wait for the user to provide the translatable text and the target language's code. You have to respond ONLY with the translated text.";
    const translationResult = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 1,
      messages: [
        { role: 'system', content: MASTER_PROMPT },
        { role: 'user', content: USER_PROMPT },
      ],
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

  async synchronizeTranslations() {
    const sourceTranslationsDir = path.join(
      __dirname,
      'public',
      'locales',
      this.srcLang,
    );
    const sourceTranslations = this.getTranslationsFromDir(
      sourceTranslationsDir,
    );

    const targetTranslationsDir = path.join(__dirname, 'public', 'locales');
    const targetLocales = await this.detectAllowedLocales();

    for (const targetLocale of targetLocales) {
      const targetTranslationsDirForLocale = path.join(
        targetTranslationsDir,
        targetLocale,
      );
      const targetTranslations = this.getTranslationsFromDir(
        targetTranslationsDirForLocale,
      );

      for (const namespace in sourceTranslations) {
        const sourceKeys = Object.keys(sourceTranslations[namespace]);
        const targetKeys = targetTranslations.hasOwnProperty(namespace)
          ? Object.keys(targetTranslations[namespace])
          : [];

        const missingKeys = sourceKeys.filter(
          (key) => !targetKeys.includes(key),
        );

        if (missingKeys.length > 0) {
          const sourceNamespaceTranslations = sourceTranslations[namespace];
          const targetNamespaceTranslations =
            targetTranslations[namespace] || {};

          for (const missingKey of missingKeys) {
            const sourceValue = sourceNamespaceTranslations[missingKey];
            this.targetLang = targetLocale;
            const translatedValue = await this.translateText(sourceValue);

            targetNamespaceTranslations[missingKey] = translatedValue;
          }

          targetTranslations[namespace] = targetNamespaceTranslations;

          const targetTranslationsFile = path.join(
            targetTranslationsDirForLocale,
            `${namespace}.json`,
          );
          fs.writeFileSync(
            targetTranslationsFile,
            JSON.stringify(targetTranslations[namespace], null, 2),
            'utf8',
          );
        }
      }
    }
  }

  getTranslationsFromDir(translationsDir) {
    const translations = {};

    const files = fs.readdirSync(translationsDir);
    for (const file of files) {
      const filePath = path.join(translationsDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && file.endsWith('.json')) {
        const namespace = file.slice(0, -5);
        const content = fs.readFileSync(filePath, 'utf8');
        translations[namespace] = JSON.parse(content);
      }
    }

    return translations;
  }

  // main run
  async run(srcDirectory) {
    console.log(
      `[ATi18n]:> Starting translation process for ${this.srcDirectory} directory`,
    );
    this.collectKeyNamespacePairs(srcDirectory);
    await this.translateAndWriteFiles();
    console.log('[ATi18n]:> Translation files generated successfully.');
  }
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  '[ATi18n]:> Would you like me to translate the entire project automatically to all the locales you have enabled? (y/n) ',
  (translate_entire_project) => {
    if (
      translate_entire_project === 'y' ||
      translate_entire_project === 'yes'
    ) {
      rl.question(
        '[ATi18n]:> Which kind of translation process would you like me to run?\n1. I have the translatable parts WITHOUT {key} and {namespace} declaration\n2. I have the translatable parts WITHOUT {default text} but the {key} and {namespace} are declared\n3. I have only the {default text} and the {namespace} declarations, but some parts contain only the {default text}\nChoose a number!\n',
        async (translation_mode) => {
          if (translation_mode === '1') {
            console.log(
              '[ATi18n]:> Translation mode 1 selected. I will create the keys and namespaces for you.',
            );
            if (
              translate_entire_project === 'y' ||
              translate_entire_project === 'yes'
            ) {
              const translator = new Translator({
                translateToAllAllowed: true,
                srcLang: 'en',
              });
              await translator.run('src');
              rl.question(
                '[ATi18n]:> Translation process completed successfully. Would you like me to create the flags for the created translation(s) and overwrite the corresponding file? (y/n)',
                async (answer) => {
                  if (answer === 'y' || answer === 'yes') {
                    await translator.generateLanguageSyntaxes(
                      translator.detectAllowedLocales(),
                    );
                    console.log(
                      '[ATi18n]:> Translation flags created successfully.',
                    );
                  } else {
                    console.log('[ATi18n]:> Translation flags NOT created.');
                  }
                  rl.close();
                },
              );
            } else if (translation_mode === '2') {
              console.log('[ATi18n]:> Translation mode 2 selected.');
              // TODO:
              rl.close();
            } else if (translation_mode === '3') {
              console.log('[ATi18n]:> Translation mode 3 selected.');
              // TODO:
              rl.close();
            } else {
              console.log('[ATi18n]:> Invalid translation mode selected.');
              rl.close();
            }
          } else {
            rl.question(
              '[ATi18n]:> Which kind of translation process would you like me to run?\n1. I have the translatable parts WITHOUT {key} and {namespace} declaration\n2. I have the translatable parts WITHOUT {default text} but the {key} and {namespace} are declared\n3. I have only the {default text} and the {namespace} declarations, but some parts contain only the {default text}\nChoose a number!\n',
              (translation_mode) => {
                if (translation_mode === '1') {
                  console.log(
                    '[ATi18n]:> Translation mode 1 selected. I will create the keys and namespaces for you.',
                  );
                  rl.question(
                    '[ATi18n]:> Enter source language code (Default: EN): ',
                    (srcLang) => {
                      srcLang === '' ? (srcLang = 'en') : null;
                      rl.question(
                        '[ATi18n]:> Enter target language code (Default: HU): ',
                        (targetLang) => {
                          targetLang === '' ? (targetLang = 'hu') : null;
                          const translator = new Translator({
                            srcLang,
                            targetLang,
                          });
                          translator.run('src');
                          rl.close();
                        },
                      );
                    },
                  );
                } else if (translation_mode === '2') {
                  console.log('[ATi18n]:> Translation mode 2 selected.');
                  // TODO:
                  rl.close();
                } else if (translation_mode === '3') {
                  console.log('[ATi18n]:> Translation mode 3 selected.');
                  // TODO:
                  rl.close();
                } else {
                  console.log('[ATi18n]:> Invalid translation mode selected.');
                  rl.close();
                }
              },
            );
          }
        },
      );
    } else if (
      translate_entire_project === 'n' ||
      translate_entire_project === 'no'
    ) {
      rl.question(
        '[ATi18n]:> Would you like to synchronize translations? (y/n) ',
        async (synchronize) => {
          if (synchronize === 'y' || synchronize === 'yes') {
            rl.question(
              '[ATi18n]:> Enter the source language code: ',
              async (srcLang) => {
                const translator = new Translator({
                  srcLang: srcLang,
                });
                await translator.synchronizeTranslations();
                console.log(
                  '[ATi18n]:> Synchronization completed successfully.',
                );
                rl.close();
              },
            );
          } else {
            rl.close();
          }
        },
      );
    }
  },
);
