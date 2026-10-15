import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('tests/fixtures/components.html')).href;
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
const open = async (page, id) => { await page.evaluate((i) => MS.open('#' + i), id); await settle(page); };
const isOpen = (page, id) => page.$eval('#' + id, (d) => d.open);
const box = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });

test.beforeEach(async ({ page }) => { await page.goto(URL); await page.waitForFunction(() => window.MS); });

for (const w of [1280, 375]) {
  test(`modal centered at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await open(page, 'm');
    const b = await box(page, '#m');
    expect(Math.abs((b.l + b.r) / 2 - w / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs((b.t + b.b) / 2 - 400)).toBeLessThanOrEqual(2);
  });
}

test('drawers pinned to their side, full height', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, 'dl'); await open(page, 'dr');
  const l = await box(page, '#dl'), r = await box(page, '#dr');
  expect(l.l).toBe(0); expect(l.h).toBe(800);
  expect(r.r).toBe(1280); expect(r.h).toBe(800);
});

const closers = {
  'rel=prev': (page, id) => page.click(`#${id} [rel=prev]`),
  'data-ms-close': (page, id) => page.click(`#${id} [data-ms-close]`),
  escape: (page) => page.keyboard.press('Escape'),
  backdrop: (page, id) => page.mouse.click(id === 'dl' ? 1270 : 2, 400),
};
const targets = { m: ['rel=prev', 'escape', 'backdrop'], m2: ['data-ms-close'], dl: ['rel=prev', 'escape', 'backdrop'], dr: ['data-ms-close', 'escape', 'backdrop'] };
for (const [id, ways] of Object.entries(targets)) for (const way of ways) {
  test(`${id} closes via ${way}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, id);
    expect(await isOpen(page, id)).toBe(true);
    await closers[way](page, id);
    expect(await isOpen(page, id)).toBe(false);
  });
}

test('form method=dialog and data-ms-close="#id" close', async ({ page }) => {
  await open(page, 'm'); await page.click('#form-close'); expect(await isOpen(page, 'm')).toBe(false);
  await open(page, 'm3'); await page.click('#by-id'); expect(await isOpen(page, 'm3')).toBe(false);
});

test('clicking inside modal content does not close it', async ({ page }) => {
  await open(page, 'm'); await page.click('#m p'); expect(await isOpen(page, 'm')).toBe(true);
});

test('toast: bottom-right, closable, above open modal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, 'm');
  await page.evaluate(() => MS.toast('Hello', { type: 'success', timeout: 0 }));
  await settle(page);
  const b = await box(page, '.ms-toasts');
  expect(1280 - b.r).toBeLessThanOrEqual(20); expect(800 - b.b).toBeLessThanOrEqual(20);
  const top = await page.evaluate(() => { const r = document.querySelector('.ms-toast').getBoundingClientRect(); return document.elementFromPoint(r.left + 10, r.top + 10).closest('.ms-toast') !== null; });
  expect(top).toBe(true);
  await page.click('.ms-toast-close');
  await expect(page.locator('.ms-toast')).toHaveCount(0);
});

test('toast centered bottom on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.evaluate(() => MS.toast('Hi', { timeout: 0 }));
  const b = await box(page, '.ms-toasts');
  expect(Math.abs((b.l + b.r) / 2 - 187.5)).toBeLessThanOrEqual(2);
});
