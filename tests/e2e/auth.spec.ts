import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

describe('E2E Authentication Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Sign Up Flow', () => {
    it('should load the sign-up page', async () => {
      await page.goto(`${BASE_URL}/sign-up`, { waitUntil: 'networkidle2' });

      const title = await page.title();
      expect(title).toBeTruthy();

      // Check for form elements
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    }, 30000);

    it('should successfully sign up a new user', async () => {
      await page.goto(`${BASE_URL}/sign-up`, { waitUntil: 'networkidle2' });

      // Fill in the form
      await page.type('input[type="email"]', TEST_EMAIL);
      await page.type('input[type="password"]', TEST_PASSWORD);

      // Submit the form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);

      // Check if redirected to dashboard or home
      const url = page.url();
      expect(url).not.toContain('/sign-up');
    }, 30000);

    it('should show validation errors for invalid email', async () => {
      await page.goto(`${BASE_URL}/sign-up`, { waitUntil: 'networkidle2' });

      await page.type('input[type="email"]', 'invalid-email');
      await page.type('input[type="password"]', TEST_PASSWORD);

      await page.click('button[type="submit"]');

      // Wait a bit for validation to appear
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if still on sign-up page (validation failed)
      const url = page.url();
      expect(url).toContain('/sign-up');
    }, 30000);
  });

  describe('Sign In Flow', () => {
    it('should load the sign-in page', async () => {
      await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });

      const title = await page.title();
      expect(title).toBeTruthy();

      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    }, 30000);

    it('should successfully sign in with valid credentials', async () => {
      await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });

      // Use the default test user from seed
      await page.type('input[type="email"]', 'test@test.com');
      await page.type('input[type="password"]', 'admin123');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);

      // Check if redirected away from sign-in
      const url = page.url();
      expect(url).not.toContain('/sign-in');
    }, 30000);

    it('should show error for invalid credentials', async () => {
      await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });

      await page.type('input[type="email"]', 'wrong@example.com');
      await page.type('input[type="password"]', 'wrongpassword');

      await page.click('button[type="submit"]');

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should still be on sign-in page
      const url = page.url();
      expect(url).toContain('/sign-in');
    }, 30000);
  });

  describe('Protected Routes', () => {
    it('should redirect to sign-in when accessing dashboard without auth', async () => {
      // Create a completely new browser context with no session
      const context = await browser.createBrowserContext();
      const newPage = await context.newPage();
      await newPage.setViewport({ width: 1280, height: 800 });

      // Try to access dashboard
      await newPage.goto(`${BASE_URL}/dashboard`, {
        waitUntil: 'domcontentloaded',
      });

      // Wait for redirects
      await new Promise(resolve => setTimeout(resolve, 1000));

      const url = newPage.url();
      await newPage.close();
      await context.close();

      // Should be redirected to sign-in or not allowed to access dashboard
      const isDashboard = url.includes('/dashboard') && !url.includes('/sign-in');
      expect(isDashboard).toBe(false);
    }, 30000);

    it('should access dashboard after successful login', async () => {
      // First, sign in
      await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });
      await page.type('input[type="email"]', 'test@test.com');
      await page.type('input[type="password"]', 'admin123');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);

      // Now try to access dashboard
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      const url = page.url();
      expect(url).toContain('/dashboard');
    }, 30000);
  });
});
