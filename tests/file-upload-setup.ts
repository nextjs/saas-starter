import { test as base, Page } from '@playwright/test';
import { loginUser } from './utils/auth-helpers';
import { cleanupTestFiles, getUploadedFiles } from './utils/file-helpers';

// Extend the base test with file upload specific setup
export const test = base.extend<{
  cleanPage: Page;
}>({
  cleanPage: async ({ browser }, use) => {
    // Create a new context and page for each test
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Login to the application
      await loginUser(page);
      
      // Clean up any existing test files before starting
      const existingFiles = await getUploadedFiles(page);
      const testFiles = existingFiles.filter(file => 
        file.includes('test-') || 
        file.includes('e2e-') || 
        file.includes('playwright-') ||
        file.includes('multi-upload-') ||
        file.includes('removable-file-') ||
        file.includes('progress-test-')
      );
      
      if (testFiles.length > 0) {
        console.log(`Cleaning up ${testFiles.length} existing test files before test`);
        await cleanupTestFiles(page, testFiles);
      }
      
      await use(page);
    } finally {
      // Clean up after test
      try {
        const remainingFiles = await getUploadedFiles(page);
        const testFiles = remainingFiles.filter(file => 
          file.includes('test-') || 
          file.includes('e2e-') || 
          file.includes('playwright-') ||
          file.includes('multi-upload-') ||
          file.includes('removable-file-') ||
          file.includes('progress-test-')
        );
        
        if (testFiles.length > 0) {
          console.log(`Cleaning up ${testFiles.length} test files after test`);
          await cleanupTestFiles(page, testFiles);
        }
      } catch (error) {
        console.warn('Failed to cleanup after test:', error);
      }
      
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
