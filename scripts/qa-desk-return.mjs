import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { Vector3 } from 'three';
import { sceneCamera } from './scene-camera.mjs';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';
const dir = process.env.QA_EVIDENCE_DIR ?? '.omo/evidence/desk-return';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const results = []; const errors = [];
try {
  for (const [width, height, reducedMotion] of [[1280, 900, 'no-preference'], [768, 1024, 'no-preference'], [375, 900, 'no-preference'], [320, 740, 'no-preference'], [1280, 900, 'reduce']]) {
    const touch = width < 900;
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, reducedMotion });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '2D board', exact: true }).click();
    for (const [name, row, column] of [['A', 1, 1], ['L', 4, 9]]) {
      await page.getByRole('button', { name: `Select piece ${name}`, exact: true }).click();
      await page.getByRole('gridcell', { name: `Row ${row}, column ${column}, empty`, exact: true }).click();
    }
    await page.getByLabel('2 of 12 pieces placed').waitFor();
    await page.getByRole('button', { name: '3D desk', exact: true }).click();
    await page.locator('.tabletop-canvas canvas').waitFor();
    await page.locator('.tabletop-canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(1800);
    const prefix = `${width}-${reducedMotion}`;
    const capture = name => page.screenshot({ path: `${dir}/${prefix}-${name}.png` });
    await capture('before');
    const bounds = await page.locator('.tabletop-canvas').boundingBox(); assert(bounds);
    const camera = sceneCamera(bounds);
    const project = vector => { const p = vector.project(camera); return { x: bounds.x + (p.x + 1) * bounds.width / 2, y: bounds.y + (1 - p.y) * bounds.height / 2 }; };
    const source = project(new Vector3(-5, .64, -3.5));
    const target = project(new Vector3(-8, .65, -2));
    const cdp = touch ? await page.context().newCDPSession(page) : null;
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...source, radiusX: 2, radiusY: 2 }] });
    else { await page.mouse.move(source.x, source.y); await page.mouse.down(); }
    for (let step = 1; step <= 12; step++) {
      const p = { x: source.x + (target.x - source.x) * step / 12, y: source.y + (target.y - source.y) * step / 12 };
      if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, radiusX: 2, radiusY: 2 }] });
      else await page.mouse.move(p.x, p.y);
    }
    assert.match(await page.locator('.desk-status').innerText(), /Release to return piece A/);
    await capture('preview');
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await page.mouse.up();
    await page.getByLabel('1 of 12 pieces placed').waitFor();
    await page.waitForTimeout(100); await capture('returning');
    await page.waitForTimeout(1500); await capture('returned');
    assert.match(await page.locator('.desk-status').innerText(), /Piece returned to the desk/);
    await page.getByRole('button', { name: '2D board', exact: true }).click();
    assert.equal(await page.locator('[role="gridcell"][data-piece="A"]').count(), 0);
    assert.equal(await page.locator('[role="gridcell"][data-piece="L"]').count(), 4);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await page.getByLabel('2 of 12 pieces placed').waitFor();
    assert.equal(await page.locator('[role="gridcell"][data-piece="A"]').count(), 5);
    await page.getByRole('button', { name: 'Select piece A', exact: true }).click();
    await page.getByRole('button', { name: 'Return to desk', exact: true }).focus(); await page.keyboard.press('Enter');
    await page.getByLabel('1 of 12 pieces placed').waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert.equal(overflow, 0);
    results.push({ width, height, reducedMotion, touch, returned: 'A', retained: 'L', undo: true, keyboard: true, overflow });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${dir}/qa.json`, JSON.stringify({ baseURL, results, errors }, null, 2)); console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
