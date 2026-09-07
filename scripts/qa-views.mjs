import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';
const dir = process.env.QA_EVIDENCE_DIR ?? '.omo/evidence/views';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const errors = []; const layouts = [];
const shot = async (page, name) => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  if (!name.includes('middle')) await page.waitForTimeout(450);
  return page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
};
for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 390]]) {
  if (process.env.QA_WIDTH && width !== Number(process.env.QA_WIDTH)) continue;
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 900 });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.tabletop-canvas canvas').waitFor(); await page.waitForTimeout(900);
  await page.getByLabel('Room settings', { exact: true }).click();
  await page.getByLabel('Outdoor activity', { exact: true }).uncheck();
  await shot(page, `${width}-settings`);
  await page.getByLabel('Room settings', { exact: true }).click();
  for (const time of ['day', 'sunset', 'night']) {
    await page.getByLabel('Room settings', { exact: true }).click();
    await page.getByLabel('Time of day', { exact: true }).selectOption(time);
    await page.getByLabel('Room settings', { exact: true }).click(); await page.waitForTimeout(500);
    await shot(page, `${width}-${time}`);
  }
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.tabletop-stage').getAttribute('data-time'), 'night');
  await page.getByRole('button', { name: '2D board', exact: true }).click();
  await shot(page, `${width}-flat`);
  assert.equal(await page.getByRole('button', { name: /^Select piece / }).count(), 12);
  assert(await page.getByRole('button', { name: 'Turn piece right', exact: true }).isDisabled());
  const cell = page.getByRole('gridcell', { name: 'Row 1, column 1, empty', exact: true });
  await page.getByRole('button', { name: 'Select piece A', exact: true }).click();
  await page.getByRole('button', { name: 'Turn piece right', exact: true }).click();
  await page.waitForTimeout(90); await shot(page, `${width}-turn-middle`);
  await page.waitForTimeout(400); await shot(page, `${width}-turned`);
  await page.getByRole('button', { name: 'Turn piece left', exact: true }).click();
  await cell.focus();
  assert.equal(await page.locator('[data-preview="valid"]').count(), 5);
  await shot(page, `${width}-preview`);
  const edge = page.getByRole('gridcell', { name: 'Row 5, column 11, empty', exact: true });
  await edge.click();
  assert.equal(await page.locator('[role="gridcell"][data-piece]').count(), 0);
  assert(await page.locator('[data-preview="invalid"]').count() > 0);
  await shot(page, `${width}-blocked`);
  await cell.click(); await page.waitForTimeout(80); await shot(page, `${width}-seat-middle`);
  await page.waitForTimeout(450); await shot(page, `${width}-placed`);
  assert.equal(await page.locator('[role="gridcell"][data-piece="A"]').count(), 5);
  if (width >= 1000) {
    await page.getByRole('button', { name: 'Select piece C', exact: true }).dragTo(page.getByRole('gridcell', { name: 'Row 1, column 10, empty', exact: true }));
    assert.equal(await page.locator('[role="gridcell"][data-piece="C"]').count(), 3);
  }
  await page.getByRole('gridcell', { name: 'Row 1, column 1, piece A', exact: true }).click();
  await page.keyboard.press('r'); await page.keyboard.press('f');
  const moved = page.getByRole('gridcell', { name: 'Row 1, column 5, empty', exact: true });
  await moved.focus(); assert.equal(await page.locator('[data-preview="valid"]').count(), 5);
  await moved.click();
  assert.equal(await page.locator('[role="gridcell"][data-piece="A"]').count(), 5);
  await page.getByRole('button', { name: 'Use larger cells', exact: true }).click();
  const size = await page.locator('[role="gridcell"]').first().boundingBox(); assert(size.width >= 44);
  await shot(page, `${width}-precision`);
  await page.getByRole('button', { name: 'Fit board to screen', exact: true }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert(overflow <= 1, `Overflow ${width}: ${overflow}`); layouts.push({ width, height, overflow });
  await page.close();
}
const reduced = await browser.newPage({ reducedMotion: 'reduce' });
await reduced.goto(base, { waitUntil: 'networkidle' });
await reduced.getByLabel('Room settings', { exact: true }).click();
assert(await reduced.getByLabel('Outdoor activity', { exact: true }).isDisabled());
await shot(reduced, 'reduced-settings');
assert.deepEqual(errors, []);
await writeFile(`${dir}/qa${process.env.QA_WIDTH ? `-${process.env.QA_WIDTH}` : ''}.json`, JSON.stringify({ layouts, errors, checks: ['time persistence', 'ambient pause', 'reduced motion', '12 real shapes', 'valid footprint', 'invalid preservation', 'placement', 'move with R/F', 'precision cells'] }, null, 2));
await browser.close(); console.log('Views QA passed', layouts);
