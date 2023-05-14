import axios from 'axios';
import { load } from 'cheerio';

export const webScrape = async (url: string) => {
  const content = await fetchUrlContent(url);

  if (!content) {
    return null;
  }

  const text = extractText(content);

  return text;
};

const fetchUrlContent = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error while fetching the URL: ${error}`);
    return '';
  }
};

const extractText = (content: string): string => {
  const $ = load(content);
  const body = $('body');
  const text = getTextFromNode(body, $);
  return text.trim();
};

const getTextFromNode = (node: any, $: any): string => {
  let text = '';
  node.contents().each((index: number, element: any) => {
    if (
      element.type === 'text' &&
      !['img', 'script', 'style'].includes(element.name)
    ) {
      text += $(element).text().trim().replace(/\s\s+/g, ' ');
    } else if (element.type === 'tag') {
      text += getTextFromNode($(element), $);
    }
  });
  return text;
};
