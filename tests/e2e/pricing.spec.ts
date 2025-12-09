import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('E2E Pricing Tests', () => {
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

  describe('Pricing Page', () => {
    it('should load the pricing page', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      const title = await page.title();
      expect(title).toBeTruthy();

      const url = page.url();
      expect(url).toContain('/pricing');
    }, 30000);

    it('should display pricing plans', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      // Look for pricing plan names
      const content = await page.content();

      // Should contain plan names
      expect(content.toLowerCase()).toMatch(/base|plus|pro|premium/);

      // Should contain pricing information
      expect(content).toMatch(/\$/);
    }, 30000);

    it('should have subscribe buttons for each plan', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      // Look for submit buttons (one for each pricing plan)
      const buttons = await page.$$('button[type="submit"]');
      expect(buttons.length).toBeGreaterThan(0);
    }, 30000);

    it('should display trial period information', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      const content = await page.content();

      // Should mention free trial
      expect(content.toLowerCase()).toMatch(/trial|free/);
    }, 30000);

    it('should display features for each plan', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      const content = await page.content();

      // Should contain feature descriptions
      expect(content).toMatch(/support|feature|access|unlimited/i);
    }, 30000);
  });

  describe('Pricing Page - Authenticated User', () => {
    beforeEach(async () => {
      // Sign in
      await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });
      await page.type('input[type="email"]', 'test@test.com');
      await page.type('input[type="password"]', 'admin123');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);
    });

    it('should show pricing page to authenticated users', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      const url = page.url();
      expect(url).toContain('/pricing');
    }, 30000);

    it('should have clickable subscribe buttons', async () => {
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });

      const buttons = await page.$$('button[type="submit"]');
      expect(buttons.length).toBeGreaterThan(0);

      // Verify buttons are enabled
      const isEnabled = await buttons[0]?.evaluate(
        (btn) => !(btn as HTMLButtonElement).disabled
      );
      expect(isEnabled).toBeTruthy();
    }, 30000);
  });
});
