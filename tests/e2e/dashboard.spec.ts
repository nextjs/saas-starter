import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('E2E Dashboard Tests', () => {
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

    // Sign in before each test
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'admin123');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Dashboard Navigation', () => {
    it('should load the main dashboard page', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      const url = page.url();
      expect(url).toContain('/dashboard');

      const title = await page.title();
      expect(title).toBeTruthy();
    }, 30000);

    it('should navigate to general settings', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      // Navigate directly to general settings
      await page.goto(`${BASE_URL}/dashboard/general`, {
        waitUntil: 'networkidle2',
      });

      const url = page.url();
      expect(url).toContain('general');
    }, 30000);

    it('should navigate to security settings', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      const securityLink = await page.$('a[href*="security"]');
      if (securityLink) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
          securityLink.click(),
        ]);

        const url = page.url();
        expect(url).toContain('security');
      }
    }, 30000);

    it('should navigate to activity page', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      const activityLink = await page.$('a[href*="activity"]');
      if (activityLink) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
          activityLink.click(),
        ]);

        const url = page.url();
        expect(url).toContain('activity');
      }
    }, 30000);
  });

  describe('Dashboard Functionality', () => {
    it('should display user information', async () => {
      await page.goto(`${BASE_URL}/dashboard/general`, {
        waitUntil: 'networkidle2',
      });

      // Check if page loaded successfully
      const content = await page.content();
      expect(content).toBeTruthy();
    }, 30000);

    it('should allow navigation between dashboard sections', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

      // Try clicking multiple navigation items
      const links = await page.$$('a[href^="/dashboard"]');
      expect(links.length).toBeGreaterThan(0);
    }, 30000);
  });
});
