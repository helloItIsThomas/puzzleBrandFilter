import "p5.js-svg";

import gsap from "gsap";
import * as PIXI from "pixi.js";
import { Application, Ticker } from "pixi.js";
import { Recorder, RecorderStatus, Encoders } from "canvas-record";

import { sv } from "./utils/variables.js";
import { recalculateGrid } from "./utils/eventHandlers.js";
import { loadSetupImages, updateSvgIcons } from "./utils/loadImages";
import { draw } from "./rendering/draw.js";
import { createInput } from "./utils/input";
import { initializeLoadIcon, showLoadIcon } from "./utils/icons.js";
import { downloadCanvas } from "./utils/utils.js";
import { stopRecording } from "./utils/recording";
import { createStatsGUI } from "./utils/stats.js";

let resizeAppToMe = document.getElementById("bodyRight");

export default function (p) {
  sv.p = p;
}

async function mySetup() {
  sv.pApp = new Application();
  await sv.pApp.init({
    background: "#ffffff",
    clearBeforeRender: true,
    preserveDrawingBuffer: true,
    autoDensity: true,
    resolution: 3,
    antialias: true,
    // canvas: targetCanvas,
    resizeTo: resizeAppToMe,
    preference: "webgl",
  });
  document.getElementById("bodyRight").appendChild(sv.pApp.canvas);

  sv.ticker = new Ticker();
  sv.ticker.autoStart = false;
  sv.ticker.add(() => {
    sv.clock += sv.speed * 0.5;
    render();
  });
  sv.ticker.stop();

  createStatsGUI();
  // sv.p.noCanvas();

  initializeLoadIcon();
  createInput();
  showLoadIcon();

  await loadSetupImages();

  recalculateGrid();
  updateSvgIcons();

  // updateClock();
  sv.setupDone = true;
  sv.ticker.start();
}

window.addEventListener("load", () => {
  mySetup();
});

export const tick = async () => {
  sv.frame++;
  render();

  sv.clock = sv.frame * sv.speed;

  if (sv.canvasRecorder.status !== RecorderStatus.Recording) return;

  await sv.canvasRecorder.step();

  const currentIcon = Math.floor(
    (sv.frame / sv.recordDuration / sv.frameRate) * 6
  );

  const progressIcons = document.getElementsByClassName(
    "renderingBarProgressSubIcons"
  );

  Array.from(progressIcons).forEach((icon, index) => {
    icon.style.display = "none";
    if (index <= currentIcon) {
      icon.style.display = "block";
    }
  });

  if (sv.frame >= sv.recordDuration * sv.frameRate) {
    await stopRecording();
    sv.frame = 0;
  }

  if (sv.canvasRecorder.status !== RecorderStatus.Stopped) {
    requestAnimationFrame(() => tick());
  }
};

function render() {
  sv.stats.begin();

  updateClock();

  if (sv.setupDone) {
    draw();
  }

  sv.stats.end();
}

// the updateClock function populates the pauseClock variable.
// it sets pauseClock to 1, then delay, then 0, then delay, etc.
// the main problem is that once started, it appears to not be able to be dynamically changed.

export async function updateClock() {
  const sharp = 10;
  let wave = sv.p.sin(sv.clock);
  wave = sv.p.atan(sharp * wave) / sv.p.atan(sharp);
  wave = sv.p.map(wave, -1, 1, 0, 1);
  sv.pauseClock = wave;
}
