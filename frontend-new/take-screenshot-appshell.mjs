import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Prime localStorage with the same keys used in `src/hooks/useAuth.ts`.
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('ram_token', 'dev_token');
    localStorage.setItem('ram_username', 'admin');
    localStorage.setItem('ram_role', 'ADMIN');
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('img[alt="RAM"]', { timeout: 5000 });

  await page.screenshot({ path: 'screenshot-appshell.png', fullPage: true });
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

