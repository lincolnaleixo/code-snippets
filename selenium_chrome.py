#!/usr/bin/python
import os
import sys
from selenium import webdriver

window_size = "1920x1080"
user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36"
headless = True
enable_images = False

# Defining some options
options = webdriver.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('headless' if headless == True else '')
options.add_argument('disable-infobars')
options.add_argument('window-size='+window_size)
options.add_argument('--disable-logging')
options.add_argument('--lang=en-US')
options.add_argument('--blink-settings=imagesEnabled=false' if enable_images == True else '')
options.add_argument('--user-agent='+user_agent)

# Verifying the SO and choosing the correctly bin
platform = sys.platform
if platform == 'linux' or platform == 'linux2':
	chrome = webdriver.Chrome(chrome_options=options,
							  executable_path='bin/chromedriver_linux')
else:
	chrome = webdriver.Chrome(chrome_options=options,
							  executable_path='bin/chromedriver_mac')

# navigating to the url and printing the results
url = 'https://duckduckgo.com/?q=houses&ia=web'
chrome.get(url)
result = chrome.execute_script("return Array.from(document.querySelectorAll('.result__a')).map(item=>item.innerText)")

print(result)

# you can also get the elements using beautifulSoup
# page_source = chrome.page_source
# soup = BeautifulSoup(page_source, "html.parser")
# element = soup.select('.selector or #id or tag')