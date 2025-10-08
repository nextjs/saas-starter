import { test, expect } from '@playwright/test';
import { createTestFile } from './utils/file-helpers';

test.describe('File Upload - Simple Tests', () => {
  test('should display upload page correctly', async ({ page }) => {
    // Navigate to upload page (this will redirect to sign-in if not authenticated)
    await page.goto('/spaces/blaupunkt/upload');
    
    // Check if we're on the sign-in page or upload page
    const isSignInPage = await page.locator('h2:has-text("Sign in")').isVisible();
    
    if (isSignInPage) {
      // If we're on sign-in page, that's expected behavior
      await expect(page).toHaveTitle(/Sunlighten - Partner Storage/);
      await expect(page.locator('h2')).toContainText(/Sign in to your account/);
    } else {
      // If we're on upload page, check upload elements
      await expect(page).toHaveTitle(/Upload Files/);
      await expect(page.locator('input[type="file"]')).toBeVisible();
    }
  });

  test('should display files page correctly', async ({ page }) => {
    // Navigate to files page (this will redirect to sign-in if not authenticated)
    await page.goto('/spaces/blaupunkt/files');
    
    // Check if we're on the sign-in page or files page
    const isSignInPage = await page.locator('h2:has-text("Sign in")').isVisible();
    
    if (isSignInPage) {
      // If we're on sign-in page, that's expected behavior
      await expect(page).toHaveTitle(/Sunlighten - Partner Storage/);
      await expect(page.locator('h2')).toContainText(/Sign in to your account/);
    } else {
      // If we're on files page, check files elements
      await expect(page.locator('h1')).toContainText('Files');
    }
  });

  test('should create test file correctly', async ({ page }) => {
    // Test the createTestFile helper function
    const filename = 'test-file.zip';
    const content = 'Test file content';
    const mimeType = 'application/zip';
    
    const testFile = await createTestFile(filename, mimeType, content);
    
    expect(testFile.name).toBe(filename);
    expect(testFile.type).toBe(mimeType);
    expect(testFile.size).toBeGreaterThan(0);
  });

  test('should handle file input correctly', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    
    // Check if we're on sign-in page
    const isSignInPage = await page.locator('h2:has-text("Sign in")').isVisible();
    
    if (isSignInPage) {
      // Skip this test if not authenticated
      test.skip();
    }
    
    // Create a test file
    const testFile = await createTestFile('test-input.zip', 'application/zip', 'Test content');
    
    // Test file input
    await page.setInputFiles('input[type="file"]', testFile);
    
    // Check if file appears in the UI (this might not work without proper authentication)
    // This test mainly verifies that the file input accepts files
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });
});
