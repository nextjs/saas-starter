import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { getTestUser, getTestTeams } from './utils/test-data';

test.describe('Dashboard', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test('should display dashboard correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main dashboard elements
    await expect(page.locator('h1')).toContainText('Team Settings');
    
    // Check for navigation elements
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    
    // Check for spaces/teams list
    const spacesSection = page.locator('text=Spaces, text=Teams, [data-testid="spaces-list"]');
    await expect(spacesSection).toBeVisible();
  });

  test('should display available spaces', async ({ page }) => {
    await page.goto('/dashboard');
    
    const testTeams = getTestTeams();
    
    // Check that test teams are displayed
    for (const team of testTeams) {
      await expect(page.locator(`text=${team.name}`)).toBeVisible();
    }
  });

  test('should navigate to space details', async ({ page }) => {
    await page.goto('/dashboard');
    
    const testTeam = getTestTeams()[0];
    
    // Click on a space/team
    const spaceLink = page.locator(`a:has-text("${testTeam.name}"), [href*="/spaces/${testTeam.slug}"]`);
    await spaceLink.click();
    
    // Should navigate to space page
    await expect(page).toHaveURL(`/spaces/${testTeam.slug}`);
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/dashboard');
    
    const testUser = getTestUser();
    
    // Check for user email or name in the UI
    const userInfo = page.locator(`text=${testUser.email}, text=${testUser.name}`);
    await expect(userInfo).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test navigation to different sections
    const navItems = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Spaces', url: '/spaces' },
      { text: 'Activity', url: '/dashboard/activity' },
      { text: 'General', url: '/dashboard/general' },
      { text: 'Security', url: '/dashboard/security' }
    ];
    
    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item.text}"), [href="${item.url}"]`);
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(item.url);
        
        // Go back to dashboard for next test
        if (item.url !== '/dashboard') {
          await page.goto('/dashboard');
        }
      }
    }
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for activity section
    const activitySection = page.locator('text=Recent Activity, text=Activity, [data-testid="activity-list"]');
    await expect(activitySection).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Check that mobile navigation works
    const mobileMenuButton = page.locator('button[aria-label="Menu"], .mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Check that menu is open
      const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }
  });
});
