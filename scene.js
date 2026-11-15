// The first-screen scene: Claude's critter watches TV, zaps channels with the remote,
// and climbs on the TV to fix it when the signal breaks.
// createTvScene() returns an <svg> that animates itself while it is in the document.
const ORANGE = '#DA7756', RED = '#E5332A', INK = '#000';
const PX = 3; // one character pixel
const SVG_NS = 'http://www.w3.org/2000/svg';

// ---------- shared helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const hash = (n) => { const s = Math.sin(n * 127.1 + 3.7) * 43758.5453; return s - Math.floor(s); };
function mix(a, b, p) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(p, 0, 1))).toString(16).padStart(2, '0')).join('');
}

// ---------- character (12×8 px, as in the reference) ----------
const BODY = {
  mid: ['..OOOOOOOO..', '..OOOOOOOO..', 'OOOOOOOOOOOO', 'OOOOOOOOOOOO', '..OOOOOOOO..', '..OOOOOOOO..'],
  up:  ['O.OOOOOOOO.O', 'O.OOOOOOOO.O', 'OOOOOOOOOOOO', '..OOOOOOOO..', '..OOOOOOOO..', '..OOOOOOOO..'],
};
const LEGS = { idle: ['..O.O..O.O..', '..O.O..O.O..'], a: ['..O.O..O.O..', '..O....O....'], b: ['..O.O..O.O..', '....O....O..'], sit: ['..O.O..O.O..'] };
const pathCache = {};
function bodyPath(arms, legs) {
  const key = arms + legs;
  if (pathCache[key]) return pathCache[key];
  const rows = legs === 'sit' ? ['............', ...BODY[arms], ...LEGS.sit] : [...BODY[arms], ...LEGS[legs]];
  let d = '';
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'O') d += `M${x * PX} ${y * PX}h${PX}v${PX}h-${PX}z`; }));
  return (pathCache[key] = d);
}

function createTvScene() {
  const W = 260, H = 120, G = 106;
  const VX0 = 34, VW = 150; // visible part of the 260-wide drawing
  const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `${VX0} 0 ${VW} ${H}`);
    svg.setAttribute('class', 'tv-scene');
    svg.setAttribute('aria-hidden', 'true');

  // ---------- helpers ----------
  function mk(tag, attrs = {}, parent = svg) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ---------- scene ----------
  // The TV is drawn at full size and scaled down around a point on the floor.
  const TV_SCALE = 0.5, TV_PX = 70, TV_PY = G;
  const tvX = (x) => TV_PX + (x - TV_PX) * TV_SCALE;
  const tvY = (y) => TV_PY + (y - TV_PY) * TV_SCALE;
  const SCREEN_X = tvX(87), SCREEN_TOP = tvY(47), SCREEN_BOTTOM = tvY(91);
  const SEAT_X = 126, FADE_END = SEAT_X + 30; // the rays fade out right at the character
  const TV_STAND_X = tvX(60) - 18; // the character stands centred on top of the TV
  const TV_TOP_Y = tvY(41);
  const WALK_TO = tvX(87) + 6;     // where he stops in front of the TV before jumping

  const defs = mk('defs');
  // Rays: a cone that fades out by the time it reaches the character.
  const fade = mk('linearGradient', { id: 'fade', gradientUnits: 'userSpaceOnUse', x1: SCREEN_X, y1: 0, x2: FADE_END, y2: 0 }, defs);
  mk('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 1 }, fade);
  mk('stop', { offset: 0.55, 'stop-color': '#fff', 'stop-opacity': 0.45 }, fade);
  mk('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, fade);
  const mask = mk('mask', { id: 'rays', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
  const CONE = `M${SCREEN_X} ${SCREEN_TOP} L${FADE_END + 10} ${SCREEN_TOP - 30} L${FADE_END + 10} ${G + 4} L${SCREEN_X} ${SCREEN_BOTTOM}Z`;
  mk('path', { d: CONE, fill: 'url(#fade)' }, mask);

  mk('rect', { x: VX0 + 4, y: G, width: VW - 8, height: 2, rx: 1, fill: '#e8e8e8' });

  // Light and static both live strictly inside the rays mask.
  const raysGroup = mk('g', { mask: 'url(#rays)' });
  const light = mk('rect', { x: SCREEN_X, y: 0, width: 140, height: H, fill: '#fff', opacity: 0 }, raysGroup);
  const noise = mk('g', { opacity: 0 }, raysGroup);
  const dots = Array.from({ length: 90 }, () => mk('rect', { width: 2, height: 2, fill: '#fff' }, noise));
  const streaks = Array.from({ length: 4 }, () => mk('rect', { height: 1.5, fill: '#fff' }, noise));

  // TV, side view, screen facing right. Grouped so it can wobble.
  const tv = mk('g');
  mk('path', { d: 'M71 42 L44 46 Q34 48 34 58 L34 80 Q34 90 44 91 L71 96Z', fill: '#2c2c2c' }, tv);          // tapered back housing
  mk('path', { d: 'M71 42 L44 46 Q34 48 34 58 L34 60 Q36 52 46 50 L71 47Z', fill: '#3a3a3a' }, tv);          // top highlight
  [60, 66, 72, 78].forEach((y) => mk('rect', { x: 40, y, width: 14, height: 2, rx: 1, fill: '#1c1c1c' }, tv)); // vents
  mk('rect', { x: 69, y: 40, width: 17, height: 58, rx: 4, fill: '#161616' }, tv);                             // front bezel
  mk('rect', { x: 69, y: 40, width: 17, height: 3, rx: 1.5, fill: '#2e2e2e' }, tv);
  const edge = mk('rect', { x: 84.5, y: 47, width: 3, height: 44, rx: 1.5, fill: '#fff' }, tv); // glass
  const led = mk('rect', { x: 74, y: 93, width: 3, height: 2, rx: 1, fill: '#555' }, tv);
  // Stand: two splayed legs on little feet — both reach the floor.
  mk('path', { d: 'M50 90 L42 105', stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, tv);
  mk('path', { d: 'M72 96 L80 105', stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, tv);
  mk('rect', { x: 37, y: 104, width: 10, height: 3, rx: 1.5, fill: INK }, tv);
  mk('rect', { x: 75, y: 104, width: 10, height: 3, rx: 1.5, fill: INK }, tv);

  // Remote (held while sitting).
  const remote = mk('g');
  mk('rect', { x: 0, y: 0, width: 6, height: 12, rx: 2, fill: '#333' }, remote);
  mk('rect', { x: 1.5, y: 5, width: 3, height: 1.5, fill: '#777' }, remote);
  mk('rect', { x: 1.5, y: 8, width: 3, height: 1.5, fill: '#777' }, remote);
  const remoteLed = mk('rect', { x: 2, y: 1.5, width: 2, height: 2, fill: RED, opacity: 0 }, remote);

  // Character.
  const cg = mk('g');
  const cBody = mk('path', { fill: ORANGE }, cg);
  const cEyes = [mk('rect', { fill: INK, width: PX }, cg), mk('rect', { fill: INK, width: PX }, cg)];
  function drawCritter({ x, y, arms = 'mid', legs = 'sit', eye = [0, 0], lid = 0, flip = false, sy = 1, fill = ORANGE }) {
    cBody.setAttribute('d', bodyPath(arms, legs));
    cBody.setAttribute('fill', fill);
    const top = legs === 'sit' ? 1 : 0, dx = flip ? -eye[0] : eye[0];
    [3, 8].forEach((col, i) => {
      const h = PX * (1 - lid * 0.8);
      cEyes[i].setAttribute('x', (col + dx) * PX);
      cEyes[i].setAttribute('y', (1 + top + eye[1]) * PX + (PX - h));
      cEyes[i].setAttribute('height', h);
    });
    const w = 12 * PX, hh = 8 * PX;
    let tf = `translate(${x} ${y})`;
    if (sy !== 1) tf += ` translate(0 ${hh * (1 - sy)}) scale(1 ${sy})`;
    if (flip) tf += ` translate(${w} 0) scale(-1 1)`;
    cg.setAttribute('transform', tf);
  }
  const mark = mk('text', { 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: RED, opacity: 0 });
  mark.textContent = '?';

  // ---------- state ----------
  const PALETTE = ['#7fb2ff', '#ffa47a', '#7fdc9c', '#ffd34d', '#b98cff', '#5fd0e6'];
  const s = { channel: 0, lastZap: -1e9, nextZap: 3200, breakAt: null, nextBreak: 7000, mouse: null };

  function zap(t) { s.channel++; s.lastZap = t; s.nextZap = t + 2600 + hash(s.channel) * 1800; }

  svg.addEventListener('click', () => { if (s.breakAt == null) zap(performance.now()); });
  svg.addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect();
    s.mouse = { x: VX0 + (e.clientX - r.left) * VW / r.width, y: (e.clientY - r.top) * H / r.height, t: performance.now() };
  });
  svg.addEventListener('mouseleave', () => { s.mouse = null; });

  function randomizeNoise(t) {
    const f = Math.floor(t / 45);
    dots.forEach((d, i) => {
      d.setAttribute('x', SCREEN_X + hash(i * 7.3 + f) * (FADE_END - SCREEN_X));
      d.setAttribute('y', 20 + hash(i * 3.1 + f * 1.7) * (G - 16));
      d.setAttribute('fill', hash(i + f * 0.37) > 0.5 ? '#fff' : '#9a9a9a');
    });
    streaks.forEach((r, i) => {
      r.setAttribute('x', SCREEN_X + hash(i * 11 + f) * 60);
      r.setAttribute('y', 50 + hash(i * 5 + f * 2.3) * 52);
      r.setAttribute('width', 20 + hash(i * 17 + f) * 60);
      r.setAttribute('opacity', hash(i + f) > 0.4 ? 0.8 : 0);
    });
  }

  // Breakdown choreography (ms from the moment it breaks).
  const T = { notice: 600, walk: 1600, jumpUp: 2100, fixed: 2850, bounce: 3100, jumpDown: 3600, back: 4700 };

  function frame(t) {
    let x = SEAT_X, y = G - 24, legs = 'sit', arms = 'mid', flip = true, eye = [-1, 0], sy = 1, lid = 0;
    let broken = false, tvRot = 0, holding = true, question = 0;

    if (s.breakAt == null && t > s.nextBreak) s.breakAt = t;
    if (s.breakAt == null && t > s.nextZap) zap(t);

    if (s.breakAt != null) {
      const p = t - s.breakAt;
      broken = p < T.fixed;
      holding = false;
      if (p < T.notice) {
        legs = 'idle'; question = 1; eye = [-1, 0];
      } else if (p < T.walk) {
        const q = (p - T.notice) / (T.walk - T.notice);
        x = lerp(SEAT_X, WALK_TO, ease(q)); legs = Math.floor(t / 110) % 2 ? 'a' : 'b';
      } else if (p < T.jumpUp) {
        const q = (p - T.walk) / (T.jumpUp - T.walk);
        x = lerp(WALK_TO, TV_STAND_X, q); y = lerp(G - 24, TV_TOP_Y - 24, q) - Math.sin(q * Math.PI) * 22;
        legs = 'idle'; arms = 'up';
      } else if (p < T.bounce) {
        const q = (p - T.jumpUp) / (T.bounce - T.jumpUp), hop = (q * 3) % 1, n = Math.floor(q * 3);
        x = TV_STAND_X; y = TV_TOP_Y - 24 - Math.sin(hop * Math.PI) * 9; legs = 'idle';
        arms = hop > 0.2 && hop < 0.8 ? 'up' : 'mid'; eye = [0, 1];
        if (hop < 0.14) sy = 0.82;
        if (hop < 0.3) tvRot = (n % 2 ? 1.6 : -1.6) * (1 - hop / 0.3);
      } else if (p < T.jumpDown) {
        const q = (p - T.bounce) / (T.jumpDown - T.bounce);
        x = lerp(TV_STAND_X, WALK_TO, q); y = lerp(TV_TOP_Y - 24, G - 24, q) - Math.sin(q * Math.PI) * 14;
        legs = 'idle'; arms = 'up'; flip = false; eye = [1, 0];
      } else if (p < T.back) {
        const q = (p - T.jumpDown) / (T.back - T.jumpDown);
        x = lerp(WALK_TO, SEAT_X, ease(q)); legs = Math.floor(t / 110) % 2 ? 'a' : 'b'; flip = false; eye = [1, 0];
      } else {
        s.breakAt = null; s.nextBreak = t + 10000 + hash(t) * 6000; zap(t);
      }
      if (p >= T.fixed && p < T.fixed + 90) { s.lastZap = t; s.channel++; }
    } else {
      // Sitting and watching; the cursor near him draws a glance.
      const m = s.mouse && t - s.mouse.t < 1500 ? s.mouse : null;
      if (m && Math.hypot(m.x - (SEAT_X + 18), m.y - (G - 12)) < 70) {
        const dx = m.x - (SEAT_X + 18), dy = m.y - (G - 12);
        eye = [Math.abs(dx) > 14 ? Math.sign(dx) : 0, dy > 12 ? 1 : 0];
      }
      lid = (t % 3300) < 120 ? 1 : 0;
    }

    // Light.
    let color, k;
    if (broken) {
      color = '#d8d8d8'; k = 0.35 + hash(Math.floor(t / 40)) * 0.5;
      randomizeNoise(t);
    } else {
      color = PALETTE[Math.floor(hash(s.channel * 31 + 5) * PALETTE.length)];
      k = clamp(0.62 + 0.18 * Math.sin(t / 130) + 0.12 * Math.sin(t / 41 + s.channel), 0.3, 1);
      if (t - s.lastZap < 90) k = 1;
    }
    light.setAttribute('fill', color);
    light.setAttribute('opacity', (broken ? 0.32 : 0.5) * k);
    noise.setAttribute('opacity', broken ? 1 : 0);
    edge.setAttribute('fill', broken ? (hash(Math.floor(t / 60)) > 0.5 ? '#fff' : '#888') : color);
    led.setAttribute('fill', broken ? (Math.floor(t / 250) % 2 ? RED : '#555') : '#555');
    tv.setAttribute('transform', `rotate(${tvRot} ${tvX(60)} ${G}) translate(${TV_PX} ${TV_PY}) scale(${TV_SCALE}) translate(${-TV_PX} ${-TV_PY})`);

    drawCritter({ x, y, legs, arms, flip, eye, sy, lid }); // always the same colour, never tinted by the TV

    remote.setAttribute('opacity', holding ? 1 : 0);
    remote.setAttribute('transform', `translate(${SEAT_X - 3} ${G - 22 + (t - s.lastZap < 150 ? 1 : 0)}) rotate(-20 3 12)`);
    remoteLed.setAttribute('opacity', holding && t - s.lastZap < 160 ? 1 : 0);

    mark.setAttribute('x', x + 18); mark.setAttribute('y', y - 6);
    mark.setAttribute('opacity', question);
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Only animate while the scene is on screen (it is detached once the chat starts).
  function loop(now) { if (svg.isConnected) frame(reduce ? 2000 : now); if (!reduce) requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  frame(reduce ? 2000 : performance.now());
  return svg;
}

// The "not on a YouTube video" scene: the critter stands in the middle with a question
// mark over its head and follows the mouse anywhere in the popup; bring the cursor
// close and it hops. createIdleScene() returns an <svg> that animates while attached.
function createIdleScene() {
  const W = 120, H = 84, G = 74;
  const CX = W / 2 - 6 * PX, CY = G - 8 * PX; // character's top-left when standing
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'idle-scene');
  svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, attrs = {}, parent = svg) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };

  mk('rect', { x: 30, y: G, width: 60, height: 2, rx: 1, fill: '#e8e8e8' });

  // Pixel question mark, in the accent red.
  const Q = ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.....', '..X..'];
  const QP = 2.5;
  let qd = '';
  Q.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'X') qd += `M${x * QP} ${y * QP}h${QP}v${QP}h-${QP}z`; }));
  const qmark = mk('path', { d: qd, fill: RED });

  const cg = mk('g');
  const body = mk('path', { fill: ORANGE }, cg);
  const eyes = [mk('rect', { fill: INK, width: PX }, cg), mk('rect', { fill: INK, width: PX }, cg)];

  // Follow the mouse anywhere in the popup, not just over the drawing.
  const s = { mouse: null };
  const onMove = (e) => {
    if (!svg.isConnected) return;
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    s.mouse = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height, t: performance.now() };
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseleave', () => { s.mouse = null; });

  let hop = 0;
  function frame(t) {
    const m = s.mouse && t - s.mouse.t < 2500 ? s.mouse : null;
    const cx = W / 2, cy = CY + 6;
    let eye;
    if (m) {
      const dx = m.x - cx, dy = m.y - cy;
      eye = [Math.abs(dx) > 10 ? Math.sign(dx) : 0, dy > 14 ? 1 : dy < -16 ? -1 : 0];
    } else {
      // Nobody around: look about slowly.
      const look = Math.floor(t / 1400) % 4;
      eye = [[-1, 0], [0, 0], [1, 0], [0, -1]][look];
    }
    const near = m && Math.hypot(m.x - cx, m.y - (CY + 12)) < 34;
    hop = lerp(hop, near ? 1 : 0, 0.15);
    const jump = hop > 0.3 ? Math.abs(Math.sin(t / 120)) * 7 * hop : 0;
    const blink = !near && (t % 3200) < 120;

    body.setAttribute('d', bodyPath(near ? 'up' : 'mid', jump > 2 ? (Math.floor(t / 120) % 2 ? 'a' : 'b') : 'idle'));
    [3, 8].forEach((col, i) => {
      const h = blink ? PX * 0.25 : PX;
      eyes[i].setAttribute('x', (col + eye[0]) * PX);
      eyes[i].setAttribute('y', (1 + eye[1]) * PX + (PX - h));
      eyes[i].setAttribute('height', h);
    });
    cg.setAttribute('transform', `translate(${CX} ${CY - jump})`);
    const bob = Math.sin(t / 380) * 2;
    qmark.setAttribute('transform', `translate(${W / 2 - 2.5 * QP} ${CY - 24 - jump + bob})`);
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now) { if (svg.isConnected) frame(reduce ? 0 : now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  frame(0);
  return svg;
}

// The YouTube Shorts scene: the critter laughs at the idea of watching Shorts.
// Eyes squeezed into ^ ^, arms up, shaking in bursts while red "HA" letters float away.
// createLaughScene() returns an <svg> that animates while attached.
function createLaughScene() {
  const W = 120, H = 84, G = 74;
  const CX = W / 2 - 6 * PX, CY = G - 8 * PX;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'idle-scene');
  svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, attrs = {}, parent = svg) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };

  mk('rect', { x: 30, y: G, width: 60, height: 2, rx: 1, fill: '#e8e8e8' });

  const cg = mk('g');
  const body = mk('path', { fill: ORANGE }, cg);
  // A ^ made of half pixels, one per eye.
  const HP = PX / 2;
  const caret = (x0, y0) => `M${x0} ${y0 + HP}h${HP}v${HP}h-${HP}z M${x0 + HP} ${y0}h${HP}v${HP}h-${HP}z M${x0 + 2 * HP} ${y0 + HP}h${HP}v${HP}h-${HP}z`;
  const eyesOpen = [mk('rect', { fill: INK, width: PX, height: PX }, cg), mk('rect', { fill: INK, width: PX, height: PX }, cg)];
  const eyesShut = mk('path', { fill: INK, d: caret(2.5 * PX, PX) + caret(7.5 * PX, PX) }, cg);
  [3, 8].forEach((col, i) => { eyesOpen[i].setAttribute('x', col * PX); eyesOpen[i].setAttribute('y', PX); });

  // Floating "HA"s, reused from a small pool.
  const pool = Array.from({ length: 6 }, () => {
    const e = mk('text', { 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 9, 'font-weight': 700, 'text-anchor': 'middle', fill: RED, opacity: 0 });
    e.textContent = 'HA';
    return { e, born: -1e9, x: 0, side: 1 };
  });
  let next = 0, nextHa = 0;

  const BURST = 1700, PAUSE = 900, CYCLE = BURST + PAUSE;
  function frame(t) {
    const phase = t % CYCLE, laughing = phase < BURST;
    const shake = laughing ? Math.abs(Math.sin(t / 70)) * 3 : 0;
    const tilt = laughing ? Math.sin(t / 140) * 6 : 0;
    const squash = laughing && Math.sin(t / 70) > 0.6 ? 0.92 : 1;
    const arms = laughing ? (Math.floor(t / 140) % 2 ? 'up' : 'mid') : 'mid';

    body.setAttribute('d', bodyPath(arms, 'idle'));
    eyesShut.setAttribute('opacity', laughing ? 1 : 0);
    eyesOpen.forEach((e) => e.setAttribute('opacity', laughing ? 0 : 1));
    const w = 12 * PX, h = 8 * PX;
    cg.setAttribute('transform',
      `translate(${CX} ${CY - shake}) rotate(${tilt} ${w / 2} ${h}) translate(0 ${h * (1 - squash)}) scale(1 ${squash})`);

    if (laughing && t > nextHa) {
      const p = pool[next++ % pool.length];
      p.born = t;
      p.side = next % 2 ? 1 : -1;
      p.x = W / 2 + p.side * (14 + hash(next) * 10);
      nextHa = t + 320;
    }
    for (const p of pool) {
      const age = (t - p.born) / 1100;
      if (age < 0 || age > 1) { p.e.setAttribute('opacity', 0); continue; }
      const y = CY + 2 - age * 26;
      const x = p.x + p.side * age * 8;
      p.e.setAttribute('opacity', (1 - age).toFixed(2));
      p.e.setAttribute('transform', `translate(${x} ${y}) rotate(${p.side * 12})`);
    }
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now) { if (svg.isConnected) frame(reduce ? 200 : now); if (!reduce) requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  frame(200);
  return svg;
}
