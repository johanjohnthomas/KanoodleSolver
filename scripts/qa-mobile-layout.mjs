import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const evidence = process.env.QA_EVIDENCE_DIR || '.omo/evidence/mobile-layout';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const results = [];
const errors = [];
try {
  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, isMobile: true });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.locator('.tabletop-canvas canvas').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('.tabletop-canvas canvas')?.getBoundingClientRect().height >= 300);
    const geometry = await page.evaluate(() => {
      const intro = document.querySelector('.desk-intro').getBoundingClientRect();
      const tools = document.querySelector('.desk-scene-tools').getBoundingClientRect();
      return {
        overlap: intro.left < tools.right && intro.right > tools.left && intro.top < tools.bottom && intro.bottom > tools.top,
        overflow: document.body.scrollWidth - innerWidth,
        canvasHeight: document.querySelector('.tabletop-canvas canvas').getBoundingClientRect().height,
        skipBottom: document.querySelector('.desk-skip').getBoundingClientRect().bottom,
      };
    });
    assert.equal(geometry.overlap, false, `${width}px: heading overlaps challenge controls`);
    assert.ok(geometry.overflow <= 1, `${width}px: page overflows`);
    assert.ok(geometry.canvasHeight >= 300, `${width}px: tabletop too short for touch`);
    assert.ok(geometry.skipBottom < 0, `${width}px: unfocused skip link is visible`);
    await page.getByRole('button', { name: 'Piece A', exact: true }).tap();
    await page.getByRole('button', { name: 'Rotate right', exact: true }).tap();
    await page.getByRole('button', { name: 'Flip', exact: true }).tap();
    assert.match(await page.locator('.hand-status').innerText(), /90°.*turned over/s);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${evidence}/${width}x${height}.png` });
    await page.locator('#tabletop-controls').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${evidence}/${width}x${height}-controls.png` });
    await page.keyboard.press('Tab');
    await page.locator('.desk-skip').focus();
    assert.ok((await page.locator('.desk-skip').boundingBox()).y >= 0, 'Focused skip link must be visible');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#tabletop-controls').evaluate(element => element === document.activeElement), true);
    results.push({ width, height, ...geometry, touchRotateFlip: 'passed', keyboardSkip: 'passed' });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${evidence}/layout-qa.json`, JSON.stringify({ baseURL, results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
