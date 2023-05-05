import puppeteer from 'puppeteer';

export const webScrape = async (url: string) => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the <body> element to be loaded
  await page.waitForSelector('body');

  // Get the text content of the <body> element
  const text = await page.evaluate(() => {
    function getTextNodes(node: Node): string[] {
      const textNodes: string[] = [];
      const childNodes = node.childNodes;

      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
        if (childNode.nodeType === Node.TEXT_NODE) {
          const textContent = childNode.textContent?.trim();
          if (textContent) {
            textNodes.push(textContent);
          }
        } else if (
          childNode.nodeType === Node.ELEMENT_NODE &&
          childNode.nodeName !== 'SCRIPT' &&
          childNode.nodeName !== 'STYLE'
        ) {
          textNodes.push(...getTextNodes(childNode));
        }
      }

      return textNodes;
    }

    return getTextNodes(document.body).join(' ');
  });

  const links = await page.$$eval(
    'a[href^="https://"]',
    (anchorElements: HTMLAnchorElement[]) => {
      return anchorElements.map((anchor) => anchor.href);
    },
  );

  let result = text?.replace(/\s+/g, ' ') + 'URLs: ';
  for (const link of links) {
    result += link + ', ';
  }

  await browser.close();
  return result;
};
