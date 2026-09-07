import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';
const dir = process.env.QA_EVIDENCE_DIR ?? '.omo/evidence/outdoor';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = []; page.on('pageerror', error => errors.push(error.message));
try {
  // Control the browser clock, not application state, to capture short crossings reliably.
  await page.clock.install();
  await page.goto(base, { waitUntil: 'networkidle' }); await page.locator('canvas').waitFor();
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 100)));
  await page.getByLabel('Room settings', { exact: true }).click();
  await page.getByLabel('Outdoor activity', { exact: true }).uncheck();
  await page.getByLabel('Outdoor activity', { exact: true }).check();
  await page.getByLabel('Room settings', { exact: true }).click();
  const started = await page.evaluate(() => performance.now());
  const frames = [['rest', 1000], [null, 6000], ['birds-enter', 9000], ['birds-middle', 10000], ['birds-leave', 11000],
    [null, 16000], [null, 31000], ['plane-enter', 36000], ['plane-middle', 37000], ['plane-leave', 38000],
    [null, 42000], [null, 60000], ['car-enter', 63000], ['car-middle', 64000], ['car-leave', 65000]];
  for (const [name, time] of frames) {
    const elapsed = await page.evaluate(() => performance.now()) - started;
    await page.clock.fastForward(Math.max(0, time - elapsed));
    await page.clock.runFor(32);
    if (name) await page.screenshot({ path: `${dir}/${name}.png` });
  }
  await page.getByLabel('Room settings', { exact: true }).click();
  await page.getByLabel('Outdoor activity', { exact: true }).uncheck();
  await page.getByLabel('Room settings', { exact: true }).click();
  await page.clock.runFor(1000); await page.screenshot({ path: `${dir}/paused.png` });
  assert.deepEqual(errors, []);
  await writeFile(`${dir}/qa.json`, JSON.stringify({ frames, errors, clock: 'Playwright clock controls real timers and animation frames; no application state overrides' }, null, 2));
  console.log('Outdoor frame sequence captured');
} finally { await browser.close(); }
