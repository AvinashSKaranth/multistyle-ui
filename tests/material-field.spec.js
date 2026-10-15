import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL = pathToFileURL(resolve('tests/fixtures/material-field.html')).href;
const setStyle = (page, cls) => page.evaluate((c) => { document.body.className = c; }, cls);
const cs = (page, sel, prop, pseudo) => page.$eval(sel, (e, [p, ps]) => getComputedStyle(e, ps)[p], [prop, pseudo]);
// resolve a token to the rgb string getComputedStyle reports
const tok = (page, name, prop = 'color') => page.evaluate(([n, p]) => { const d = document.createElement('i'); d.style[p] = `var(${n})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [name, prop]);
const LBL = ' > span:not(.ms-icon)';

test.beforeEach(async ({ page }) => { await page.goto(URL); await page.waitForFunction(() => window.MS); });

test('material: filled field, 2px primary indicator and floated 12px label on focus', async ({ page }) => {
  expect(await cs(page, '#ia', 'height')).toBe('56px');
  expect(await cs(page, '#ia', 'borderTopWidth')).toBe('0px');
  await page.focus('#ia');
  const primary = await tok(page, '--ms-c-primary');
  await expect.poll(() => cs(page, '#a', 'transform', '::after')).toBe('matrix(1, 0, 0, 1, 0, 0)');
  expect(await cs(page, '#a', 'height', '::after')).toBe('2px');
  expect(await cs(page, '#a', 'backgroundColor', '::after')).toBe(primary);
  await expect.poll(() => cs(page, '#a' + LBL, 'fontSize')).toBe('12px');
  await expect.poll(() => cs(page, '#a' + LBL, 'color')).toBe(primary);
  expect(await cs(page, '#ia', 'boxShadow')).toBe('none');
});

test('material: leading icon shifts label; select floats by value; counter after label', async ({ page }) => {
  expect(await cs(page, '#a' + LBL, 'left')).toBe(await cs(page, '#ia', 'paddingLeft'));
  await expect.poll(() => cs(page, '#c > span', 'fontSize')).toBe('16px');
  await page.selectOption('#ic', '1');
  await page.locator('#btn').focus();
  await expect.poll(() => cs(page, '#c > span', 'fontSize')).toBe('12px');
  await expect(page.locator('#d + small.counter')).toHaveText('0/10');
});

test('material: error colours label and helper with the error token', async ({ page }) => {
  const err = await tok(page, '--ms-c-error');
  await expect.poll(() => cs(page, '#b > span', 'color')).toBe(err);
  expect(await cs(page, '#hb', 'color')).toBe(err);
  expect(await cs(page, '#ib', 'borderBottomColor')).toBe(err);
});

test('material3: outlined 2px primary border on focus, notch bg equals field bg', async ({ page }) => {
  await setStyle(page, 'style-material3');
  expect(await cs(page, '#ia', 'borderTopWidth')).toBe('1px');
  await page.focus('#ia');
  const primary = await tok(page, '--ms-c-primary');
  await expect.poll(() => cs(page, '#ia', 'borderTopWidth')).toBe('2px');
  await expect.poll(() => cs(page, '#ia', 'borderTopColor')).toBe(primary);
  await expect.poll(() => cs(page, '#a' + LBL, 'fontSize')).toBe('12px');
  const bg = await tok(page, '--ms-c-surface', 'backgroundColor');
  await expect.poll(() => cs(page, '#a' + LBL, 'backgroundColor')).toBe(bg);
});

test('variant classes force the look in other styles', async ({ page }) => {
  await setStyle(page, 'style-brutalist');
  expect(await cs(page, '#ia', 'height')).not.toBe('56px');
  await page.evaluate(() => document.getElementById('a').classList.add('outlined'));
  expect(await cs(page, '#ia', 'height')).toBe('56px');
  expect(await cs(page, '#ia', 'borderTopWidth')).toBe('1px');
});

test('ripple does not fire on fields', async ({ page }) => {
  await page.click('#ia');
  expect(await page.locator('.ms-ripple').count()).toBe(0);
});
