import { test, expect } from '@playwright/test';

test('verify modular quickstart components', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForSelector('h1:has-text("LyricFlow Studio")');

  // Take screenshot of the dashboard with the new QuickStart component
  await page.screenshot({ path: 'verification/modular_dashboard.png' });

  // Verify genre selection button exists
  const genreButton = page.locator('button:has-text("GENRE")');
  await expect(genreButton).toBeVisible();

  // Click genre selection
  await genreButton.click();
  await page.waitForSelector('h2:has-text("SELECT GENRE")');
  await page.screenshot({ path: 'verification/modular_genre_modal.png' });

  // Close modal
  await page.click('button:has-text("CONFIRM SELECTION")');

  // Verify action buttons
  await expect(page.locator('button:has-text("SPARK")')).toBeVisible();
  await expect(page.locator('button:has-text("ENHANCE")')).toBeVisible();
  await expect(page.locator('button:has-text("POLISH")')).toBeVisible();
});
