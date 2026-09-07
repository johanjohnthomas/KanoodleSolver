import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { OrthographicCamera, Vector3 } from 'three';

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
    const box = await page.locator('.tabletop-canvas').boundingBox();
    assert(box);
    const camera = new OrthographicCamera(-box.width / 2, box.width / 2, box.height / 2, -box.height / 2, .1, 200);
    camera.zoom = Math.min(box.width / 28, box.height / 28);
    camera.position.set(1.2, 19, 14); camera.lookAt(0, 1, -.5);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const handle = new Vector3(0, -1.15, 8.93).project(camera);
    await page.touchscreen.tap(box.x + (handle.x + 1) * box.width / 2, box.y + (1 - handle.y) * box.height / 2);
    await page.getByRole('button', { name: 'Close desk drawer', exact: true }).waitFor();
    if (width === 1280) await capture('opening');
    await page.waitForTimeout(1800);
    const noteBounds = await page.locator('#drawer-note p').boundingBox();
    assert(noteBounds && noteBounds.y >= 0 && noteBounds.y + noteBounds.height <= height, `${width}px: opening must reveal the full note without manual scrolling`);
    await capture('open');
    await capture('note');
    assert.equal(await page.locator('#drawer-note p').innerText(), 'Made for Rach with love <3');
    await page.getByLabel('0 of 12 pieces placed').waitFor();
    await page.getByRole('button', { name: 'Close desk drawer', exact: true }).tap();
    await page.locator('#drawer-note p').waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Open desk drawer', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Close desk drawer', exact: true }).waitFor();
    await page.getByRole('button', { name: 'View from above', exact: true }).tap();
    await page.waitForTimeout(1500);
    await stage.scrollIntoViewIfNeeded();
    await capture('overhead');
    await page.getByRole('button', { name: '2D board', exact: true }).tap();
    await page.getByRole('grid', { name: 'Kanoodle board' }).waitFor();
    assert.equal(await page.locator('#drawer-note p').innerText(), 'Made for Rach with love <3');
    const overflow = await page.evaluate(() => document.body.scrollWidth - innerWidth);
    assert.ok(overflow <= 1);
    results.push({ width, height, meshTouch: 'passed', closeAndKeyboardReopen: 'passed', overheadAnd2D: 'passed', overflow });
    await page.close();
  }
  const reduced = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  await reduced.goto(baseURL, { waitUntil: 'networkidle' });
  await reduced.getByRole('button', { name: 'Open desk drawer', exact: true }).click();
  await reduced.locator('#drawer-note p').waitFor();
  await reduced.screenshot({ path: `${evidence}/reduced-motion.png` });
  await reduced.close();
  assert.deepEqual(errors, []);
  await writeFile(`${evidence}/qa.json`, JSON.stringify({ baseURL, results, errors, reducedMotion: 'passed' }, null, 2));
  console.log(JSON.stringify({ results, errors, reducedMotion: 'passed' }, null, 2));
} finally {
  await browser.close();
}
