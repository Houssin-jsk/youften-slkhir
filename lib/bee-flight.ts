type Point = { x: number; y: number };
type Geometry = { width: number; height: number; jar: Point; logo: Point; radius: number; radiusY: number };
type Elements = { jar: HTMLDivElement; bee: HTMLDivElement; direction: HTMLDivElement; level: SVGGElement; drop: SVGGElement; ripple: SVGEllipseElement };

const DROP_INTERVALS = [6000, 9000, 12000, 8000] as const;
const HOVER_DURATION = 1350;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const smooth = (t: number) => t * t * (3 - 2 * t);
function bezier(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t;
  return { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y };
}

export function createBeeFlight(elements: Elements) {
  const { jar, bee, direction, level, drop, ripple } = elements;
  const main = jar.closest("main")!;
  const logo = main.querySelector<HTMLImageElement>(".brand-logo")!;
  let geometry: Geometry;
  let point: Point = { x: 0, y: 0 };
  let hovering = true;
  let hoverTime = 0;
  let cycleTime = 0, excursion = 0;
  let interval: number = DROP_INTERVALS[0];
  let awayTime = 0, awayDuration = interval - HOVER_DURATION;
  let released = false;
  let dropTime: number | null = null;
  let rippleTime: number | null = null;
  let fill = .15, fillFrom = fill, fillTarget = fill, fillTime = 0;
  let last: number | null = null, frameId = 0;
  let destroyed = false, needsMeasure = true;
  let tilt = 0, facing = 1, spriteSize = 52;
  let resizeOffset: Point = { x: 0, y: 0 }, resizeTime = 350;
  const safe = (p: Point): Point => ({ x: clamp(p.x, 30, geometry.width - 30), y: clamp(p.y, 36, geometry.height - 30) });

  // Every drop-to-drop interval includes the hover, approach, full logo orbit,
  // and return. Radius grows gently with the available interval length.
  function flight(progress: number): { point: Point; phase: string } {
    const sign = excursion % 2 === 0 ? 1 : -1;
    const center = geometry.logo;
    const expansion = (interval - 6000) / 6000 * 10;
    const radius = geometry.radius + expansion;
    const radiusY = Math.min(radius, geometry.radiusY + expansion);
    const start = { x: center.x + sign * radius, y: center.y };
    const laneOffset = radius + 52;
    const firstLane = clamp(center.x + sign * laneOffset, 30, geometry.width - 30);
    const lastLane = firstLane;
    if (progress < .28) {
      return { point: bezier(geometry.jar, { x: firstLane, y: geometry.jar.y },
        { x: firstLane, y: center.y + 40 }, start, smooth(progress / .28)), phase: "approach" };
    }
    if (progress < .72) {
      const angle = 2 * Math.PI * smooth((progress - .28) / .44);
      return { point: { x: center.x + sign * radius * Math.cos(angle),
        y: center.y - radiusY * Math.sin(angle) }, phase: "orbit" };
    }
    return { point: bezier(start, { x: lastLane, y: center.y + 40 },
      { x: lastLane, y: geometry.jar.y }, geometry.jar, smooth((progress - .72) / .28)), phase: "return" };
  }

  function measure() {
    const jarRect = jar.getBoundingClientRect(), logoRect = logo.getBoundingClientRect();
    const entranceOffset = new DOMMatrix(getComputedStyle(jar).transform).m42;
    const radius = logoRect.width * .422 + 28;
    geometry = {
      width: innerWidth, height: innerHeight,
      jar: { x: jarRect.left + jarRect.width / 2, y: jarRect.top - entranceOffset + 68 * jarRect.width / 360 },
      logo: { x: logoRect.left + logoRect.width / 2, y: logoRect.top + logoRect.height / 2 },
      radius, radiusY: Math.min(radius, logoRect.top + logoRect.height / 2 - 36),
    };
    spriteSize = bee.offsetWidth;
    if (bee.dataset.ready) {
      const target = hovering ? geometry.jar : flight(awayTime / awayDuration).point;
      resizeOffset = { x: point.x - target.x, y: point.y - target.y };
      resizeTime = 0;
    } else point = { ...geometry.jar };
    needsMeasure = false;
  }

  function updateHoney(delta: number) {
    if (dropTime !== null) {
      dropTime += delta;
      const progress = Math.min(1, dropTime / 680);
      const landing = 211 - 90 * fill;
      drop.style.transform = `translateY(${(landing - 95) * progress * progress}px)`;
      drop.style.opacity = progress < 1 ? "1" : "0";
      if (progress === 1) {
        dropTime = null;
        rippleTime = 0;
        fillFrom = fill;
        fillTarget = Math.min(.25, Math.round((fillTarget + .025) * 1000) / 1000);
        fillTime = 0;
        level.dataset.deliveries = String(Number(level.dataset.deliveries || 0) + 1);
      }
    }
    if (fillTime < 850 || !level.dataset.ready) {
      fillTime = Math.min(850, fillTime + delta);
      fill = Math.min(.25, fillFrom + (fillTarget - fillFrom) * smooth(fillTime / 850));
      level.style.transform = `translateY(${211 - 90 * fill}px)`;
      level.dataset.fill = String(fill);
      level.dataset.ready = "true";
    }
    if (rippleTime !== null) {
      rippleTime += delta;
      const progress = Math.min(1, rippleTime / 1000);
      ripple.style.transform = `scaleX(${1 + progress * 3})`;
      ripple.style.opacity = String(.75 * (1 - progress));
      if (progress === 1) rippleTime = null;
    }
  }


  function tick(timestamp: number) {
    if (destroyed || document.hidden) return;
    if (needsMeasure) measure();
    // Preserve the specified wall-clock rhythm even after a delayed browser frame.
    // Hidden-tab suspension clears `last`, so returning never fast-forwards a trip.
    const delta = last === null ? 0 : timestamp - last;
    last = timestamp;
    const previous = { ...point };
    cycleTime += delta;
    while (cycleTime >= interval) {
      cycleTime -= interval;
      excursion++;
      interval = DROP_INTERVALS[excursion % DROP_INTERVALS.length];
      awayDuration = interval - HOVER_DURATION;
      released = false;
    }
    hovering = cycleTime < HOVER_DURATION;
    bee.dataset.excursion = String(excursion);
    bee.dataset.dropInterval = String(interval);
    if (hovering) {
      hoverTime = cycleTime;
      const envelope = Math.sin(Math.PI * Math.min(1, hoverTime / HOVER_DURATION));
      point = { x: geometry.jar.x + Math.sin(hoverTime / 410) * 1.2 * envelope,
        y: geometry.jar.y + Math.sin(hoverTime / 340) * 2 * envelope };
      bee.dataset.phase = "hover";
      if (!released && hoverTime > 450) { released = true; dropTime = 0; }
    } else {
      awayTime = cycleTime - HOVER_DURATION;
      const sample = flight(awayTime / awayDuration);
      point = sample.point;
      bee.dataset.phase = sample.phase;
    }
    resizeTime = Math.min(350, resizeTime + delta);
    const resizeBlend = 1 - smooth(resizeTime / 350);
    point = safe({ x: point.x + resizeOffset.x * resizeBlend, y: point.y + resizeOffset.y * resizeBlend });
    const dx = point.x - previous.x, dy = point.y - previous.y;
    if (!hovering && Math.hypot(dx, dy) > .02) {
      const targetFacing = dx < 0 ? -1 : 1;
      const targetTilt = clamp(Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI * targetFacing, -32, 32);
      tilt += (targetTilt - tilt) * Math.min(1, delta / 200);
      facing += (targetFacing - facing) * Math.min(1, delta / 150);
    }
    bee.style.transform = `translate3d(${point.x - spriteSize / 2}px, ${point.y - spriteSize / 2}px, 0)`;
    direction.style.transform = `rotate(${tilt}deg) rotateY(${(1 - facing) * 90}deg)`;
    if (!bee.dataset.ready) bee.dataset.ready = "true";
    updateHoney(delta);
    frameId = requestAnimationFrame(tick);
  }

  function schedule() { last = null; if (!document.hidden && !destroyed) frameId = requestAnimationFrame(tick); }
  function visibility() { cancelAnimationFrame(frameId); schedule(); }
  const observer = new ResizeObserver(() => { needsMeasure = true; });
  observer.observe(main); observer.observe(logo); observer.observe(jar);
  const resized = () => { needsMeasure = true; };
  window.addEventListener("resize", resized);
  document.addEventListener("visibilitychange", visibility);
  schedule();
  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", resized);
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
