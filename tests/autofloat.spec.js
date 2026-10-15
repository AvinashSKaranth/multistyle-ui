import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = (f) => pathToFileURL(resolve('tests/fixtures/' + f)).href;
const setStyle = (page, style) => page.evaluate((s) => window.MS.set({ style: s }), style);
const cs = (page, sel, prop) => page.$eval(sel, (e, p) => getComputedStyle(e)[p], prop);
const fs = (page, sel) => cs(page, sel, 'fontSize');

test.describe('with JS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(url('autofloat.html'));
    await page.waitForFunction(() => window.MS);
    await setStyle(page, 'material');
  });

  test('material: plain label floats on focus and when filled; field box is the label', async ({ page }) => {
    expect(await cs(page, '#a', 'height')).toBe('56px');
    await expect.poll(() => fs(page, '#a')).toBe('16px');
    await page.focus('#ia');
    await expect.poll(() => fs(page, '#a')).toBe('12px');
    await page.locator('#btn').focus();
    await expect.poll(() => fs(page, '#a')).toBe('16px');
    await page.fill('#ia', 'x@y.z');
    await expect.poll(() => fs(page, '#a')).toBe('12px');
  });

  test('material: text after the control, sibling pattern and textarea float', async ({ page }) => {
    for (const [lbl, inp] of [['#a2', '#ia2'], ['#b', '#ib'], ['#t', '#it'], ['#tb', '#itb']]) {
      await expect.poll(() => fs(page, lbl)).toBe('16px');
      await page.focus(inp);
      await expect.poll(() => fs(page, lbl)).toBe('12px');
    }
    expect(await cs(page, '#ib', 'height')).toBe('56px');
  });

  test('material: select and date are always floated, author placeholder untouched', async ({ page }) => {
    for (const l of ['#s', '#sb', '#d']) expect(await fs(page, l)).toBe('12px');
    expect(await page.getAttribute('#iph', 'placeholder')).toBe('you@x.com');
    expect(await page.getAttribute('#iph', 'data-ms-ph')).toBeNull();
    await expect.poll(() => fs(page, '#ph')).toBe('16px');
  });

  test('checkbox, range and multi-control labels are untouched', async ({ page }) => {
    for (const l of ['#cb', '#rg', '#two']) expect(await cs(page, l, 'height')).not.toBe('56px');
    expect(await cs(page, '#cb', 'display')).toBe('flex');
    expect(await cs(page, '#i2a', 'position')).toBe('static');
  });

  test('material3: outlined, notch background appears when floated', async ({ page }) => {
    await setStyle(page, 'material3');
    expect(await cs(page, '#a', 'borderTopWidth')).toBe('1px');
    await page.focus('#ia');
    await expect.poll(() => fs(page, '#a')).toBe('12px');
    await expect.poll(() => cs(page, '#a', 'borderTopColor')).toBe(await page.evaluate(() => { const d = document.createElement('i'); d.style.color = 'var(--ms-c-primary)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }));
  });

  test('placeholder injected only in floating scopes and removed after a style switch', async ({ page }) => {
    expect(await page.getAttribute('#ia', 'placeholder')).toBe(' ');
    expect(await page.getAttribute('#itb', 'placeholder')).toBe(' ');
    expect(await page.getAttribute('#ist', 'placeholder')).toBeNull(); // data-ms-fields=stacked
    expect(await page.getAttribute('#icb', 'placeholder')).toBeNull();
    await setStyle(page, 'fluent');
    await expect.poll(() => page.getAttribute('#ia', 'placeholder')).toBeNull();
    expect(await page.getAttribute('#ia', 'data-ms-ph')).toBeNull();
    expect(await page.getAttribute('#ifo', 'placeholder')).toBe(' '); // data-ms-fields=floating still floats in fluent
    expect(await page.getAttribute('#iph', 'placeholder')).toBe('you@x.com');
    await setStyle(page, 'material3');
    await expect.poll(() => page.getAttribute('#ia', 'placeholder')).toBe(' ');
  });

  for (const style of ['fluent', 'bootstrap', 'brutalist']) {
    test(`${style}: no floating, label and fields keep their normal box`, async ({ page }) => {
      await setStyle(page, style);
      for (const l of ['#a', '#a2', '#b', '#t', '#s']) {
        expect(await cs(page, l, 'position')).toBe('static');
        expect(await cs(page, l, 'height')).not.toBe('56px');
      }
      for (const [prop] of [['height'], ['position'], ['paddingTop'], ['paddingLeft'], ['borderTopWidth'], ['backgroundColor'], ['borderTopLeftRadius'], ['width']]) {
        await expect.poll(() => cs(page, '#ia', prop), prop).toBe(await cs(page, '#ist', prop));
        await expect.poll(() => cs(page, '#ib', prop), prop + ' sibling').toBe(await cs(page, '#ref', prop));
      }
      expect(await page.getAttribute('#ia', 'placeholder')).toBeNull();
    });
  }

  test('data-ms-fields: stacked disables in material, floating enables in fluent', async ({ page }) => {
    expect(await cs(page, '#st', 'position')).toBe('static');
    expect(await cs(page, '#ist', 'position')).toBe('static');
    expect(await cs(page, '#ia', 'position')).toBe('absolute');
    await setStyle(page, 'fluent');
    await expect.poll(() => cs(page, '#fo', 'height')).toBe('56px');
    expect(await cs(page, '#ifo', 'position')).toBe('absolute');
    expect(await cs(page, '#ia', 'position')).toBe('static');
  });
});

test('no JS: labels stay floated (no overlap with the empty field)', async ({ page }) => {
  await page.goto(url('autofloat-nojs.html'));
  for (const l of ['#a', '#a2', '#b', '#t', '#ph']) {
    if (l === '#ph') { expect(await fs(page, l)).toBe('16px'); continue; } // author placeholder: label stays resting, placeholder is hidden
    expect(await fs(page, l)).toBe('12px');
  }
    // floated label text sits in the top half of the 56px box (label top = 32px page padding); the value area starts below it
  const text = await page.$eval('#a', (e) => { const r = document.createRange(); r.selectNodeContents(e.firstChild); return r.getBoundingClientRect().bottom - e.getBoundingClientRect().top; });
  expect(text).toBeLessThanOrEqual(26);
});
