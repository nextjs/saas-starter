import { Page, expect } from '@playwright/test';
import { getTestUser, TestUser } from './test-data';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(user: TestUser = getTestUser()) {
    await this.page.goto('/sign-in');
    
    // Wait for the login form to be visible
    await this.page.waitForSelector('form', { timeout: 10000 });
    
    // Fill in credentials
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    
    // Submit the form
    await this.page.click('button[type="submit"]');
    
    // Wait for any navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check what URL we ended up on
    const currentUrl = this.page.url();
    
    // If we're still on sign-in page, there might be an error
    if (currentUrl.includes('/sign-in')) {
      const errorElement = this.page.locator('.text-red-500').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        throw new Error(`Login failed: ${errorText}`);
      }
      
      throw new Error('Login failed: Still on sign-in page after login attempt');
    }
    
    // Verify we're logged in by checking for dashboard elements
    const h1Element = this.page.locator('h1');
    await expect(h1Element).toContainText(/OTA Image Management|Dashboard/);
  }

  async logout() {
    // Look for logout button/link (adjust selector based on your UI)
    const logoutButton = this.page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for redirect to login page
      await this.page.waitForURL('/sign-in');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on the dashboard or if user menu is visible
      const currentUrl = this.page.url();
      return currentUrl.includes('/dashboard') || currentUrl.includes('/spaces') || currentUrl.includes('/upload') || currentUrl.includes('/files');
    } catch {
      return false;
    }
  }

  async ensureLoggedIn(user: TestUser = getTestUser()) {
    if (!(await this.isLoggedIn())) {
      await this.login(user);
    }
  }
}

// Standalone function for easy use in tests
export async function loginUser(page: Page, user: TestUser = getTestUser()) {
  const authHelper = new AuthHelper(page);
  await authHelper.login(user);
}
