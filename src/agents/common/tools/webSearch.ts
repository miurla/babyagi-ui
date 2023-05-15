import axios from 'axios';

export const webSearch = async (query: string) => {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: process.env.SEARP_API_KEY,
        engine: 'google',
        q: query,
        num: 5,
      },
    });

    return response.data.organic_results;
  } catch (error) {
    console.log('error: ', error);
    return error;
  }
};

type SearchResult = {
  position: number;
  title: string;
  link: string;
  snippet: string;
};

export const simplifySearchResults = (searchResults: SearchResult[]) => {
  const simplifiedResults = [];
  for (const result of searchResults) {
    simplifiedResults.push({
      position: result.position,
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    });
  }
  return simplifiedResults;
};
