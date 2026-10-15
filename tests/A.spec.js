import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('tests/fixtures/A.html')).href;
const settle = (page) => page.waitForTimeout(450); // fixture has infinite animations, so no getAnimations().finished
const box = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
const open = async (page, id) => { await page.evaluate((i) => MS.open('#' + i), id); await settle(page); };

test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1280, height: 800 }); await page.goto(URL); await page.waitForFunction(() => window.MS); });

test('tonal differs from filled', async ({ page }) => {
  const bg = (s) => page.$eval(s, (e) => getComputedStyle(e).backgroundColor);
  expect(await bg('#tonal')).not.toBe(await bg('#filled'));
});

test('modal sizes', async ({ page }) => {
  const w = {};
  for (const s of ['sm', 'md', 'lg', 'full']) { await open(page, 'd-' + s); w[s] = (await box(page, '#d-' + s)).w; await page.evaluate((i) => MS.close('#' + i), 'd-' + s); }
  expect(w.sm).toBeLessThan(w.md); expect(w.md).toBeLessThan(w.lg); expect(w.full).toBe(1280);
});

test('drawer top/bottom', async ({ page }) => {
  await open(page, 'd-top'); const t = await box(page, '#d-top');
  expect(t.t).toBe(0); expect(t.w).toBe(1280);
  await open(page, 'd-bottom'); const b = await box(page, '#d-bottom');
  expect(Math.round(b.b)).toBe(800); expect(b.w).toBe(1280);
});

test('toast positions + title + icon', async ({ page }) => {
  await page.evaluate(() => { MS.toast('a', { timeout: 0, position: 'top-left', title: 'Hi', type: 'success' }); MS.toast('b', { timeout: 0, position: 'bottom-center', icon: 'check' }); MS.toast('c', { timeout: 0 }); });
  const tl = await box(page, '.ms-toasts[data-position=top-left]');
  expect(tl.l).toBe(16); expect(tl.t).toBe(16);
  const bc = await box(page, '.ms-toasts[data-position=bottom-center]');
  expect(Math.abs(bc.l + bc.w / 2 - 640)).toBeLessThan(2);
  expect((await box(page, '.ms-toasts[data-position=bottom-right]')).r).toBe(1264);
  await expect(page.locator('.ms-toast strong')).toHaveText('Hi');
  await expect(page.locator('.ms-toast .ms-icon')).toHaveText('check');
});

test('icons link injected when .ms-icon present', async ({ page }) => {
  await page.route('**/fonts.googleapis.com/**', (r) => r.abort());
  await page.goto(pathToFileURL(resolve('tests/fixtures/A-icons.html')).href);
  await expect(page.locator('link[href*="Material+Symbols+Outlined"]')).toHaveCount(1);
});

test('data-ms-icons=off injects nothing', async ({ page }) => {
  await expect(page.locator('link[href*="Material+Symbols"]')).toHaveCount(0);
});

test('alert icon + dismiss styled, none opt-out', async ({ page }) => {
  const c = (s) => page.$eval(s, (e) => getComputedStyle(e, '::before').content);
  expect(await c('#al')).not.toMatch(/^(none|normal)$/);
  expect(await c('#al-none')).toMatch(/^(none|normal)$/);
  expect((await box(page, '#al .close')).w).toBeGreaterThan(20);
});

test('grid --cols', async ({ page }) => {
  const n = await page.$eval('#g3', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  expect(n).toBe(3);
});

test('divider, table sticky, avatar status', async ({ page }) => {
  expect(await page.$eval('.divider', (e) => getComputedStyle(e, '::before').content)).toBe('""');
  expect(await page.$eval('thead th', (e) => getComputedStyle(e).position)).toBe('sticky');
  expect(await page.$eval('.avatar[data-status]', (e) => getComputedStyle(e, '::after').content)).toBe('""');
});
