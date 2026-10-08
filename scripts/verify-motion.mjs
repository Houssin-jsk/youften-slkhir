import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = new URL('../.verification/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const duration = Number(process.env.MOTION_TEST_MS || 80000);
const results = {};
try {
  await Promise.all([
    { name: 'desktop-normal', width: 1280, height: 800, reducedMotion: 'no-preference' },
    { name: 'desktop-reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
    { name: 'mobile-normal', width: 390, height: 844, reducedMotion: 'no-preference' },
    { name: 'mobile-reduced', width: 390, height: 844, reducedMotion: 'reduce' },
  ].map(async ({ name, width, height, reducedMotion }) => {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.layoutShiftTotal = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.layoutShiftTotal += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.locator('.free-bee[data-ready="true"]').waitFor();
    assert.equal(await page.locator('.brand-name').textContent(), 'Youften Slkhir');
    assert.equal(await page.locator('.message-status').textContent(), 'Site officiel en préparation');
    assert.equal(await page.getByRole('button').count(), 0);
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), reducedMotion === 'reduce');
    console.log(`${name}: observing ${duration / 1000}s of central flight`);
    const sample = await page.evaluate(async duration => {
      const bee = document.querySelector('.free-bee'), level = document.querySelector('.honey-level');
      const drop = document.querySelector('.honey-drop'), ripple = document.querySelector('.honey-ripple');
      const logo = document.querySelector('.brand-logo').getBoundingClientRect();
      const heading = document.querySelector('h1').getBoundingClientRect();
      const jar = document.querySelector('.honey-illustration').getBoundingClientRect();
      const center = { x: logo.left + logo.width / 2, y: logo.top + logo.height / 2 };
      const radius = logo.width * .422 + 28;
      const jarY = jar.top + 68 * jar.width / 360;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let previous = null, maxSpeed = 0, outOfBounds = 0, orbitError = 0;
      let previousFill = .15, minFill = 1, maxFill = 0, decreased = false;
      let previousDrop = null, previousLanding = null;
      const landingIntervals = [], orbitSweeps = new Map(), lastOrbitAngles = new Map();
      const intervals = [], phases = new Set();
      let dropBefore = false, rippleBefore = false, drops = 0, ripples = 0, synchronized = true;
      let overlapStart = null, longestOverlap = 0, postCapDeliveries = 0, lastDelivery = 0;
      const wings = new Set(), ambient = new Set();
      const start = performance.now();
      await new Promise(resolve => {
        function frame(now) {
          const rect = bee.getBoundingClientRect();
          const p = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          if (previous) maxSpeed = Math.max(maxSpeed, Math.hypot(p.x - previous.x, p.y - previous.y) / (now - previous.time) * 1000);
          previous = { ...p, time: now };
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          if (rect.left < 0 || rect.right > innerWidth || rect.top < 0 || rect.bottom > innerHeight) outOfBounds++;
          const phase = bee.dataset.phase; phases.add(phase);
          if (phase === 'orbit') {
            const index = Number(bee.dataset.excursion);
            const expectedRadius = radius + (Number(bee.dataset.dropInterval) - 6000) / 6000 * 10;
            orbitError = Math.max(orbitError, Math.abs(Math.hypot(p.x - center.x, p.y - center.y) - expectedRadius));
            const angle = Math.atan2(p.y - center.y, p.x - center.x);
            const oldAngle = lastOrbitAngles.get(index);
            if (oldAngle !== undefined) {
              let change = angle - oldAngle;
              if (change > Math.PI) change -= 2 * Math.PI;
              if (change < -Math.PI) change += 2 * Math.PI;
              orbitSweeps.set(index, (orbitSweeps.get(index) || 0) + Math.abs(change) * 180 / Math.PI);
            }
            lastOrbitAngles.set(index, angle);
          }
          const overlaps = rect.right > heading.left && rect.left < heading.right && rect.bottom > heading.top && rect.top < heading.bottom;
          if (overlaps && overlapStart === null) overlapStart = now;
          if (!overlaps && overlapStart !== null) { longestOverlap = Math.max(longestOverlap, now - overlapStart); overlapStart = null; }
          const fill = Number(level.dataset.fill);
          decreased ||= fill < previousFill - .000001;
          minFill = Math.min(minFill, fill); maxFill = Math.max(maxFill, fill); previousFill = fill;
          const deliveries = Number(level.dataset.deliveries);
          if (deliveries > lastDelivery && fill === .25) postCapDeliveries++;
          if (deliveries > lastDelivery) {
            const event = { index: Number(bee.dataset.excursion), planned: Number(bee.dataset.dropInterval), time: now };
            if (previousLanding) landingIntervals.push({ index: previousLanding.index, planned: previousLanding.planned, measured: now - previousLanding.time });
            previousLanding = event;
          }
          lastDelivery = deliveries;
          const dropVisible = Number(getComputedStyle(drop).opacity) > .5;
          if (dropVisible && !dropBefore) {
            drops++; synchronized &&= phase === 'hover';
            const event = { index: Number(bee.dataset.excursion), planned: Number(bee.dataset.dropInterval), time: now };
            if (previousDrop) intervals.push({ index: previousDrop.index, planned: previousDrop.planned, measured: now - previousDrop.time });
            previousDrop = event;
          }
          if (dropVisible) {
            const r = drop.getBoundingClientRect();
            synchronized &&= Math.abs(r.left + r.width / 2 - (jar.left + jar.width / 2)) < 2;
          }
          dropBefore = dropVisible;
          const rippleVisible = Number(getComputedStyle(ripple).opacity) > .1;
          if (rippleVisible && !rippleBefore) ripples++;
          rippleBefore = rippleVisible;
          wings.add(getComputedStyle(document.querySelector('.wing-front')).transform);
          ambient.add(getComputedStyle(document.querySelector('main'), '::before').transform);
          if (now - start >= duration) resolve(); else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      return { intervals, landingIntervals, orbitError, orbitSweeps: Object.fromEntries(orbitSweeps),
        horizontalTravel: maxX - minX, centralBoundsPassed: minX >= center.x - radius - 63 && maxX <= center.x + radius + 63 && minY >= center.y - radius - 11 && maxY <= jarY + 4,
        maxSpeed, outOfBounds, longestOverlap, minFill, maxFill, decreased, drops, ripples, synchronized, postCapDeliveries,
        phases: [...phases], wingFrames: wings.size, ambientFrames: ambient.size, layoutShift: window.layoutShiftTotal };
    }, duration);
    console.log(name, JSON.stringify(sample));
    assert(sample.intervals.length >= 8, 'Observe at least two complete timing patterns');
    for (const trip of sample.intervals) {
      assert.equal(trip.planned, [6000, 9000, 12000, 8000][trip.index % 4]);
      assert(Math.abs(trip.measured - trip.planned) < 100, 'Measured drop-to-drop time must follow the specified pattern');
    }
    assert(sample.centralBoundsPassed, 'Bee must stay in the central composition corridor');
    assert.equal(sample.outOfBounds, 0);
    assert(sample.orbitError < 1, 'Geometric logo orbit');
    for (const trip of sample.intervals) assert(sample.orbitSweeps[trip.index] > 355, 'Each interval must include a complete orbit');
    for (const trip of sample.landingIntervals) {
      assert.equal(trip.planned, [6000, 9000, 12000, 8000][trip.index % 4]);
      assert(Math.abs(trip.measured - trip.planned) < 100, 'Landed droplets must follow the same interval sequence');
    }
    assert(sample.maxSpeed < 1200, 'No positional jumps');
    assert(sample.longestOverlap < 1500, 'No lingering over the heading');
    assert(sample.minFill >= .15 - .000001 && sample.maxFill === .25 && !sample.decreased);
    assert(sample.postCapDeliveries >= 1 && sample.drops >= 5 && sample.ripples >= 5 && sample.synchronized);
    assert(sample.wingFrames > 10 && sample.ambientFrames > 10 && sample.layoutShift < .001);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: fileURLToPath(new URL(`${name}-central.png`, output)) });
    for (const [w, h] of [[320, 568], [768, 1024], [844, 390]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(Number(await page.locator('.honey-level').getAttribute('data-fill')), .25);
    }
    assert.deepEqual(errors, []);
    results[name] = sample;
    await context.close();
  }));
  await writeFile(new URL('results.json', output), JSON.stringify(results, null, 2));
  console.log('PASS: dash removed, controlled movement, full logo orbit every interval, 6/9/12/8 second drop-to-drop rhythm, synchronized honey capped at 25%, no controls, responsive continuity.');
} finally { await browser.close(); }
