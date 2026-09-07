import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { OrthographicCamera, Vector3 } from 'three';
import assert from 'node:assert/strict';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';
const evidence = process.env.QA_EVIDENCE_DIR ?? '.omo/evidence/tabletop';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Piece A', exact: true }).tap();
await page.locator('.tabletop-stage').scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
const box = await page.locator('.tabletop-canvas').boundingBox();
assert(box);
const camera = new OrthographicCamera(-box.width / 2, box.width / 2, box.height / 2, -box.height / 2, .1, 200);
camera.zoom = Math.min(box.width / 21.5, box.height / 13.8);
camera.position.set(1.2, 19, 14); camera.lookAt(0, 0, .1); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
const project = (x, y, z) => {
  const v = new Vector3(x, y, z).project(camera);
  return { x: box.x + (v.x + 1) * box.width / 2, y: box.y + (1 - v.y) * box.height / 2 };
};
const source = project(-8.5, 1.22, -3.8);
const target = project(-4.5, .65, -2);
const cdp = await page.context().newCDPSession(page);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...source, radiusX: 2, radiusY: 2 }] });
for (let step = 1; step <= 10; step++) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{
    x: source.x + (target.x - source.x) * step / 10,
    y: source.y + (target.y - source.y) * step / 10, radiusX: 2, radiusY: 2,
  }] });
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.getByLabel('1 of 12 pieces placed').waitFor();
await page.waitForTimeout(700);
await page.screenshot({ path: `${evidence}/touch-placement.png`, fullPage: true });
await browser.close();

const blocked = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-webgl'] });
const fallback = await blocked.newPage({ viewport: { width: 1280, height: 900 } });
await fallback.goto(baseURL, { waitUntil: 'networkidle' });
await fallback.getByRole('grid', { name: 'Kanoodle board' }).waitFor();
await fallback.getByRole('button', { name: 'Piece A', exact: true }).focus();
await fallback.keyboard.press('Enter');
await fallback.getByRole('gridcell', { name: 'Row 1, column 1, empty', exact: true }).focus();
await fallback.keyboard.press('Enter');
await fallback.getByLabel('1 of 12 pieces placed').waitFor();
await fallback.screenshot({ path: `${evidence}/no-webgl-keyboard.png`, fullPage: true });
await blocked.close();
const result = { baseURL, touch: 'CDP touchStart/move/end on the real mesh placed one piece',
  fallback: 'Chrome --disable-webgl automatically opened the 2D board; keyboard Enter selected and placed a piece' };
await writeFile(`${evidence}/access-qa.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
