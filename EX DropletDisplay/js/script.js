(function () {
  "use strict";

  const CANVAS_W = 400;
  const CANVAS_H = 600;
  const GRID_COLS = 160;
  const GRID_ROWS = 20;
  const CELL = 15;
  const DISPLAY_W = GRID_COLS * CELL;
  const DISPLAY_H = GRID_ROWS * CELL;
  const ORIGIN_X = (CANVAS_W - DISPLAY_W) / 2;
  const ORIGIN_Y = 32;
  /** Все сопла на одной горизонтали (центр верхней ячейки сетки). */
  const NOZZLE_Y = ORIGIN_Y + CELL / 2;
  /** Базовое ускорение, px/s² (масштаб «как 9.8», но в пикселях экрана). */
  const GRAVITY_PX_S2 = 98;
  const DROP_RADIUS = 2.8;
  const ZONE_CENTER_Y = CANVAS_H / 2;

  class Droplet {
    constructor(x, y0, releaseMs, gPxS2) {
      this.x = x;
      this.y0 = y0;
      this.releaseMs = releaseMs;
      this.gPxS2 = gPxS2;
      this.y = y0;
      this.active = true;
    }

    /** y = y₀ + ½ g (t − τ)²; до τ капля в сопле, не падает. */
    updateKinematic(nowMs) {
      if (!this.active) return;
      const t = (nowMs - this.releaseMs) / 1000;
      if (t < 0) {
        this.y = this.y0;
        return;
      }
      this.y = this.y0 + 0.5 * this.gPxS2 * t * t;
      if (this.y > CANVAS_H + DROP_RADIUS * 2) {
        this.active = false;
      }
    }

    timeSinceRelease(nowMs) {
      return (nowMs - this.releaseMs) / 1000;
    }
  }

  function getOpacity(y, zoneCenter, zoneHalfHeight, fadeOutside, strobeOn) {
    if (!strobeOn) return 1;
    const d = Math.abs(y - zoneCenter);
    if (d < zoneHalfHeight) return 1;
    return fadeOutside;
  }

  /**
   * Растеризация текста в бинарную матрицу [row][col] через offscreen canvas.
   */
  function textToMatrix(text, cols, rows) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      matrix[r] = new Array(cols).fill(false);
    }
    const t = (text || "").trim() || "?";
    const off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, cols, rows);
    octx.fillStyle = "#000000";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    const fontSize = Math.max(6, Math.floor(Math.min(cols, rows) * 0.72));
    octx.font = `bold ${fontSize}px "Segoe UI", system-ui, sans-serif`;
    octx.fillText(t, cols / 2, rows / 2 + 0.5);
    const data = octx.getImageData(0, 0, cols, rows).data;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        matrix[r][c] = lum < 200;
      }
    }
    return matrix;
  }

  class DropDisplay {
    constructor(canvas, previewCanvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.previewCanvas = previewCanvas;
      this.pctx = previewCanvas ? previewCanvas.getContext("2d") : null;
      this.droplets = [];
      this.matrix = textToMatrix("HI", GRID_COLS, GRID_ROWS);
      this.gravityScale = 1;
      this.fadeOutside = 0.2;
      this.zoneHeight = 56;
      this.strobeOn = true;
      this.trails = false;
      this.rafId = 0;
      /** Задержка между соседними строками растра (шаг «слоёв» снизу вверх), мс. */
      this.dropSpacingMs = 48;
      /** Пауза после исчезновения капель кадра до следующего полного вылета. */
      this.framePauseMs = 500;
      this.waitingRespawn = false;
      this.respawnAt = 0;
      /** Первый кадр после сброса вылетает сразу в следующем tick. */
      this.pendingFirstFrame = true;
    }

    setMatrixFromText(text) {
      this.matrix = textToMatrix(text, GRID_COLS, GRID_ROWS);
      this.drawPreview(text);
    }

    drawPreview(text) {
      if (!this.pctx) return;
      const pw = this.previewCanvas.width;
      const ph = this.previewCanvas.height;
      this.pctx.fillStyle = "#0d1117";
      this.pctx.fillRect(0, 0, pw, ph);
      this.pctx.fillStyle = "#58a6ff";
      this.pctx.textAlign = "center";
      this.pctx.textBaseline = "middle";
      this.pctx.font = '600 28px "Segoe UI", system-ui, sans-serif';
      this.pctx.fillText((text || "").trim() || "?", pw / 2, ph / 2);
    }

    /**
     * Кадр: линия сопел. Скан по строкам растра снизу вверх (r убывает): на строке r все активные
     * столбцы вылетают одновременно. Тогда перемычка «H» не уходит в первый такт вместе с ножками (иначе U).
     */
    spawnFullFrame(nowMs) {
      this.waitingRespawn = false;
      const gPxS2 = GRAVITY_PX_S2 * this.gravityScale;
      const m = this.matrix;
      const dt = this.dropSpacingMs;
      let step = 0;
      for (let r = GRID_ROWS - 1; r >= 0; r--) {
        let any = false;
        for (let c = 0; c < GRID_COLS; c++) {
          if (!m[r][c]) continue;
          any = true;
          const x = ORIGIN_X + c * CELL + CELL / 2;
          const releaseMs = nowMs + step * dt;
          this.droplets.push(new Droplet(x, NOZZLE_Y, releaseMs, gPxS2));
        }
        if (any) step += 1;
      }
    }

    resetSimulation() {
      this.droplets = [];
      this.waitingRespawn = false;
      this.respawnAt = 0;
      this.pendingFirstFrame = true;
    }

    allInactive() {
      return this.droplets.length === 0 || this.droplets.every((d) => !d.active);
    }

    /** Две последние по времени вылета капли в одном столбце (одинаковый x), обе уже в полёте. */
    findColumnPairHud(nowMs) {
      const byX = new Map();
      for (const d of this.droplets) {
        if (!d.active || d.timeSinceRelease(nowMs) < 0) continue;
        const key = d.x.toFixed(2);
        const arr = byX.get(key) || [];
        arr.push(d);
        byX.set(key, arr);
      }
      let best = null;
      for (const arr of byX.values()) {
        if (arr.length < 2) continue;
        arr.sort((a, b) => a.releaseMs - b.releaseMs);
        const a = arr[arr.length - 2];
        const b = arr[arr.length - 1];
        const dtSec = (b.releaseMs - a.releaseMs) / 1000;
        if (dtSec <= 0) continue;
        const t1 = (nowMs - a.releaseMs) / 1000;
        const t2 = (nowMs - b.releaseMs) / 1000;
        const sep = a.y - b.y;
        const g = (a.gPxS2 + b.gPxS2) / 2;
        const tBar = (t1 + t2) / 2;
        const dominant = g * dtSec * tBar;
        if (!best || sep > best.sep) best = { sep, dtSec, t1, t2, tBar, dominant, g };
      }
      return best;
    }

    tick(ts) {
      if (this.trails) {
        this.ctx.fillStyle = "rgba(22, 27, 34, 0.12)";
        this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      } else {
        this.ctx.fillStyle = "#161b22";
        this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      const zh = this.zoneHeight;
      const zHalf = zh / 2;
      if (this.strobeOn) {
        this.ctx.fillStyle = "rgba(240, 136, 62, 0.12)";
        this.ctx.fillRect(0, ZONE_CENTER_Y - zHalf, CANVAS_W, zh);
        this.ctx.strokeStyle = "rgba(240, 136, 62, 0.45)";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, ZONE_CENTER_Y - zHalf);
        this.ctx.lineTo(CANVAS_W, ZONE_CENTER_Y - zHalf);
        this.ctx.moveTo(0, ZONE_CENTER_Y + zHalf);
        this.ctx.lineTo(CANVAS_W, ZONE_CENTER_Y + zHalf);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      this.ctx.strokeStyle = "#30363d";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(ORIGIN_X - 0.5, ORIGIN_Y - 0.5, DISPLAY_W + 1, DISPLAY_H + 1);
      this.ctx.strokeStyle = "#484f58";
      this.ctx.beginPath();
      this.ctx.moveTo(ORIGIN_X, NOZZLE_Y);
      this.ctx.lineTo(ORIGIN_X + DISPLAY_W, NOZZLE_Y);
      this.ctx.stroke();

      const now = ts || performance.now();

      for (const d of this.droplets) {
        d.updateKinematic(now);
      }
      this.droplets = this.droplets.filter((d) => d.active);

      if (this.pendingFirstFrame) {
        this.spawnFullFrame(now);
        this.pendingFirstFrame = false;
      } else if (this.allInactive()) {
        if (!this.waitingRespawn) {
          this.waitingRespawn = true;
          this.respawnAt = now + this.framePauseMs;
        } else if (now >= this.respawnAt) {
          this.spawnFullFrame(now);
        }
      }

      const hud = document.getElementById("physicsHud");
      if (hud) {
        const pair = this.findColumnPairHud(now);
        if (pair) {
          const exact = 0.5 * pair.g * (pair.t1 * pair.t1 - pair.t2 * pair.t2);
          hud.innerHTML =
            `Один столбец, два соседних такта по строкам — <code>Δy ≈ g·Δτ·t̄</code> ≈ ${pair.dominant.toFixed(1)} px, ` +
            `точно <code>½g(t₁²−t₂²)</code> = ${exact.toFixed(1)} px (на экране ${pair.sep.toFixed(1)} px). ` +
            `У сопла цепочка «сплющена»; ниже разрыв растёт. Зона строба — окно читаемости.`;
        } else if (this.droplets.length > 0) {
          const flying = this.droplets.filter((d) => d.timeSinceRelease(now) >= 0);
          const ref = flying[0] || this.droplets[0];
          const t = ref.timeSinceRelease(now);
          if (t >= 0) {
            const g = ref.gPxS2;
            hud.innerHTML =
              `Кадр идёт: <code>Δτ</code> = ${this.dropSpacingMs} мс между строками растра; ` +
              `пример <code>t</code> с вылета = ${t.toFixed(2)} с, <code>g</code> = ${Math.round(g)} px/s².`;
          } else {
            hud.innerHTML = `Старт кадра: снизу вверх по строкам, шаг <code>Δτ</code> = ${this.dropSpacingMs} мс.`;
          }
        } else {
          const wait = this.waitingRespawn && now < this.respawnAt;
          hud.innerHTML = wait
            ? `Пауза до следующего кадра… (~${Math.max(0, Math.ceil(this.respawnAt - now))} мс)`
            : `Линия сопел: строка растра — один такт, вся перемычка разом; пауза между кадрами.`;
        }
      }

      for (const d of this.droplets) {
        if (!d.active) continue;
        if (d.timeSinceRelease(now) < 0) continue;
        const alpha = getOpacity(
          d.y,
          ZONE_CENTER_Y,
          zHalf,
          this.fadeOutside,
          this.strobeOn
        );
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y, DROP_RADIUS, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
        this.ctx.fill();
        if (alpha > 0.5) {
          this.ctx.fillStyle = `rgba(200, 230, 255, ${Math.min(1, alpha * 0.55)})`;
          this.ctx.beginPath();
          this.ctx.arc(d.x - 0.6, d.y - 0.6, DROP_RADIUS * 0.35, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.rafId = requestAnimationFrame((t) => this.tick(t));
    }

    start() {
      this.resetSimulation();
      if (!this.rafId) {
        this.rafId = requestAnimationFrame((t) => this.tick(t));
      }
    }
  }

  const canvas = document.getElementById("canvas");
  const previewCanvas = document.getElementById("previewCanvas");
  const textInput = document.getElementById("textInput");
  const updateBtn = document.getElementById("updateBtn");
  const gravitySlider = document.getElementById("gravitySlider");
  const fadeSlider = document.getElementById("fadeSlider");
  const zoneHeightSlider = document.getElementById("zoneHeightSlider");
  const dropSpacingSlider = document.getElementById("dropSpacingSlider");
  const framePauseSlider = document.getElementById("framePauseSlider");
  const strobeCheck = document.getElementById("strobeCheck");
  const trailsCheck = document.getElementById("trailsCheck");
  const gravityValue = document.getElementById("gravityValue");
  const fadeValue = document.getElementById("fadeValue");
  const zoneHeightValue = document.getElementById("zoneHeightValue");
  const framePauseValue = document.getElementById("framePauseValue");
  const dropSpacingValue = document.getElementById("dropSpacingValue");

  const display = new DropDisplay(canvas, previewCanvas);
  display.setMatrixFromText(textInput.value);
  display.start();

  function syncLabels() {
    gravityValue.textContent = Number(gravitySlider.value).toFixed(2);
    fadeValue.textContent = Number(fadeSlider.value).toFixed(2);
    zoneHeightValue.textContent = zoneHeightSlider.value;
    framePauseValue.textContent = framePauseSlider.value;
    dropSpacingValue.textContent = dropSpacingSlider.value;
  }

  syncLabels();

  function applyAndRespawn() {
    display.setMatrixFromText(textInput.value);
    display.resetSimulation();
  }

  updateBtn.addEventListener("click", applyAndRespawn);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyAndRespawn();
  });

  gravitySlider.addEventListener("input", () => {
    display.gravityScale = Number(gravitySlider.value);
    syncLabels();
  });

  fadeSlider.addEventListener("input", () => {
    display.fadeOutside = Number(fadeSlider.value);
    syncLabels();
  });

  zoneHeightSlider.addEventListener("input", () => {
    display.zoneHeight = Number(zoneHeightSlider.value);
    syncLabels();
  });

  framePauseSlider.addEventListener("input", () => {
    display.framePauseMs = Number(framePauseSlider.value);
    syncLabels();
  });

  dropSpacingSlider.addEventListener("input", () => {
    display.dropSpacingMs = Number(dropSpacingSlider.value);
    syncLabels();
  });

  strobeCheck.addEventListener("change", () => {
    display.strobeOn = strobeCheck.checked;
  });

  trailsCheck.addEventListener("change", () => {
    display.trails = trailsCheck.checked;
  });

  display.gravityScale = Number(gravitySlider.value);
  display.fadeOutside = Number(fadeSlider.value);
  display.zoneHeight = Number(zoneHeightSlider.value);
  display.framePauseMs = Number(framePauseSlider.value);
  display.dropSpacingMs = Number(dropSpacingSlider.value);
  display.strobeOn = strobeCheck.checked;
  display.trails = trailsCheck.checked;
})();
