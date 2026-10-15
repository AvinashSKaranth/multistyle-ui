import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const url = pathToFileURL(path.resolve('tests/fixtures/C.html')).href;
test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(url); });
const listen = (page, sel, name) => page.evaluate(([s, n]) => { window.__ev = []; document.querySelector(s).addEventListener(n, (e) => window.__ev.push(e.detail)); }, [sel, name]);
const ids = (page) => page.$$eval('#sl > li', (l) => l.map((x) => x.id));

test('command palette', async ({ page }) => {
  await listen(page, '#cmd', 'ms:command');
  await page.keyboard.press('Control+k');
  await expect(page.locator('#cmd')).toHaveAttribute('open', '');
  await expect(page.locator('#cmd .group')).toHaveCount(2);
  await page.keyboard.type('doc');
  await expect(page.locator('#cmd [role=option]:visible')).toHaveCount(1);
  await expect(page.locator('#cmd .group')).toHaveCount(1);
  await page.keyboard.type('zzz');
  await expect(page.locator('#cmd .empty')).toBeVisible();
  await page.fill('#cmd input', '');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  expect((await page.evaluate(() => window.__ev))[0].value).toBe('Settings');
  await expect(page.locator('#cmd')).not.toHaveAttribute('open', '');
});

test('sortable keyboard', async ({ page }) => {
  await listen(page, '#sl', 'ms:sort');
  await page.focus('#a');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  expect(await ids(page)).toEqual(['b', 'a', 'c']);
  expect(await page.evaluate(() => window.__ev)).toEqual([{ from: 0, to: 1, order: ['b', 'a', 'c'] }]);
  await page.focus('#a');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  expect(await ids(page)).toEqual(['b', 'a', 'c']);
});

test('sortable mouse drag', async ({ page }) => {
  await listen(page, '#sl', 'ms:sort');
  await page.dragAndDrop('#a', '#c', { targetPosition: { x: 20, y: 30 } });
  expect(await ids(page)).toEqual(['b', 'c', 'a']);
  expect((await page.evaluate(() => window.__ev))[0].to).toBe(2);
});

test('carousel arrows and dots', async ({ page }) => {
  const cur = () => page.locator('.carousel-dots [aria-current]').getAttribute('aria-label');
  expect(await cur()).toBe('Slide 1');
  await page.click('.carousel-next');
  await expect.poll(cur).toBe('Slide 2');
  await page.click('[aria-label="Slide 3"]');
  await expect.poll(cur).toBe('Slide 3');
  await page.click('.carousel-next'); // loops
  await expect.poll(cur).toBe('Slide 1');
});

test('pagination', async ({ page }) => {
  await listen(page, '#pg', 'ms:page');
  await expect(page.locator('#pg .ellipsis')).toHaveCount(1);
  await expect(page.locator('#pg [aria-current=page]')).toHaveText('3');
  await page.click('#pg [aria-label="Next page"]');
  await expect(page.locator('#pg [aria-current=page]')).toHaveText('4');
  await page.click('#pg [aria-label="Last page"]');
  await expect(page.locator('#pg [aria-current=page]')).toHaveText('20');
  expect((await page.evaluate(() => window.__ev)).map((e) => e.page)).toEqual([4, 20]);
  await page.evaluate(() => MS.paginate('#pg', { total: 3, current: 1 }));
  await expect(page.locator('#pg .ellipsis')).toHaveCount(0);
});

test('button group', async ({ page }) => {
  await listen(page, '#g1', 'ms:select');
  await page.click('#g1 >> text=Week');
  await expect(page.locator('#g1 [aria-pressed=true]')).toHaveText('Week');
  expect((await page.evaluate(() => window.__ev))[0].values).toEqual(['Week']);
  await page.click('#g2 >> text=Bold');
  await page.click('#g2 >> text=Italic');
  await expect(page.locator('#g2 [aria-pressed=true]')).toHaveCount(2);
});

test('menu keyboard', async ({ page }) => {
  await page.click('#mb');
  await expect(page.locator('#m1 button').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#m1 button').nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#m1 button').last()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#m1')).not.toBeVisible();
});

test('dismiss', async ({ page }) => {
  await page.click('#al [data-ms-dismiss]');
  await expect(page.locator('#al')).toHaveCount(0);
});

for (const mode of ['light', 'dark']) {
  test('screenshot ' + mode, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
    await page.goto(url);
    await page.click('#mb');
    await page.evaluate(() => document.querySelector('#p1').showPopover());
    await page.screenshot({ path: `test-results/C-${mode}.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await page.screenshot({ path: `test-results/C-cmd-${mode}.png` });
  });
}
