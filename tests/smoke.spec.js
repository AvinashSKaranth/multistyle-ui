import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const INDEX = pathToFileURL(resolve('docs/index.html')).href;
const URL = pathToFileURL(resolve('docs/components.html')).href;
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

const openTab = (page, id) => page.click(`#explorer > [role=tablist] [aria-controls=${id}]`);

test('toast appears', async ({ page }) => {
  await openTab(page, 'c-toast');
  await page.click('#c-toast [data-ms-toast]');
  await expect(page.locator('.ms-toast')).toContainText('Hello from a toast');
});

test('tabs switch', async ({ page }) => {
  await openTab(page, 'c-tabs');
  await page.click('#c-tabs [role=tab][aria-controls=tp1]'); // preview tab is a nested tablist; explicit
  await expect(page.locator('#tp1')).toBeVisible();
  await page.click('[aria-controls=tp2]');
  await expect(page.locator('#tp2')).toBeVisible();
  await expect(page.locator('#tp1')).toBeHidden();
});

test('explorer tab switch shows the right panel', async ({ page }) => {
  await expect(page.locator('#c-typography')).toBeVisible();
  await expect(page.locator('#c-buttons')).toBeHidden();
  await openTab(page, 'c-buttons');
  await expect(page.locator('#c-buttons')).toBeVisible();
  await expect(page.locator('#c-typography')).toBeHidden();
  expect(await page.evaluate(() => location.hash)).toBe('#c-buttons');
});

test('hash #c-modal opens the Modal tab', async ({ page }) => {
  await page.goto(URL + '#c-modal');
  await page.waitForFunction(() => window.MS);
  await expect(page.locator('#c-modal')).toBeVisible();
  await expect(page.locator('#c-typography')).toBeHidden();
});

test('modal opens and the x button closes it', async ({ page }) => {
  await openTab(page, 'c-modal');
  await page.click('#c-modal [data-ms-open="#dlg1"]');
  await expect(page.locator('#dlg1')).toBeVisible();
  await page.click('#dlg1 button[rel=prev]');
  await expect(page.locator('#dlg1')).toBeHidden();
});

test('Preview/Code toggle shows code', async ({ page }) => {
  await openTab(page, 'c-buttons');
  const ex = page.locator('#c-buttons .ex').first();
  await expect(ex.locator('.ex-preview')).toBeVisible();
  await expect(ex.locator('.ex-code')).toBeHidden();
  await ex.getByRole('tab', { name: 'Code' }).click();
  await expect(ex.locator('.ex-code')).toBeVisible();
  await expect(ex.locator('.ex-preview')).toBeHidden();
  await expect(ex.locator('.ex-code code')).toContainText('<button>Button</button>');
  await expect(page.locator('#c-buttons')).toBeVisible(); // outer explorer unaffected
});

test('chart in Charts tab has width after switching to it', async ({ page }) => {
  await openTab(page, 'c-charts');
  await expect(page.locator('#c-charts canvas').first()).toBeVisible();
  await page.waitForFunction(() => Chart.getChart(document.querySelector('#c-charts canvas')).width > 50);
});

test('mermaid renders (skips offline)', async ({ page }) => {
  await page.waitForFunction(() => window.mermaid, null, { timeout: 8000 }).catch(() => {});
  test.skip(!(await page.evaluate(() => !!window.mermaid)), 'mermaid CDN not loaded');
  await openTab(page, 'c-mermaid');
  await expect(page.locator('#c-mermaid .ex-preview svg').first()).toBeVisible({ timeout: 10000 });
});

test('quill editor inits and syncs hidden input (skips offline)', async ({ page }) => {
  await page.waitForFunction(() => window.Quill, null, { timeout: 8000 }).catch(() => {});
  test.skip(!(await page.evaluate(() => !!window.Quill)), 'Quill CDN not loaded');
  await openTab(page, 'c-editor');
  await expect(page.locator('#c-editor .ql-editor').first()).toBeVisible({ timeout: 10000 });
  await page.locator('#c-editor form .ql-editor').fill('hello');
  await page.click('#c-editor form button[type=submit]');
  await expect(page.locator('.ms-toast')).toContainText('hello');
});

test('a chart canvas has a Chart instance', async ({ page }) => {
  await page.waitForFunction(() => [...document.querySelectorAll('canvas[data-ms-chart]')].some((c) => Chart.getChart(c)));
});

test('no horizontal scroll at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openTab(page, 'c-charts');
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('index links to components.html and has no explorer', async ({ page }) => {
  await page.goto(INDEX);
  await expect(page.locator('#explorer')).toHaveCount(0);
  await expect(page.locator('.topbar nav.pages a[aria-current=page]')).toHaveText('Guide');
  await page.click('#components a[role=button]');
  await expect(page).toHaveURL(/components\.html$/);
  await expect(page.locator('.topbar nav.pages a[aria-current=page]')).toHaveText('Components');
});

test('components.html#c-charts shows a chart with width', async ({ page }) => {
  await page.goto(URL + '#c-charts');
  await page.reload();
  await page.waitForFunction(() => window.Chart && window.MS);
  await expect(page.locator('#c-charts')).toBeVisible();
  await page.waitForFunction(() => Chart.getChart(document.querySelector('#c-charts canvas')).width > 50);
});

test('hashchange selects tab', async ({ page }) => {
  await page.evaluate(() => (location.hash = '#c-switch'));
  await expect(page.locator('#c-switch')).toBeVisible();
});

test('style choice persists across pages', async ({ page }) => {
  await page.selectOption('select[data-ms=style]', 'neon');
  await page.goto(INDEX);
  await page.waitForFunction(() => window.MS);
  await expect(page.locator('body')).toHaveClass(/style-neon/);
});
