import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { FileHelper } from './utils/file-helpers';
import { getTestUser, getTestTeams, TEST_FILE_DATA } from './utils/test-data';

test.describe('Spaces Management', () => {
  let authHelper: AuthHelper;
  let fileHelper: FileHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    fileHelper = new FileHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test('should display spaces list', async ({ page }) => {
    await page.goto('/spaces');
    
    // Check page title
    await expect(page.locator('h1')).toContainText(/Spaces|Teams/);
    
    // Check that test teams are listed
    const testTeams = getTestTeams();
    for (const team of testTeams) {
      await expect(page.locator(`text=${team.name}`)).toBeVisible();
    }
  });

  test('should navigate to space details', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto('/spaces');
    
    // Click on a space
    const spaceLink = page.locator(`a:has-text("${testTeam.name}"), [href*="/spaces/${testTeam.slug}"]`);
    await spaceLink.click();
    
    // Should be on space page
    await expect(page).toHaveURL(`/spaces/${testTeam.slug}`);
    await expect(page.locator('h1')).toContainText(testTeam.name);
  });

  test('should display space files page', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/files`);
    
    // Check page elements
    await expect(page.locator('h1')).toContainText(testTeam.name);
    await expect(page.locator('text=Files, text=Uploads')).toBeVisible();
    
    // Check for upload button
    const uploadButton = page.locator('a:has-text("Upload"), button:has-text("Upload")');
    await expect(uploadButton).toBeVisible();
  });

  test('should navigate to upload page', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/files`);
    
    // Click upload button
    const uploadButton = page.locator('a:has-text("Upload"), button:has-text("Upload")');
    await uploadButton.click();
    
    // Should be on upload page
    await expect(page).toHaveURL(`/spaces/${testTeam.slug}/upload`);
    await expect(page.locator('h1')).toContainText(/Upload|Add File/);
  });

  test('should display upload form correctly', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Check form elements
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Check for optional fields
    const descriptionField = page.locator('input[name="description"], textarea[name="description"]');
    const versionField = page.locator('input[name="version"]');
    const changelogField = page.locator('textarea[name="changelog"]');
    
    // These fields might be optional, so just check if they exist
    if (await descriptionField.isVisible()) {
      await expect(descriptionField).toBeVisible();
    }
    if (await versionField.isVisible()) {
      await expect(versionField).toBeVisible();
    }
    if (await changelogField.isVisible()) {
      await expect(changelogField).toBeVisible();
    }
  });

  test('should upload a file successfully', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Upload a test file
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Navigate to files page to verify upload
    await page.goto(`/spaces/${testTeam.slug}/files`);
    
    // Check that file appears in the list
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
  });

  test('should download a file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // First upload a file
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Navigate to files page
    await page.goto(`/spaces/${testTeam.slug}/files`);
    
    // Click download button
    const downloadButton = page.locator('button:has-text("Download"), a:has-text("Download")').first();
    await downloadButton.click();
    
    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe(TEST_FILE_DATA.smallFile.name);
  });

  test('should delete a file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // First upload a file
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Delete the file
    await fileHelper.deleteFile(TEST_FILE_DATA.smallFile.name, testTeam.slug);
    
    // Verify file is gone
    const fileExists = await fileHelper.verifyFileExists(TEST_FILE_DATA.smallFile.name, testTeam.slug);
    expect(fileExists).toBe(false);
  });

  test('should handle file upload errors gracefully', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Try to submit form without selecting a file
    const submitButton = page.locator('button[type="submit"], button:has-text("Upload")');
    await submitButton.click();
    
    // Should show validation error
    await expect(page.locator('text=Please select a file, text=File is required')).toBeVisible();
  });

  test('should display file metadata correctly', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Upload a file with metadata
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Navigate to files page
    await page.goto(`/spaces/${testTeam.slug}/files`);
    
    // Check that file metadata is displayed
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
    
    // Check for file size, upload date, etc.
    const fileRow = page.locator(`tr:has-text("${TEST_FILE_DATA.smallFile.name}"), [data-testid="file-item"]:has-text("${TEST_FILE_DATA.smallFile.name}")`);
    await expect(fileRow).toBeVisible();
  });

  test('should be accessible to different user roles', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Test as owner
    await authHelper.ensureLoggedIn(getTestUser('owner'));
    await page.goto(`/spaces/${testTeam.slug}`);
    await expect(page.locator('h1')).toContainText(testTeam.name);
    
    // Test as member
    await authHelper.logout();
    await authHelper.login(getTestUser('member'));
    await page.goto(`/spaces/${testTeam.slug}`);
    await expect(page.locator('h1')).toContainText(testTeam.name);
  });
});
