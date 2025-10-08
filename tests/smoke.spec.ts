import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Should show the landing page
    await expect(page).toHaveURL('/');
    
    // Check for landing page elements
    await expect(page.locator('h1')).toContainText('OTA Image Management');
    await expect(page.locator('text=Portal')).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');
    
    // Try to navigate to different pages
    const pages = ['/sign-in', '/sign-up', '/dashboard', '/spaces'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Should not crash or show error page
      const bodyText = await page.locator('body').textContent();
      // Check for actual error indicators, not just "500" which appears in timestamps
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('500 Internal Server Error');
      expect(bodyText).not.toContain('Error 500');
    }
  });

  test('should have working API endpoints', async ({ page }) => {
    // Test public API endpoints
    const response = await page.request.get('/api/user');
    
    // Should return 401 (unauthorized) or 200 (if logged in)
    expect([200, 401]).toContain(response.status());
  });
});
