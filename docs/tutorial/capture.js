const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('--- STARTING GUEST FLOW ---');
  await page.goto('http://localhost:4200/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/1-homepage.png' });

  await page.goto('http://localhost:4200/news-events');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/2-news-events.png' });

  await page.goto('http://localhost:4200/contact');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/3-contact.png' });

  await page.goto('http://localhost:4200/register');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/4-registration.png' });


  console.log('--- STARTING NORMAL ALUMNI FLOW ---');
  await page.goto('http://localhost:4200/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/5-login.png' });
  
  // Log in as normal user
  await page.fill('input[type="email"]', 'mrnorbu@gmail.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); 

  await page.goto('http://localhost:4200/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/6-alumni-dashboard.png' });

  await page.goto('http://localhost:4200/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/7-profile.png' });

  await page.goto('http://localhost:4200/directory');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/8-directory.png' });

  await page.goto('http://localhost:4200/forums');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/9-forums.png' });

  await page.goto('http://localhost:4200/success-stories');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/10-success-stories.png' });

  await page.goto('http://localhost:4200/submit-content');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/11-submit-content.png' });
  
  // Logout normal user
  await context.clearCookies();


  console.log('--- STARTING ADMIN FLOW ---');
  await page.goto('http://localhost:4200/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@ihcae.edu');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); 

  await page.goto('http://localhost:4200/admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/12-admin-dashboard.png' });

  await page.goto('http://localhost:4200/admin/alumni-hub');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/13-admin-alumni-hub.png' });
  
  // Try to open CSV import modal if possible (it's in the alumni-hub component)
  try {
      const importBtn = await page.$('button:has-text("Import CSV")');
      if (importBtn) {
          await importBtn.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'screenshots/14-admin-csv-import.png' });
          // Close modal by clicking outside or close button (if we want)
          const closeBtn = await page.$('button:has-text("Cancel")');
          if (closeBtn) await closeBtn.click();
          await page.waitForTimeout(500);
      }
  } catch(e) {
      console.log('Could not open CSV modal');
  }

  await page.goto('http://localhost:4200/admin/content');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/15-admin-content-management.png' });

  await page.goto('http://localhost:4200/admin/content-review');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/16-admin-content-review.png' });

  await page.goto('http://localhost:4200/admin/forums');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/17-admin-forums.png' });

  await browser.close();
  console.log('Playwright successfully captured all screens!');
})();
