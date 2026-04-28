let images = [];
let currentImgIndex = 0;
let phase = 'reveal';
let phaseStartMs = 0;

const revealTime = 10000;  // 10 seconds
const revealStick = 5000;  // 5 seconds
const obscureTime = 10000; // 10 seconds
const minBrushSize = 6;
const maxBrushSize = 95;
const particleCount = 140;

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
  phaseStartMs = millis();
}

function draw() {
  let currentImage = images[currentImgIndex];
  if (!currentImage || currentImage.width === 0) return;

  let elapsed = millis() - phaseStartMs;
  let isFinalImage = currentImgIndex === images.length - 1;
  let progress = 0;

  if (phase === 'reveal') {
    progress = constrain(elapsed / revealTime, 0, 1);
    if (!isFinalImage && elapsed >= revealTime + revealStick) {
      phase = 'obscure';
      phaseStartMs = millis();
      progress = 0;
    }
  } else {
    progress = constrain(elapsed / obscureTime, 0, 1);
    if (elapsed >= obscureTime) {
      nextImage();
      phase = 'reveal';
      phaseStartMs = millis();
      progress = 0;
    }
  }

  let brushSize;
  if (phase === 'reveal') {
    // Reveal: large points become small.
    brushSize = lerp(maxBrushSize, minBrushSize, progress);
  } else {
    // Obscure: small points become large.
    brushSize = lerp(minBrushSize, maxBrushSize, progress);
  }

  // On final image, keep it in revealed state (small points) after reveal completes.
  if (isFinalImage && phase === 'reveal' && elapsed >= revealTime) {
    brushSize = minBrushSize;
  }

  for (let i = 0; i < particleCount; i++) {
    let x = random(width);
    let y = random(height);
    let col = currentImage.get(x, y);
    noStroke();
    fill(red(col), green(col), blue(col), 220);
    let s = random(brushSize * 0.8, brushSize * 1.2);
    ellipse(x, y, s, s);
  }
}

function nextImage() {
  currentImgIndex = (currentImgIndex + 1) % images.length;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let img of images) {
    if (img) img.resize(width, height);
  }
  background(255);
}
