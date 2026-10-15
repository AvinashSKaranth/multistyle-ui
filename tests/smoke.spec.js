import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('docs/index.html')).href;
const STYLES = ['material', 'material3', 'fluent', 'brutalist', 'pixel', 'neon', 'metro', 'bootstrap', 'cartoon', 'illustration', 'carbon', 'liquid-glass'];

let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // offline fonts / network failures are expected; only real console errors count
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text()) && errors.push(m.text()));
  await page.goto(URL);
  await page.waitForFunction(() => window.MS && window.Alpine && window.Chart);
});

const bg = (page, sel) => page.$eval(sel, (e) => getComputedStyle(e).backgroundColor);
const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);

test('loads without console errors', async ({ page }) => {
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test('defaults are material + blue + system (button is blue)', async ({ page }) => {
  expect(await page.evaluate(() => MS.get().style + MS.get().theme + MS.get().mode)).toBe('materialbluesystem');
  const [r, g, b] = rgb(await bg(page, '.ex-preview button:not([disabled])'));
  expect(b).toBeGreaterThan(r + 60);
  expect(b).toBeGreaterThan(150);
});

test('mode-dark changes body background', async ({ page }) => {
  await page.evaluate(() => MS.set({ mode: 'light' }));
  const light = await bg(page, 'body');
  await page.evaluate(() => MS.set({ mode: 'dark' }));
  const dark = await bg(page, 'body');
  expect(dark).not.toBe(light);
  expect(rgb(dark)[0]).toBeLessThan(80);
});

test('every style applies without errors', async ({ page }) => {
  for (const s of STYLES) {
    await page.selectOption('select[data-ms=style]', s);
    await expect(page.locator('body')).toHaveClass(new RegExp(`style-${s}(\s|$)`));
  }
  expect(errors).toEqual([]);
});

test('custom theme applies primary', async ({ page }) => {
  await page.selectOption('select[data-ms=theme]', 'custom');
  await page.evaluate(() => MS.set({ primary: '#ff0000' }));
  await expect(page.locator('body')).toHaveClass(/theme-custom/);
  const [r, g, b] = rgb(await bg(page, '.ex-preview button:not([disabled])'));
  expect(r).toBeGreaterThan(g + 80);
  expect(r).toBeGreaterThan(b + 80);
  await expect(page.locator('#bodystr')).toContainText('--ms-primary');
});

test('toast appears', async ({ page }) => {
  await page.click('[data-ms-toast]');
  await expect(page.locator('.ms-toast')).toContainText('Hello from a toast');
});

test('tabs switch', async ({ page }) => {
  await expect(page.locator('#tp1')).toBeVisible();
  await page.click('[aria-controls=tp2]');
  await expect(page.locator('#tp2')).toBeVisible();
  await expect(page.locator('#tp1')).toBeHidden();
});

test('a chart canvas has a Chart instance', async ({ page }) => {
  await page.waitForFunction(() => [...document.querySelectorAll('canvas[data-ms-chart]')].some((c) => Chart.getChart(c)));
});

test('no horizontal scroll at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
