const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Capturing Homepage...');
  await page.goto('http://localhost:4200/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/1-homepage.png' });

  console.log('Capturing News & Events Page...');
  await page.goto('http://localhost:4200/news-events');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/3-news-events.png' });

  console.log('Registering a test user...');
  await page.goto('http://localhost:4200/register');
  await page.waitForLoadState('networkidle');
  
  try {
      await page.fill('input[type="email"], input[id="email"]', 'test.alumni@example.com');
      await page.fill('input[type="password"], input[id="password"]', 'Password@123');
      
      const firstNameInputs = await page.$$('input[id*="first"], input[name*="first"]');
      if(firstNameInputs.length) await firstNameInputs[0].fill('John');
      
      const lastNameInputs = await page.$$('input[id*="last"], input[name*="last"]');
      if(lastNameInputs.length) await lastNameInputs[0].fill('Doe');

      await page.screenshot({ path: 'screenshots/2-registration-filled.png' });
  } catch (e) {
      console.log('Selectors failed, taking normal screenshot.', e.message);
      await page.screenshot({ path: 'screenshots/2-registration-filled.png' });
  }

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:4200/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', 'admin@ihcae.edu');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000); 
  
  console.log('Capturing Admin Dashboard...');
  await page.goto('http://localhost:4200/admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/5-admin-dashboard.png' });

  console.log('Capturing Admin Directory/Hub...');
  await page.goto('http://localhost:4200/admin/alumni-hub');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/4-admin-directory.png' });
  
  console.log('Capturing Admin Content Management...');
  await page.goto('http://localhost:4200/admin/content');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/6-admin-content.png' });

  await browser.close();
  console.log('Playwright screenshots captured successfully.');
})();
