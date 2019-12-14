/* eslint-disable no-param-reassign */
const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const pluginUA = require('puppeteer-extra-plugin-anonymize-ua');
const jsonfile = require('jsonfile');
const fs = require('fs');
const util = require('util');
const path = require('path');
const download = require('download');

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

class Spider {

	constructor(processEnv, pageType) {

		puppeteer.use(pluginStealth());
		puppeteer.use(pluginUA());

		this.isDevelopmentEnv = processEnv === 'DEVELOPMENT';
		this.dir = '.';
		this.downloadPath = `${this.dir}/downloads`;
		this.typeOptions = ['full', 'clean', 'veryClean'];
		this.type = pageType;
		this.cookiesPath = `${this.dir}/cookies/browserCookies`;
		this.browser = '';
		this.page = '';

	}

	saveCookies = async () => {

		const cookiesObject = await this.page.cookies();
		await jsonfile.writeFileSync(this.cookiesPath, cookiesObject, { spaces: 2 });
		// console.log('Cookies saved');

	}

	setCookies = async () => {

		const previousSession = fs.existsSync(this.cookiesPath);

		if (previousSession) {

			const content = fs.readFileSync(this.cookiesPath);
			const cookiesArr = JSON.parse(content);

			if (cookiesArr.length !== 0) {

				for (const cookie of cookiesArr) {

					await this.page.setCookie(cookie);

				}

				console.log('Session has been loaded in the browser');

			}

		}

	}

	createBrowser = async () => {

		this.browser = await puppeteer.launch({
			headless: !this.isDevelopmentEnv,
			devtools: this.isDevelopmentEnv,
			dumpio: this.isDevelopmentEnv,
			ignoreHTTPSErrors: !this.isDevelopmentEnv,
			slowMo: 250,
			timeout: this.isDevelopmentEnv ? 10000 : 60000,
			defaultViewport: {
				width: 1920,
				height: 1080,
			},
			args,
		});

	}

	createPage = async () => {

		this.page = await this.browser.newPage();
		await this.setPageParameters();

	}

	setPageParameters = async () => {

		this.page.on('dialog', async (dialog) => {

			await dialog.accept();

		});
		if (this.type === 'clean') {

			await this.page.setRequestInterception(true);

			this.page.on('request', (request) => {

				if (
					request.resourceType() === 'image'
					|| request.resourceType() === 'font'
				) {

					request.abort();

				} else {

					request.continue();

				}

			});

		} else if (this.type === 'veryClean') {

			await this.page.setRequestInterception(true);

			this.page.on('request', (request) => {

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

		await this.page._client.send('Page.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath: this.downloadPath,
		});

		const min = 0;
		const max = userAgents.length;
		const random = parseInt(Math.random() * (+max - +min) + +min, 10);
		await this.page.setUserAgent(userAgents[random]);

	}

	navigateTo = async (url) => {

		const response = await this.page.goto(url, {
			waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
		});

		const headers = response.headers();

		if (headers.status === '200') {

			return true;

		}

		console.log(`Error on getting the page contents. Response status: ${headers.status}`);

		return false;

	}

	evaluate = async (elementToEvaluate) => {

		// async use inside strings is necessary to fix errors if app is packaged with pkg.
		// if pkg not necessary, just use normal evaluate
		const evaluateResult = await this.page.evaluate(`(async() => {
			return ${elementToEvaluate}
  	})()`);

		// normal evaluate
		// const evaluateResult = await page
		// 	.evaluate(() => Array
		// 		.from(document.querySelectorAll('.result__a')).map((item) => item.innerText));

		return evaluateResult;

	}

	downloadFile = async (url) => {

		download(url, this.downloadPath).then(() => {

			console.log('done downloading!');

		});

	}

	closeBrowser = async () => {

		await this.saveCookies();
		await this.page.close();
		await this.browser.close();

	}

}

(async () => {

	const spider = new Spider('PRODUCTION', 'full');

	await spider.createBrowser();
	await spider.createPage();
	await spider.setCookies();

	const url = 'https://duckduckgo.com/?q=houses&ia=web';

	if (await spider.navigateTo(url)) {

		const elementToEvaluate = "Array.from(document.querySelectorAll('.result__a')).map(item=>item.innerText)";
		const response = await spider.evaluate(elementToEvaluate);
		console.log(response);

	}

	const urlToDownload = 'https://cdn.spacetelescope.org/archives/images/large/heic1509a.jpg';
	await spider.downloadFile(urlToDownload, 'image.jpg');

	await spider.closeBrowser();

})();
