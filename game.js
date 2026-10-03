const CONFIG = {
  playerImage: "assets/player.png",
  pigeonImage: "assets/pigeon.png",
  lifeImage: "assets/samgyeopsal.png",
  backgroundImage: "assets/background.png",

  maxLives: 3,
  difficultyInterval: 20,

  // 약 1.3배 상향된 난이도
  baseSpawnInterval: 500,
  minSpawnInterval: 85,
  baseBulletSpeed: 220,
  speedIncreasePerLevel: 42,
  maxBullets: 35,

  lifeItemChance: 0.10,
  lifeItemInterval: 9000,
  lifeItemDuration: 8000
};

const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

function updateLives() {
  const hearts = livesEl.querySelectorAll(".heart");
  hearts.forEach((heart, index) => {
    const isFull = index < lives;
    heart.src = isFull ? "assets/heart_full.png" : "assets/heart_empty.png";
    heart.alt = isFull ? "채운 하트" : "빈 하트";
  });
  livesEl.setAttribute("aria-label", `목숨 ${lives}개`);
}
const levelEl = document.getElementById("level");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const shareBtn = document.getElementById("shareBtn");
const finalScoreEl = document.getElementById("finalScore");

player.src = CONFIG.playerImage;

let running = false;
let score = 0;
let lives = CONFIG.maxLives;
let level = 1;
let startTime = 0;
let lastFrame = 0;
let lastSpawn = 0;
let lastLifeSpawn = 0;
let bullets = [];
let items = [];
let playerX = 0;
let playerY = 0;
let raf = 0;

function setPlayer(x, y) {
  const rect = game.getBoundingClientRect();
  const w = player.offsetWidth / 2;
  const h = player.offsetHeight / 2;
  playerX = Math.max(w, Math.min(rect.width - w, x));
  playerY = Math.max(h, Math.min(rect.height - h, y));
  player.style.left = `${playerX}px`;
  player.style.top = `${playerY}px`;
}

function centerPlayer() {
  setPlayer(game.clientWidth / 2, game.clientHeight * 0.82);
}

function resetState() {
  bullets.forEach(b => b.el.remove());
  items.forEach(i => i.el.remove());
  bullets = [];
  items = [];
  score = 0;
  lives = CONFIG.maxLives;
  level = 1;
  scoreEl.textContent = score;
  updateLives();
  levelEl.textContent = level;
  lastSpawn = 0;
  lastLifeSpawn = 0;
  centerPlayer();
}

function startGame() {
  cancelAnimationFrame(raf);
  resetState();
  running = true;
  startTime = performance.now();
  lastFrame = startTime;
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  raf = requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

function currentSpawnInterval() {
  return Math.max(
    CONFIG.minSpawnInterval,
    CONFIG.baseSpawnInterval * Math.pow(0.86, level - 1)
  );
}

function spawnPigeon() {
  if (bullets.length >= CONFIG.maxBullets) return;

  const rect = game.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const side = Math.floor(Math.random() * 4);

  let x, y;
  if (side === 0) { x = Math.random() * w; y = -30; }
  else if (side === 1) { x = w + 30; y = Math.random() * h; }
  else if (side === 2) { x = Math.random() * w; y = h + 30; }
  else { x = -30; y = Math.random() * h; }

  const targetX = Math.random() * w;
  const targetY = Math.random() * h;
  let dx = targetX - x;
  let dy = targetY - y;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  const speedMultiplier = 0.85 + Math.random() * 0.55;
  const speed = (CONFIG.baseBulletSpeed + (level - 1) * CONFIG.speedIncreasePerLevel) * speedMultiplier;

  const el = document.createElement("img");
  el.className = "bullet";
  el.src = CONFIG.pigeonImage;
  el.alt = "";
  el.draggable = false;
  game.appendChild(el);

  const bullet = {
    el, x, y,
    vx: dx * speed,
    vy: dy * speed,
    drift: (Math.random() - 0.5) * 25,
    rotation: Math.random() * 360
  };

  bullets.push(bullet);
}

function spawnLifeItem() {
  if (lives >= CONFIG.maxLives || items.length > 0) return;

  const w = game.clientWidth;
  const h = game.clientHeight;
  const el = document.createElement("img");
  el.className = "item";
  el.src = CONFIG.lifeImage;
  el.alt = "";
  el.draggable = false;
  game.appendChild(el);

  const item = {
    el,
    x: 30 + Math.random() * Math.max(1, w - 60),
    y: 40 + Math.random() * Math.max(1, h - 100),
    expires: performance.now() + CONFIG.lifeItemDuration
  };

  items.push(item);
}

function rectDistance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function updateBullets(dt) {
  const w = game.clientWidth;
  const h = game.clientHeight;

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    const driftX = -b.vy * 0.0004 * b.drift;
    const driftY = b.vx * 0.0004 * b.drift;
    b.x += (b.vx + driftX) * dt;
    b.y += (b.vy + driftY) * dt;
    b.rotation += 80 * dt;

    b.el.style.left = `${b.x}px`;
    b.el.style.top = `${b.y}px`;
    b.el.style.transform = `translate(-50%, -50%) rotate(${b.rotation}deg)`;

    if (rectDistance(b.x, b.y, playerX, playerY) < 39) {
      b.el.remove();
      bullets.splice(i, 1);
      lives--;
      updateLives();

      if (lives <= 0) {
        endGame();
        return;
      }
      continue;
    }

    if (b.x < -60 || b.x > w + 60 || b.y < -60 || b.y > h + 60) {
      b.el.remove();
      bullets.splice(i, 1);
      score++;
      scoreEl.textContent = score;
    }
  }
}

function updateItems(now) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.el.style.left = `${item.x}px`;
    item.el.style.top = `${item.y}px`;

    if (now > item.expires) {
      item.el.remove();
      items.splice(i, 1);
      continue;
    }

    if (rectDistance(item.x, item.y, playerX, playerY) < 43) {
      if (lives < CONFIG.maxLives) {
        lives++;
        updateLives();
      }
      item.el.remove();
      items.splice(i, 1);
    }
  }
}

function loop(now) {
  if (!running) return;

  const elapsed = now - startTime;
  const newLevel = Math.floor(elapsed / (CONFIG.difficultyInterval * 1000)) + 1;

  if (newLevel !== level) {
    level = newLevel;
    levelEl.textContent = level;
  }


  const dt = Math.min((now - lastFrame) / 1000, 0.035);
  lastFrame = now;

  const spawnInterval = currentSpawnInterval();
  if (now - lastSpawn >= spawnInterval) {
    const amount = level >= 3 && Math.random() < Math.min(0.45, 0.10 + level * 0.035) ? 2 : 1;
    for (let i = 0; i < amount; i++) spawnPigeon();
    lastSpawn = now;
  }

  if (now - lastLifeSpawn >= CONFIG.lifeItemInterval) {
    if (lives < CONFIG.maxLives && Math.random() < CONFIG.lifeItemChance * 2) {
      spawnLifeItem();
    }
    lastLifeSpawn = now;
  }

  updateBullets(dt);
  if (!running) return;
  updateItems(now);

  raf = requestAnimationFrame(loop);
}

function pointerPosition(e) {
  const rect = game.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

game.addEventListener("pointerdown", e => {
  if (!running) return;
  e.preventDefault();
  const p = pointerPosition(e);
  setPlayer(p.x, p.y);
});

game.addEventListener("pointermove", e => {
  if (!running) return;
  if (e.pointerType === "mouse" && e.buttons !== 1) return;
  e.preventDefault();
  const p = pointerPosition(e);
  setPlayer(p.x, p.y);
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

shareBtn.addEventListener("click", () => {
  const text = `'그것'을 ${score}마리 피했어요! 대단한데?`;
  const shareUrl = window.location.href;
  const twitterUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text) +
    "&url=" +
    encodeURIComponent(shareUrl);

  window.open(twitterUrl, "_blank", "noopener,noreferrer");
});

window.addEventListener("resize", () => {
  if (running) setPlayer(playerX, playerY);
  else centerPlayer();
});

centerPlayer();
