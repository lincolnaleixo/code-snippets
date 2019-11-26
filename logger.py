from loguru import logger
import sys
import os

logger.remove()
module = os.path.basename(__file__)
logger.add("logs/logs.log", format="{time} {level} {module} {message}")
logger = logger.bind(module=module)
logger.add(sys.stdout, format="{time} <level>{level} | {module} | {message}</level>",  colorize=True)
logger = logger.bind(module=module)

logger.trace('Trace')
logger.debug('Debug')
logger.info('Info')
logger.success('Success')
logger.warning('Warning')
logger.error('Error')
logger.critical('Critical')
