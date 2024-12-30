import { tick } from "../sketch";
import { Recorder } from "canvas-record";
import { AVC } from "media-codecs";
import { recalculateGrid } from "./eventHandlers";
import { updateSvgIcons } from "./loadImages";
import { sv } from "./variables.js";

export async function resizeAbsoluteContainerForRecording() {
  const aCont = document.getElementById("absoluteContainer");

  // make the absolute container size the same aspect ratio as the grid, and make sure that neither the width nor height exceed 1080px
  const aspectRatio = sv.gridW / sv.gridH;
  const maxSize = 1080;

  // ensure that the width and height are divisible by 2
  const width = Math.floor(Math.min(maxSize, maxSize * aspectRatio) / 2) * 2;
  const height = Math.floor(Math.min(maxSize, maxSize / aspectRatio) / 2) * 2;

  aCont.style.width = `${width}px`;
  aCont.style.height = `${height}px`;

  aCont.style.display = "block";
  sv.pApp.resizeTo = aCont;

  if (aCont.contains(sv.pApp.canvas)) {
    aCont.removeChild(sv.pApp.canvas);
  }
  aCont.appendChild(sv.pApp.canvas);
}

export async function startRecording() {
  try {
    sv.ticker.stop();
    document.getElementById("renderingScreen").style.display = "flex";
    await resizeAbsoluteContainerForRecording();
    const passMeImgs = await recalculateGrid("absoluteContainer");
    await updateSvgIcons();
    await updateCellData(passMeImgs);

    await setupRecorder();

    await sv.canvasRecorder.start();
    tick(sv.canvasRecorder);
  } catch (e) {
    sv.recordingController.setValue(false);
  }
}

export async function stopRecording() {
  try {
    const aCont = document.getElementById("absoluteContainer");
    const bodyRight = document.getElementById("bodyRight");

    await sv.canvasRecorder.stop();

    if (bodyRight.contains(sv.pApp.canvas)) {
      bodyRight.removeChild(sv.pApp.canvas);
    }
    bodyRight.appendChild(sv.pApp.canvas);

    sv.pApp.resizeTo = bodyRight;
    const passMeImgs = await recalculateGrid();
    await updateSvgIcons();
    await updateCellData(passMeImgs);

    aCont.style.display = "none";
    document.getElementById("renderingScreen").style.display = "none";
    sv.recordingController.setValue(false);
    sv.ticker.start();
  } catch (e) {
    console.log("Recording Failed: ", e);
  }
}

export async function setupRecorder() {
  // If recorder already exists, stop and clean it up first
  if (sv.canvasRecorder) {
    await sv.canvasRecorder.stop();
    sv.canvasRecorder = null;
  }

  const webglCanvas = sv.pApp.canvas;
  const webgl2CTX = webglCanvas.getContext("webgl2");
  const dpr = window.devicePixelRatio || 2;

  sv.canvasRecorder = new Recorder(webgl2CTX, {
    name: "canvas-record-example",
    duration: Infinity,
    frameRate: sv.frameRate,
    encoderOptions: {
      download: true,
      codec: AVC.getCodec({
        profile: "High",
        level: "5.2",
      }),
    },
  });
}
