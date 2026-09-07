import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { Vector3 } from 'three';
import { sceneCamera } from './scene-camera.mjs';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173/';
const evidence = process.env.QA_EVIDENCE_DIR || '.omo/evidence/room';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const results = [];
const errors = [];
try {
  for (const [width, height] of [[1280, 1100], [768, 1024], [375, 900], [320, 740], [390, 844], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, isMobile: width < 900 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.locator('.tabletop-canvas canvas').waitFor();
    await page.waitForTimeout(2200);
    const stage = page.locator('.tabletop-stage');
    await stage.scrollIntoViewIfNeeded();
    await page.locator('.tabletop-canvas').scrollIntoViewIfNeeded();
    const capture = async name => {
      await page.waitForTimeout(350);
      return page.screenshot({ path: `${evidence}/${width}-${name}.png` });
    };
    await capture('closed');
    assert.equal(await page.getByRole('button', { name: /desk drawer/ }).count(), 0);
    assert.equal(await page.locator('#drawer-note').count(), 0);
    const box = await page.locator('.tabletop-canvas').boundingBox();
    assert(box);
    const camera = sceneCamera(box);
    const handle = new Vector3(0, -1.15, 8.93).project(camera);
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.touchscreen.tap(box.x + (handle.x + 1) * box.width / 2, box.y + (1 - handle.y) * box.height / 2);
    await page.getByRole('img', { name: /Made for Rach with love <3/ }).waitFor();
    if (width === 1280) await capture('opening');
    await page.waitForTimeout(1800);
    assert.equal(await page.evaluate(() => scrollY), scrollBefore);
    await capture('open');
    assert.equal(await page.getByText('Made for Rach with love <3', { exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Solve board', exact: true }).count(), 0);
    const openHandle = new Vector3(0, -1.15, 12.93).project(camera);
    await page.touchscreen.tap(box.x + (openHandle.x + 1) * box.width / 2, box.y + (1 - openHandle.y) * box.height / 2);
    await page.getByRole('img', { name: /Made for Rach with love <3/ }).waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Play', exact: true }).tap();
    await page.waitForTimeout(1500);
    await stage.scrollIntoViewIfNeeded();
    await capture('overhead');
    await page.getByRole('button', { name: '2D board', exact: true }).tap();
    await page.getByRole('grid', { name: 'Kanoodle board' }).waitFor();
    assert.equal(await page.locator('#drawer-note').count(), 0);
    assert.equal(await page.getByRole('button', { name: /desk drawer/ }).count(), 0);
    const overflow = await page.evaluate(() => document.body.scrollWidth - innerWidth);
    assert.ok(overflow <= 1);
    results.push({ width, height, meshOpenClose: 'passed', spatialNoteOnly: 'passed', scrollUnchanged: true, overheadAnd2D: 'passed', overflow });
    await page.close();
  }
  const reduced = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  await reduced.goto(baseURL, { waitUntil: 'networkidle' });
  await reduced.locator('.tabletop-canvas canvas').waitFor();
  await reduced.waitForTimeout(700);
  const bounds = await reduced.locator('.tabletop-canvas').boundingBox();
  const handle = new Vector3(0, -1.15, 8.93).project(sceneCamera(bounds));
  await reduced.mouse.click(bounds.x + (handle.x + 1) * bounds.width / 2, bounds.y + (1 - handle.y) * bounds.height / 2);
  await reduced.getByRole('img', { name: /Made for Rach with love <3/ }).waitFor();
  await reduced.screenshot({ path: `${evidence}/reduced-motion.png` });
  await reduced.close();
  assert.deepEqual(errors, []);
  await writeFile(`${evidence}/qa.json`, JSON.stringify({ baseURL, results, errors, reducedMotion: 'passed' }, null, 2));
  console.log(JSON.stringify({ results, errors, reducedMotion: 'passed' }, null, 2));
} finally {
  await browser.close();
}
