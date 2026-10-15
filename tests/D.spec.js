import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('tests/fixtures/D.html')).href;
const errors = [];
test.beforeEach(({ page }) => { errors.length = 0; page.on('pageerror', (e) => errors.push(e.message)); });
test.afterEach(() => expect(errors).toEqual([]));

test('read-only pre gets Prism tokens', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#ro .token.keyword').first()).toBeVisible();
  await expect(page.locator('#ro .token.string')).toBeVisible();
});

test('editor: typing syncs pre + value, tab indents, form value', async ({ page }) => {
  await page.goto(URL);
  const ta = page.locator('#ed');
  await expect(page.locator('.ms-code .ms-code-pre .token.keyword').first()).toBeVisible();
  await ta.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('\nconst z = "q";');
  await expect(page.locator('.ms-code-pre .token.string')).toHaveText('"q"');
  expect(await ta.inputValue()).toContain('const z = "q";');
  await expect(page.locator('.ms-code-gutter')).toHaveText('1\n2\n3');
  await page.keyboard.press('Tab');
  expect(await ta.inputValue()).toMatch(/"q";  $/);
  await page.keyboard.press('Home');
  await page.keyboard.press('Tab');
  expect(await ta.inputValue()).toContain('\n  const z');
  await page.keyboard.press('Shift+Tab');
  expect(await ta.inputValue()).toContain('\nconst z');
  // Esc then Tab leaves the field (focus moves away)
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  expect(await ta.inputValue()).toMatch(/"q";  $/);
  expect(await page.evaluate(() => new FormData(document.getElementById('f')).get('src'))).toContain('let y = 2;');
});

test('editor works without Prism', async ({ page }) => {
  await page.goto(URL + '?noprism');
  expect(await page.evaluate(() => !!window.Prism)).toBe(false);
  await page.locator('#ed').click();
  await page.keyboard.type('x');
  await page.keyboard.press('Tab');
  expect(await page.locator('#ed').inputValue()).toMatch(/  $/);
  await expect(page.locator('.ms-code-pre')).toContainText('let x = 1;');
  expect(await page.locator('.ms-code-pre .token').count()).toBe(0);
});

test('MS.code destroy restores textarea', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => document.getElementById('ed').msCode.destroy());
  expect(await page.locator('.ms-code').count()).toBe(0);
  await expect(page.locator('#f > #ed')).toHaveCount(1);
});

test('MS.set font: --ms-font, link, get, event, select, persist, auto', async ({ page }) => {
  await page.goto(URL);
  expect(await page.locator('#fontsel option').count()).toBeGreaterThan(10);
  const r = await page.evaluate(() => {
    let ev; document.addEventListener('ms:change', (e) => (ev = e.detail.font), { once: true });
    MS.set({ font: 'Inter' });
    return { v: document.body.style.getPropertyValue('--ms-font'), link: !!document.getElementById('ms-font-inter'), get: MS.get().font, ev, sel: document.getElementById('fontsel').value, saved: JSON.parse(localStorage.getItem('multistyle-ui')).font };
  });
  expect(r.v).toContain('Inter');
  expect(r).toMatchObject({ link: true, get: 'inter', ev: 'inter', sel: 'inter', saved: 'inter' });
  await page.reload();
  expect(await page.evaluate(() => document.body.style.getPropertyValue('--ms-font'))).toContain('Inter');
  expect(await page.evaluate(() => (MS.set({ font: "Georgia, serif" }), document.body.style.getPropertyValue('--ms-font')))).toBe('Georgia, serif');
  expect(await page.evaluate(() => (MS.set({ font: 'auto' }), document.body.style.getPropertyValue('--ms-font')))).toBe('');
});
