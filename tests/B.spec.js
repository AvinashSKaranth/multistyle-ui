import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('tests/fixtures/B.html')).href;
test.beforeEach(async ({ page }) => { await page.goto(URL); await page.waitForFunction(() => window.MS?.multiselect); });
const vals = (page) => page.$eval('#ms', (s) => [...s.selectedOptions].map((o) => o.value));
const top = (page, sel) => page.$eval(sel, (e) => e.getBoundingClientRect().top);

test('floating label moves on focus and when filled', async ({ page }) => {
  const sp = '#fl + span';
  const y0 = await top(page, sp);
  await page.focus('#fl');
  // label animates via CSS transition: poll instead of fixed sleeps
  await expect.poll(() => top(page, sp)).toBeLessThan(y0 - 4);
  await page.waitForTimeout(400); // let transition settle before sampling the "up" position
  const y1 = await top(page, sp);
  await page.fill('#fl', 'a@b.c');
  await page.locator('#ta').focus(); // blur
  await expect.poll(() => top(page, sp)).toBeCloseTo(y1, 0);
  await page.fill('#fl', '');
  await page.locator('#ta').focus();
  await expect.poll(() => top(page, sp)).toBeCloseTo(y0, 0);
});

test('counter updates, no duplicates on re-init', async ({ page }) => {
  await expect(page.locator('#ta + small.counter')).toHaveText('0/20');
  await page.fill('#ta', 'hello');
  await expect(page.locator('#ta + small.counter')).toHaveText('5/20');
  await page.evaluate(() => { const t = document.getElementById('ta'); const p = t.parentNode; const n = t.nextSibling; p.removeChild(t); p.insertBefore(t, n); });
  await page.waitForTimeout(100);
  expect(await page.locator('small.counter').count()).toBe(1);
});

test('multiselect mouse select / remove and change event', async ({ page }) => {
  await page.evaluate(() => { window.n = 0; document.getElementById('ms').addEventListener('change', () => n++); });
  expect(await vals(page)).toEqual(['css']);
  await expect(page.locator('.ms-multi .chip')).toHaveCount(1);
  await page.locator('.ms-multi-control').click();
  await expect(page.locator('.ms-multi-list')).toBeVisible();
  await page.locator('.ms-multi-list li', { hasText: 'Python' }).click();
  expect(await vals(page)).toEqual(['css', 'py']);
  await page.locator('.ms-multi .chip button[aria-label="Remove CSS"]').click();
  expect(await vals(page)).toEqual(['py']);
  expect(await page.evaluate(() => n)).toBe(2);
  await page.mouse.click(600, 700);
  await expect(page.locator('.ms-multi-list')).toBeHidden();
});

test('multiselect keyboard', async ({ page }) => {
  const input = page.locator('.ms-multi-control input');
  await input.focus();
  await input.press('ArrowDown'); // opens, active = 0
  await expect(page.locator('.ms-multi-list')).toBeVisible();
  await input.press('Enter'); // toggles JavaScript
  expect(await vals(page)).toEqual(['js', 'css']);
  await input.pressSequentially('pyth');
  await expect(page.locator('.ms-multi-list li')).toHaveCount(1);
  await input.press('Enter');
  expect(await vals(page)).toEqual(['js', 'css', 'py']);
  await input.press('Escape');
  await expect(page.locator('.ms-multi-list')).toBeHidden();
  await input.fill('');
  await input.press('Backspace');
  expect(await vals(page)).toEqual(['js', 'css']);
  await expect(page.locator('#ms')).toBeHidden();
});

test('dropzone file names and dragover', async ({ page }) => {
  await page.setInputFiles('#file', [{ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a') }, { name: 'b.txt', mimeType: 'text/plain', buffer: Buffer.from('b') }]);
  await expect(page.locator('#dz small.files span')).toHaveText(['a.txt', 'b.txt']);
  await page.dispatchEvent('#file', 'dragenter');
  await expect(page.locator('#dz')).toHaveClass(/dragover/);
  await page.dispatchEvent('#file', 'drop');
  await expect(page.locator('#dz')).not.toHaveClass(/dragover/);
});

test('rating-display fractional width and range fill', async ({ page }) => {
  const w = await page.$eval('#rd', (e) => parseFloat(getComputedStyle(e, '::before').width));
  const full = await page.$eval('#rd', (e) => e.getBoundingClientRect().width);
  expect(w / full).toBeCloseTo(0.7, 2);
  expect(await page.$eval('#rg', (e) => e.style.getPropertyValue('--_pct'))).toBe('25%');
  await page.$eval('#rg', (e) => { e.value = 80; e.dispatchEvent(new Event('input', { bubbles: true })); });
  expect(await page.$eval('#rg', (e) => e.style.getPropertyValue('--_pct'))).toBe('80%');
});
