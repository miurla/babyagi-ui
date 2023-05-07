import axios from 'axios';

export const webSearch = async (query: string) => {
  console.log('query: ', query);

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: process.env.SEARP_API_KEY,
        engine: 'google',
        q: query,
        Number: 3,
      },
    });

    return response.data.organic_results;
  } catch (error) {
    console.log('error: ', error);
    return error;
  }
};
