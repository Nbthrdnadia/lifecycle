let images = [];

// Timeline: 80 years from creation, split evenly across images.
const CREATION_MS = new Date(2026, 4, 4).getTime(); // 4 May 2026 (local)
const SPAN_YEARS = 80;
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const TOTAL_MS = SPAN_YEARS * MS_PER_YEAR;

// Right after each era starts (by the calendar), large dots shrink to small over this wall-clock window only.
// Anyone opening later in the same era already sees small dots (full image).
const REVEAL_DURATION_MS = 45 * 1000; // 45 seconds — tune for “how fast” the piece resolves visually

// Brush radii tuned for this reference canvas; they scale when the sketch is resized.
const REF_CANVAS_W = 500;
const REF_CANVAS_H = 288;
const BASE_MIN_BRUSH = 4;
const BASE_MAX_BRUSH = 6;

const particleCount = 140;

function brushSizeScale() {
  return Math.min(width / REF_CANVAS_W, height / REF_CANVAS_H);
}

// Temporary: set false when you no longer need size readout while resizing.
const SHOW_WINDOW_SIZE_OVERLAY = false;

function preload() {
  images.push(loadImage('assets/bench.jpg'));       // 0 (empty)
  images.push(loadImage('assets/couple.jpg'));      // 1 (people)
  images.push(loadImage('assets/married.jpg'));     // 2
  images.push(loadImage('assets/small_kid.jpg'));   // 3
  images.push(loadImage('assets/teenage_guy.jpg')); // 4
  images.push(loadImage('assets/guy_married.png')); // 5
  images.push(loadImage('assets/both_old.png'));    // 6
  images.push(loadImage('assets/woman_gone.png'));  // 7
  images.push(loadImage('assets/both_gone.jpg'));   // 8
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let img of images) {
    if (img) img.resize(width, height);
  }
  background(255);
}

function timelineState() {
  const n = images.length;
  const now = Date.now();
  const segmentMs = TOTAL_MS / n;

  if (now < CREATION_MS) {
    return { index: 0, revealProgress: 0 };
  }

  const elapsed = now - CREATION_MS;
  if (elapsed >= TOTAL_MS) {
    return { index: n - 1, revealProgress: 1 };
  }

  const index = Math.min(Math.floor(elapsed / segmentMs), n - 1);
  const segmentStart = CREATION_MS + index * segmentMs;
  const localElapsed = now - segmentStart;
  const revealProgress = constrain(localElapsed / REVEAL_DURATION_MS, 0, 1);

  return { index, revealProgress };
}

function draw() {
  const { index: currentImgIndex, revealProgress } = timelineState();
  let currentImage = images[currentImgIndex];
  if (!currentImage || currentImage.width === 0) return;

  const scale = brushSizeScale();
  const minBrush = BASE_MIN_BRUSH * scale;
  const maxBrush = BASE_MAX_BRUSH * scale;
  let brushSize = lerp(maxBrush, minBrush, revealProgress);

  for (let i = 0; i < particleCount; i++) {
    let x = random(width);
    let y = random(height);
    let col = currentImage.get(x, y);
    noStroke();
    fill(red(col), green(col), blue(col), 100);
    let s = random(brushSize * 0.8, brushSize * 1.2);
    ellipse(x, y, s, s);
  }

  if (SHOW_WINDOW_SIZE_OVERLAY) {
    drawWindowSizeOverlay();
  }
}

function drawWindowSizeOverlay() {
  push();
  const pad = 10;
  const lineH = 18;
  const iw = window.innerWidth ?? windowWidth;
  const ih = window.innerHeight ?? windowHeight;
  const lines = [
    `canvas (sketch): ${width} × ${height}`,
    `window (inner): ${iw} × ${ih}`,
  ];
  textAlign(LEFT, TOP);
  textSize(14);
  textLeading(lineH);
  const tw = Math.max(...lines.map((l) => textWidth(l)), 120) + pad * 2;
  const th = pad * 2 + lineH * lines.length;
  noStroke();
  fill(0, 165);
  rect(pad, pad, tw, th, 6);
  fill(255);
  text(lines.join('\n'), pad + pad, pad + pad);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let img of images) {
    if (img) img.resize(width, height);
  }
  background(255);
}
