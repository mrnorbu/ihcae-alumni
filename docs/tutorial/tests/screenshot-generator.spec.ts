import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('IHCAE Screenshot Generation', () => {
  
  test.use({ viewport: { width: 1536, height: 960 } });

  test('Phase 1: Guest Experience', async ({ page }) => {
    // Chapter 1: Homepage
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000); // Wait for Angular to initialize
    await page.screenshot({ path: './images/chapter-1-homepage.png' });

    // Chapter 2: Login Page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: './images/chapter-2-login-modal.png' });
    
    // Chapter 3: Registration Page
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: './images/chapter-3-registration-modal.png' });
  });

  test('Phase 2: Alumni Portal', async ({ page }) => {
    // Login as Alumni
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'mrnorbu@gmail.com');
    await page.fill('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');
    
    // Chapter 4: Dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './images/chapter-4-dashboard.png' });

    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './images/chapter-4-profile-edit.png' });

    // Chapter 5: Directory
    await page.goto(`${BASE_URL}/directory`);
    await page.waitForTimeout(2000);
    
    const filterBtn = await page.$('button:has-text("Filters")');
    if (filterBtn) await filterBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: './images/chapter-5-directory-filters.png' });

    // Chapter 6: Forum Participation
    await page.goto(`${BASE_URL}/forums`);
    await page.waitForTimeout(2000);
    
    const newThreadBtn = page.locator('button', { hasText: 'New Thread' }).first();
    if (await newThreadBtn.isVisible()) {
      await newThreadBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './images/chapter-6-create-topic.png' });
      await page.fill('#title', 'Upcoming Tourism Expo in Gangtok');
      await page.fill('#content', 'Is anyone else planning to attend the Tourism Expo next month? Would love to connect and share a booth!');
      await page.locator('button', { hasText: 'Create Topic' }).first().click();
      await page.waitForTimeout(2000);
    }

    // 1. Reply to our own newly created topic
    const firstTopic = page.locator('h3').first();
    await firstTopic.waitFor({ state: 'visible', timeout: 5000 });
    await firstTopic.click();
    await page.waitForTimeout(2000);
    
    const replyBtn = page.locator('button', { hasText: 'Reply' }).first();
    await replyBtn.click();
    await page.waitForTimeout(500);
    await page.fill('textarea[placeholder="Write your reply..."]', 'That sounds like a great initiative! I am fully on board.');
    await page.screenshot({ path: './images/chapter-6-comment.png' });
    await page.locator('button.bg-blue-600').filter({ hasText: /Reply|Post/ }).first().click();
    await page.waitForTimeout(1500);
    
    // 2. Go back to forums and flag an Admin topic
    await page.goto(`${BASE_URL}/forums`);
    await page.waitForTimeout(2000);
    
    // Find an existing admin topic from the seed data
    const adminTopic = page.locator('h3', { hasText: 'Publishing your Expeditions and Stories' }).first();
    await adminTopic.waitFor({ state: 'visible', timeout: 5000 });
    await adminTopic.click();
    await page.waitForTimeout(2000);
    
    const flagBtn = page.locator('button', { hasText: 'Flag' }).first();
    await flagBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: './images/chapter-6-forum-flag.png' });
    
    // Select a reason from custom dropdown
    await page.locator('app-custom-select button').first().click();
    await page.waitForTimeout(300);
    await page.locator('button', { hasText: 'Spam' }).first().click();
    
    await page.fill('textarea[placeholder="Provide context or specific details..."]', 'This looks like spam');
    await page.locator('button', { hasText: 'Flag Post' }).first().click();
    await page.waitForTimeout(1000);
  });

  test('Phase 3: Admin Console', async ({ page }) => {
    test.setTimeout(60000); // Admin phase takes many screenshots, needs more time
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'admin@ihcae.edu');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Chapter 8: Admin Dashboard Overview
    await page.waitForURL('**/admin');
    await page.waitForTimeout(2000);
    const sidebar = page.locator('aside').first();
    if (await sidebar.isVisible()) {
      await sidebar.screenshot({ path: './images/chapter-8-admin-sidebar.png' });
    }
    await page.screenshot({ path: './images/chapter-8-dashboard-overview.png' });

    // Chapter 9.1: All Users
    await page.goto(`${BASE_URL}/admin/users?tab=all`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './images/chapter-9-1-all-users.png' });

    // Chapter 9.1: Ban Modal
    const banBtn = await page.$('button[title="Block user"]');
    if (banBtn) {
      await banBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: './images/chapter-9-1-ban-modal.png' });
      await page.reload();
      await page.waitForTimeout(1000);
    }

    // Chapter 9.2: Edit Details Modal
    const editBtn = await page.$('button[title="Edit details"]');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './images/chapter-9-2-edit-details-modal.png' });

      // Click Security Tab
      const securityTab = await page.$('button:has-text("Security & Password")');
      if (securityTab) {
        await securityTab.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: './images/chapter-9-2-edit-security-tab.png' });
      }
      
      await page.reload();
      await page.waitForTimeout(1000);
    }

    // Chapter 9.4: Pending Approvals & Modals
    await page.goto(`${BASE_URL}/admin/users?tab=approvals`);
    await page.waitForTimeout(2000);
    const firstApprovalRow = page.locator('div.cursor-pointer').first();
    if (await firstApprovalRow.isVisible()) {
      await firstApprovalRow.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: './images/chapter-9-4-pending-details.png' });
      
      const rejectBtn = page.locator('button[title="Reject"]').first();
      if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: './images/chapter-8-approval-modal.png' });
        await page.reload();
      }
    } else {
      await page.screenshot({ path: './images/chapter-9-4-pending-approvals.png' });
    }

    // Chapter 9.5: IHCAE Records Import
    await page.goto(`${BASE_URL}/admin/users?tab=roster`);
    await page.waitForTimeout(2000);
    
    // Capture empty table before import
    await page.screenshot({ path: './images/chapter-9-5-ihcae-records-empty.png' });
    
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible() || await fileInput.count() > 0) {
      await fileInput.setInputFiles('../../alumni_import_test.csv');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './images/chapter-9-5-import-preview.png' });

      const importBtn = page.locator('button', { hasText: /Import \d+ Records/ }).first();
      if (await importBtn.isVisible()) {
          if (await importBtn.isEnabled()) {
              await importBtn.click();
              await page.waitForTimeout(2000);
          } else {
              await page.locator('button', { hasText: 'Cancel' }).first().click();
              await page.waitForTimeout(1000);
          }
          
          // Capture populated table
          await page.screenshot({ path: './images/chapter-9-5-ihcae-records.png' });
          
          // Select the first row to show Generate Accounts
          const firstCheckbox = page.locator('table tbody input[type="checkbox"]').first();
          if (await firstCheckbox.isVisible()) {
              await firstCheckbox.check();
              await page.waitForTimeout(500);
              const generateBtn = page.locator('button', { hasText: 'Generate' }).first();
              if (await generateBtn.isVisible()) {
                  await generateBtn.click();
                  await page.waitForTimeout(500);
                  await page.screenshot({ path: './images/chapter-9-5-generate-accounts.png' });
                  const cancelBtn = page.locator('button', { hasText: 'Cancel' }).first();
                  if (await cancelBtn.isVisible()) await cancelBtn.click();
              }
          }
      }
    } else {
      await page.screenshot({ path: './images/chapter-9-5-ihcae-records.png' });
    }

    // Chapter 10: Admin Content Management
    await page.goto(`${BASE_URL}/admin/content`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './images/chapter-10-admin-content-management.png' });

    // Chapter 10: Admin Content Review
    await page.goto(`${BASE_URL}/admin/content-review`);
    await page.waitForTimeout(2000);
    const reviewBtn = page.locator('button', { hasText: 'Review' }).first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: './images/chapter-10-admin-content-review-modal.png' });
      await page.reload();
    } else {
      await page.screenshot({ path: './images/chapter-10-admin-content-review.png' });
    }

    // Chapter 11: Forum Moderation
    await page.goto(`${BASE_URL}/admin/forums`);
    await page.waitForTimeout(2000);
    const flagsTab = page.locator('button', { hasText: 'Flagged Content' }).first();
    if (await flagsTab.isVisible()) {
      await flagsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './images/chapter-11-forum-moderation.png' });

      const takeActionBtn = page.locator('button[title="Take Action"]').first();
      await takeActionBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: './images/chapter-11-forum-moderation-modal.png' });
      await page.locator('button', { hasText: 'Cancel' }).first().click();
    } else {
      await page.screenshot({ path: './images/chapter-11-forum-moderation.png' });
    }

  });
});
