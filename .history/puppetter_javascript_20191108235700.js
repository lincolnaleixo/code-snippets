const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const pluginUA = require('puppeteer-extra-plugin-anonymize-ua');
const jsonfile = require('jsonfile');
const fs = require('fs');

puppeteer.use(pluginStealth());
puppeteer.use(pluginUA());

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
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
  '--disable-features=site-per-process',
];

const isDevelopmentEnv = process.env.NODE_ENV === 'DEVELOPMENT';
const dir = 'path/to/directory';
const downloadPath = `${dir}/downloads`;
const typeOptions = ['full', 'clean', 'veryClean'];
const type = typeOptions.clean;

async function setCookies(page, cookiesPath) {

  const previousSession = fs.existsSync(cookiesPath);

  if (previousSession) {

    const content = fs.readFileSync(cookiesPath);
    const cookiesArr = JSON.parse(content);

    if (cookiesArr.length !== 0) {

      for (const cookie of cookiesArr) {

        await page.setCookie(cookie);

      }

      console.log('Session has been loaded in the browser');

      return page;

    }

  }

  return false;

}

async function saveCookies(page, cookiesPath) {

  try {

    const cookiesObject = await page.cookies();

    await jsonfile.writeFileSync(cookiesPath, cookiesObject, { spaces: 2 });

    console.log('Cookies saved');

  } catch (error) {

    console.log(error);

  }

}

(async () => {

  const browser = await puppeteer.launch({
    headless: !isDevelopmentEnv,
    devtools: isDevelopmentEnv,
    dumpio: isDevelopmentEnv,
    ignoreHTTPSErrors: !isDevelopmentEnv,
    slowMo: 250,
    timeout: isDevelopmentEnv ? 10000 : 60000,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args,
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {

    await dialog.accept();

  });
  if (type === 'clean') {

    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if (request.resourceType() === 'image' || request.resourceType() === 'font') {

        request.abort();

      } else {

        request.continue();

      }

    });

  } else if (type === 'veryClean') {

    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if (
        request.resourceType() === 'image'
        || request.resourceType() === 'script'
        || request.resourceType() === 'stylesheet'
        || request.resourceType() === 'font'
      ) {

        request.abort();

      } else {

        request.continue();

      }

    });

  }

  await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath });

  const min = 0;
  const max = userAgents.length;
  const random = parseInt(Math.random() * (+max - +min) + +min, 10);
  await page.setUserAgent(userAgents[random]);

})();
