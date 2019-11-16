const path = require('path');
const moment = require('moment-timezone');

const {
	createLogger,
	format,
	transports,
} = require('winston');

const colorizer = format.colorize();
const consoleLevel = 'silly';
const fileLevel = 'error';
const moduleFileLevel = 'silly';
const timeZone = 'America/Los_Angeles';
const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';
const dir = '.';
const logPath = `${dir}/logs/`;
const moduleName = 'test';

async function prepareLogger(module) {

	const alignedWithTime = format.combine(
		format.align(),
		format.printf((info) => `${Date.now().toString()}\t${moment().tz(timeZone).format(dateFormat)}\t${module}\t${info.level}\t${info.message}`),
	);

	const logger = createLogger({
		level: consoleLevel,
		format: alignedWithTime,
		transports: [
			new transports.File({
				filename: path.join(logPath, 'error.log'),
				level: fileLevel,
				format: alignedWithTime,
			}),
			new transports.File({
				filename: path.join(logPath, 'combined.log'),
			}),
			new transports.File({
				level: moduleFileLevel,
				filename: path.join(logPath, `${module}.log`),
			}),
		],
	});

	logger.add(
		new transports.Console({
			level: consoleLevel,
			format: format.printf((msg) => colorizer.colorize(msg.level, `${Date.now().toString()}\t${moment().tz(timeZone).format(dateFormat)}\t${module}\t${msg.message}`)),
		}),
	);

	return logger;

}

(async () => {

	const logger = await prepareLogger(moduleName);
	logger.silly('silly test');
	logger.debug('debug test');
	logger.verbose('verbose test');
	logger.http('http test');
	logger.info('info test');
	logger.warn('critical test');
	logger.error('error test');

})();
