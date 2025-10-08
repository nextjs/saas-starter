import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { getTestUser, getTestTeams, TEST_FILE_DATA } from './utils/test-data';

test.describe('API Integration', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test('should fetch user data correctly', async ({ page }) => {
    // Test API endpoint for user data
    const response = await page.request.get('/api/user');
    expect(response.status()).toBe(200);
    
    const userData = await response.json();
    expect(userData).toHaveProperty('email');
    expect(userData).toHaveProperty('role');
  });

  test('should fetch team data correctly', async ({ page }) => {
    // Test API endpoint for team data
    const response = await page.request.get('/api/team');
    expect(response.status()).toBe(200);
    
    const teamData = await response.json();
    expect(Array.isArray(teamData)).toBe(true);
  });

  test('should fetch spaces list', async ({ page }) => {
    // Test API endpoint for spaces
    const response = await page.request.get('/api/spaces');
    expect(response.status()).toBe(200);
    
    const spacesData = await response.json();
    expect(Array.isArray(spacesData)).toBe(true);
  });

  test('should fetch files for a space', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Test API endpoint for space files
    const response = await page.request.get(`/api/spaces/${testTeam.slug}/files`);
    expect(response.status()).toBe(200);
    
    const filesData = await response.json();
    expect(Array.isArray(filesData)).toBe(true);
  });

  test('should handle file download API', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // First upload a file
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    const testFile = {
      name: TEST_FILE_DATA.smallFile.name,
      mimeType: TEST_FILE_DATA.smallFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.smallFile.content)
    };
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);
    
    const uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    await uploadButton.click();
    
    await page.waitForLoadState('networkidle');
    
    // Test download API
    const filesResponse = await page.request.get(`/api/spaces/${testTeam.slug}/files`);
    const files = await filesResponse.json();
    
    if (files.length > 0) {
      const fileId = files[0].id;
      const downloadResponse = await page.request.get(`/api/spaces/${testTeam.slug}/files/${fileId}/download`);
      
      // Should return a redirect or file data
      expect([200, 302, 307]).toContain(downloadResponse.status());
    }
  });

  test('should handle presigned upload URLs', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Test presigned URL generation
    const response = await page.request.post(`/api/spaces/${testTeam.slug}/upload/presign`, {
      data: {
        filename: TEST_FILE_DATA.smallFile.name,
        contentType: TEST_FILE_DATA.smallFile.type,
        fileSize: TEST_FILE_DATA.smallFile.size
      }
    });
    
    expect(response.status()).toBe(200);
    
    const presignData = await response.json();
    expect(presignData).toHaveProperty('uploadUrl');
    expect(presignData).toHaveProperty('fileId');
  });

  test('should handle upload completion', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // First get a presigned URL
    const presignResponse = await page.request.post(`/api/spaces/${testTeam.slug}/upload/presign`, {
      data: {
        filename: TEST_FILE_DATA.smallFile.name,
        contentType: TEST_FILE_DATA.smallFile.type,
        fileSize: TEST_FILE_DATA.smallFile.size
      }
    });
    
    const presignData = await presignResponse.json();
    
    // Test upload completion
    const completeResponse = await page.request.post(`/api/spaces/${testTeam.slug}/upload/complete`, {
      data: {
        fileId: presignData.fileId,
        description: 'Test upload via API',
        version: '1.0.0',
        changelog: 'Test changelog'
      }
    });
    
    expect(completeResponse.status()).toBe(200);
  });

  test('should handle authentication errors', async ({ page }) => {
    // Logout first
    await authHelper.logout();
    
    // Try to access protected API endpoints
    const userResponse = await page.request.get('/api/user');
    expect(userResponse.status()).toBe(401);
    
    const teamResponse = await page.request.get('/api/team');
    expect(teamResponse.status()).toBe(401);
  });

  test('should handle invalid space access', async ({ page }) => {
    // Try to access non-existent space
    const response = await page.request.get('/api/spaces/non-existent-space/files');
    expect(response.status()).toBe(404);
  });

  test('should validate file upload parameters', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Test with invalid parameters
    const response = await page.request.post(`/api/spaces/${testTeam.slug}/upload/presign`, {
      data: {
        filename: '', // Invalid empty filename
        contentType: 'invalid/type',
        fileSize: -1 // Invalid file size
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('should handle rate limiting', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    // Make multiple rapid requests
    const requests = Array(10).fill(null).map(() => 
      page.request.get(`/api/spaces/${testTeam.slug}/files`)
    );
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed or be rate limited appropriately
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
  });

  test('should return proper CORS headers', async ({ page }) => {
    // Test CORS headers for API endpoints
    const response = await page.request.get('/api/user');
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();
  });

  test('should handle database connection errors gracefully', async ({ page }) => {
    // This test would require mocking database connection
    // For now, just test that API returns proper error format
    const response = await page.request.get('/api/user');
    
    if (response.status() !== 200) {
      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
    }
  });
});
