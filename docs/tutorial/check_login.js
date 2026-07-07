const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle2' });
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button')).map(el => ({
      tag: el.tagName,
      type: el.type,
      id: el.id,
      name: el.name,
      text: el.innerText
    }));
  });
  console.log(inputs);
  await browser.close();
})();
