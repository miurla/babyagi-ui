import Multion from './main.mjs';

async function run() {
  const multion = new Multion(
    process.env.MULTION_CLIENT_ID,
    process.env.MULTION_CLIENT_SECRET,
  );
  const h = await multion.login(); // Wait for login to complete
  console.log('j', h, 'j');
  const res = await multion.newSession({
    input: 'What is the weather today',
    url: 'https://google.com/',
  });
  const { tabId, message, status } = res;

  console.log(tabId, message, status);
}

run();
