import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';
const dir = process.env.QA_EVIDENCE_DIR ?? '.omo/evidence/recovery';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const errors = []; const results = [];
try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 900 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.getByLabel('Room settings', { exact: true }).click();
    await page.getByLabel('Outdoor activity', { exact: true }).uncheck();
    await page.getByLabel('Room settings', { exact: true }).click();
    const capture = async name => { await page.waitForTimeout(1600); await page.screenshot({ path: `${dir}/${width}-${name}.png` }); };
    await page.getByRole('button', { name: '2D board', exact: true }).click();
    for (const [name, turns, row, column] of [['D', 2, 3, 1], ['A', 0, 1, 10], ['B', 0, 2, 1]]) {
      await page.getByRole('button', { name: `Select piece ${name}`, exact: true }).click();
      for (let i = 0; i < turns; i++) await page.keyboard.press('r');
      await page.getByRole('gridcell', { name: `Row ${row}, column ${column}, empty`, exact: true }).click();
    }
    await page.getByLabel('3 of 12 pieces placed').waitFor();
    await page.getByRole('button', { name: 'Hint', exact: true }).click();
    await page.getByRole('heading', { name: 'Lift 2 pieces to keep going', exact: true }).waitFor();
    const flagged = await page.locator('[role="gridcell"][data-recovery]').evaluateAll(nodes => [...new Set(nodes.map(node => node.dataset.piece))].sort());
    assert.deepEqual(flagged, ['A', 'B']);
    assert.equal(await page.locator('[role="gridcell"][data-piece="D"][data-recovery]').count(), 0);
    await capture('flat-recovery');
    await page.getByRole('button', { name: '3D desk', exact: true }).click();
    await page.locator('.tabletop-canvas canvas').waitFor(); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Solve board', exact: true }).click();
    await page.getByRole('heading', { name: 'Lift 2 pieces to keep going', exact: true }).waitFor();
    await capture('desk-recovery');
    await page.getByRole('button', { name: 'Desk view', exact: true }).click();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(100); await page.screenshot({ path: `${dir}/${width}-camera-middle.png` });
    await page.waitForTimeout(1400); await capture('topdown-recovery');
    await page.getByRole('button', { name: 'Desk view', exact: true }).click();
    await page.waitForTimeout(100); await page.screenshot({ path: `${dir}/${width}-camera-return.png` });
    await page.waitForTimeout(1400);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.getByRole('button', { name: 'Lift highlighted pieces', exact: true }).click();
    await page.getByLabel('1 of 12 pieces placed').waitFor();
    await page.getByRole('button', { name: '2D board', exact: true }).click();
    assert.equal(await page.locator('[role="gridcell"][data-piece="D"]').count(), 4);
    assert.equal(await page.locator('[role="gridcell"][data-piece="A"], [role="gridcell"][data-piece="B"]').count(), 0);
    await page.getByRole('button', { name: 'Undo', exact: true }).click(); await page.getByLabel('3 of 12 pieces placed').waitFor();
    await page.getByRole('button', { name: 'Solve board', exact: true }).click();
    await page.getByRole('button', { name: 'Lift highlighted pieces', exact: true }).click();
    await page.getByRole('button', { name: 'Solve board', exact: true }).click(); await page.getByLabel('12 of 12 pieces placed').waitFor();
    assert.equal(await page.locator('[role="gridcell"][data-piece]').count(), 55);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await capture('completed');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert(overflow <= 1);
    results.push({ width, height, suggested: flagged, retained: 'D', minimumRemovals: 2, hintAndSolve: true, undo: true, solved: 55, overflow });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${dir}/qa.json`, JSON.stringify({ results, errors }, null, 2)); console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
