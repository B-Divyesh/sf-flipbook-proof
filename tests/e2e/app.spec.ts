import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads a clear, accessible proof room without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Flipbook Proof/);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Proof the motion/i })).toBeVisible();
  await expect(page.getByLabel('Flipbook Proof home')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('legal pages are readable and semantic', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('app shell and local studio remain available offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 }).catch(async () => {
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline · local tools ready')).toBeVisible();
  await expect(page.getByText('Choose video', { exact: true })).toBeVisible();
});

test('keyboard path reaches the video picker and paid pages are honestly labelled', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Skip to main content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('label[for="videoFile"]').focus();
  await expect(page.locator('label[for="videoFile"]')).toBeFocused();
  await expect(page.getByText('24 pages are free.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Plus once · $12' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/flipbook-proof/checkout');
});

test('a local video becomes a numbered, printable proof', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Core extraction runs once in Chromium; responsive behavior has separate coverage.');
  await page.goto('/');
  await page.locator('#videoFile').setInputFiles(new URL('../fixtures/motion.webm', import.meta.url).pathname);
  await expect(page.locator('#workspace')).toBeVisible();
  await page.locator('input[name="frameCount"][value="12"]').check();
  await page.getByRole('button', { name: 'Extract 12 frames' }).click();
  await expect(page.locator('#proofPanel')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await expect(page.locator('#frameCaption')).toHaveText('Frame 1 of 12');
  await page.locator('#filmstrip').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#frameCaption')).toHaveText('Frame 2 of 12');
  await page.evaluate(() => { window.print = () => document.body.setAttribute('data-print-invoked', 'yes'); });
  await page.getByRole('button', { name: 'Print proof / save PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'yes');
  await expect(page.locator('#printRoot .print-page')).toHaveCount(13);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export project' }).click();
  expect((await download).suggestedFilename()).toBe('motion.flipbook-proof.json');
});
