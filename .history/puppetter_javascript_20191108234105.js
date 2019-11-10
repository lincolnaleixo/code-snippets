const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const pluginUA = require('puppeteer-extra-plugin-anonymize-ua');

puppeteer.use(pluginStealth());
puppeteer.use(pluginUA());

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0'
];

const args = [
  '--disable-gpu',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--force-device-scale-factor',
  '--ignore-certificate-errors',
  '--no-sandbox',
  '--mute-audio',
  '--disable-translate',
  '--disable-features=site-per-process'
];

const isDevelopmentEnv = process.env.NODE_ENV === 'DEVELOPMENT';

const browser = await puppeteer.launch({
  headless: !isDevelopmentEnv,
  devtools: isDevelopmentEnv,
  dumpio: isDevelopmentEnv,
  ignoreHTTPSErrors: !isDevelopmentEnv,
  slowMo: 250,
  timeout: isDevelopmentEnv ? 10000 : 60000,
  defaultViewport: {
    width: 1920,
    height: 1080
  },
  args
});

const downloadPath = `${dir}/downloads`;
const typeOptions = ['full', 'clean', 'veryClean'];
const type = 'clean';

const page = await browser.newPage();
if (type === 'clean') {
  await page.setRequestInterception(true);

  page.on('request', request => {
    if (request.resourceType() === 'image' || request.resourceType() === 'font') {
      request.abort();
    } else {
      request.continue();
    }
  });
} else if (type === 'veryClean') {
  await page.setRequestInterception(true);

  page.on('request', request => {
    if (
      request.resourceType() === 'image' ||
      request.resourceType() === 'script' ||
      request.resourceType() === 'stylesheet' ||
      request.resourceType() === 'font'
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });
}
