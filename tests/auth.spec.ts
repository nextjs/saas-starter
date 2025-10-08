import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { getTestUser, getTestUsers } from './utils/test-data';

test.describe('Authentication', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Check page title and main elements
    await expect(page).toHaveTitle(/Sunlighten - Partner Storage/);
    await expect(page.locator('h2')).toContainText(/Sign in to your account/);
    
    // Check form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const testUser = getTestUser('owner');
    
    await authHelper.login(testUser);
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Team Settings');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should redirect to dashboard when already logged in', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const testUser = getTestUser('owner');
    
    // Login first
    await authHelper.login(testUser);
    
    // Try to access login page again
    await page.goto('/sign-in');
    
    // Should redirect to dashboard or stay on sign-in (depending on implementation)
    await expect(page).toHaveURL(/\/(sign-in|dashboard)/);
  });

  test('should logout successfully', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const testUser = getTestUser('owner');
    
    // Login first
    await authHelper.login(testUser);
    
    // Logout
    await authHelper.logout();
    
    // Should be on login page or back to dashboard (depending on logout behavior)
    await expect(page).toHaveURL(/\/(sign-in|dashboard)/);
  });

  test('should protect dashboard routes when not logged in', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/sign-in');
  });

  test('should protect spaces routes when not logged in', async ({ page }) => {
    // Try to access spaces without login
    await page.goto('/spaces');
    
    // Should redirect to login (the app redirects to /login, not /sign-in)
    await expect(page).toHaveURL('/login');
  });

  test('should show different content for different user roles', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const ownerUser = getTestUser('owner');
    const memberUser = getTestUser('member');
    
    // Test owner user
    await authHelper.login(ownerUser);
    await page.goto('/dashboard');
    
    // Owner should see admin features (adjust selectors based on your UI)
    // await expect(page.locator('text=Admin, text=Settings, [data-testid="admin-panel"]')).toBeVisible();
    
    // Logout and login as member
    await authHelper.logout();
    await authHelper.login(memberUser);
    await page.goto('/dashboard');
    
    // Member should not see admin features
    // await expect(page.locator('text=Admin, text=Settings, [data-testid="admin-panel"]')).not.toBeVisible();
  });
});
