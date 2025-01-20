import * as dat from "dat.gui";
import { recalculateGrid } from "./eventHandlers";
import { setupRecorder, startRecording, stopRecording } from "./recording";
import { updateCellData } from "../imgProcessing/imageProcessing";
import { createInput } from "./input";
import { downloadBlob } from "canvas-record";
import { downloadCanvas } from "./utils";
import { createGraphicsForSingleImage } from "../rendering/createShapeGraphics";
import { shaderRendering } from "../rendering/shaderRendering";
import { updateSvgIcons } from "./loadImages";
import { updateClock } from "../sketch";
export const gui = new dat.GUI({
  autoPlace: false,
});

var customContainer = document
  .querySelector(".moveGUI")
  .appendChild(gui.domElement);

export const sv = {
  pixiScreenshot: undefined,
  frame: 0,
  oneActiveImage: null,
  arcCont: null,
  animatedArc: null,
  workerDone: false,
  pApp: null,
  resizeAppToMe: null,
  resizeAppToMeWidth: null,
  resizeAppToMeHeight: null,
  pContainer: null,
  sceneContainer: null,
  sceneContainerFrame: null,
  sceneContainer2: null,
  sceneContainerFrame2: null,
  aPositionBuffer: null,
  ticker: null,
  frameRate: 60,
  spinnyBG: null,
  triangleMesh: null,
  instancePositionBuffer: null,
  totalTriangles: null,
  triangles: null,
  iconAtlas: null,
  spritesheet: null,
  sSheetTextures: [],
  sheets: [],
  canvasRecorder: null,
  p: null,
  setupDone: false,
  clock: null,
  pauseClock: 0,
  direction: 1,
  pauseTime: 2000,
  paused: false,

  startLoop: 1.01,
  endLoop: 1.99,
  stateStartTime: null,
  clearImage: null,
  stills: [],
  animUnderImgs: [],
  singleImgIcons: [],
  debugImgToggle: 0,
  slidingPieceImgs: [],
  manualScale: 1.0,
  transitionSpeed: 3000.0,
  transitionDelay: 0.5,
  speed: 0.01,
  color: false,
  fillColor: "#000",
  brandBlueConst: "#55d4ff",
  params: {
    // clipOutliers: false,
    // coU: 0,
    clipDarkOutliers: 0,
    clipLightOutliers: 0,
    scaleDynamically: true,
    sdU: 1,
    startInvisible: false,
    siU: 0,
  },
  totalSourceUploadNum: null,
  advanced: null,
  customShapeGraphics: null,
  circleGraphicLeft: null,
  circleGraphicRight: null,
  iconGraphic0: null,
  iconGraphic1: null,
  iconGraphic2: null,
  iconGraphic3: null,
  iconGraphic4: null,
  iconGraphic5: null,
  iconGraphic6: null,
  iconGraphic7: null,
  iconGraphic8: null,
  iconGraphic9: null,
  iconGraphic10: null,
  iconGraphic11: null,
  iconGraphic12: null,
  iconGraphic13: null,
  iconGraphic14: null,
  iconGraphic15: null,
  iconGraphic16: null,
  iconGraphic17: null,
  iconGraphic18: null,
  iconGraphic19: null,
  singleImgIconPaths: null,

  cTex: null,
  sTex: null,
  loadingSprite: null,
  loadingScreen: null,
  circles: [],
  shapes: [],
  shapes2: [],
  noiseTex: null,
  noisyValues: [],
  noisyMax: null,
  noisyMin: null,

  rowCount: null,
  colCount: null,
  totalCells: null,
  xExcess: null,
  yExcess: null,
  gridW: null,
  gridH: null,
  cellW: null,
  cellH: null,
  gridGutterMult: 1.0,
  gridResolutionMax: 200,
  gridResolutionBuffer: "30",
  gridResolution: "30",
  noiseOffset: 1.0,
  snappiness: 10.0,
  tlThresh1: 0.15,
  tlThresh1BUFFER: 0.01,
  tlThresh2: 0.25,
  tlThresh2BUFFER: 0.01,
  tlThresh3: 0.5,
  tlThresh3BUFFER: 0.01,

  testSVG: null,
  testImages: null,

  isRecording: false,
  recordDuration: 5,
  takeScreenshot: false,
  tempUploadFiles: [],

  // HTML elements
  inputElement: null,
  imgDiv: null,
};

//
const recording = gui.addFolder("Render");
recording.open();
const screenshotController = recording
  .add(sv, "takeScreenshot")
  .name("Screenshot");
sv.recordingController = recording.add(sv, "isRecording").name("Recording");

recording.add(sv, "recordDuration", 1, 60, 1).name("Record Duration (sec)");

sv.recordingController.onChange((value) => {
  if (sv.isRecording) {
    startRecording();
  } else if (!sv.isRecording) {
    // stopRecording();
  }
});

function sameResDownload(value) {
  if (value) {
    const webglCanvas = sv.pApp.canvas;
    downloadCanvas(webglCanvas);
    screenshotController.setValue(false);
  }
}

screenshotController.onChange((value) => {
  sameResDownload(value);
});

const general = gui.addFolder("General");
general.open();
const gridResController = general
  .add(sv, "gridResolutionBuffer")
  .name("Grid Resolution");

const speedController = general.add(sv, "speed", 0.0, 0.1).name("Speed");
// general.add(sv, "speed", 0.0, 0.1).name("Speed");

const colorController = general.add(sv, "color", false).name("Color");

const manualScaleController = general
  // .add(sv, "manualScale", 0.0, 0.99, 0.01)
  .add(sv, "manualScale", 0.0, 1.05, 0.01)
  // .add(sv, "manualScale", 0.0, 1.06, 0.01)
  .name("Manual Scale");

const noiseController = general
  .add(sv, "noiseOffset", 0, 1, 0.01)
  .name("Noise Offset");

const snappinessController = general
  .add(sv, "snappiness", 1.0, 20.0, 1.0)
  .name("Snappiness");

const threshController1 = general
  .add(sv, "tlThresh1", 0.0, 1.0)
  .name("tlThresh1");
const threshController2 = general
  .add(sv, "tlThresh2", 0.0, 1.0)
  .name("tlThresh2");
const threshController3 = general
  .add(sv, "tlThresh3", 0.0, 1.0)
  .name("tlThresh3");

colorController.onChange(async (value) => {
  if (value) sv.fillColor = sv.brandBlueConst;
  else sv.fillColor = "#000000";
  const passMeImgs = await recalculateGrid();
  await updateActiveImgBar();
  await updateSvgIcons();
  await updateCellData(passMeImgs);
});
speedController.onChange((value) => {
  sv.speed = value;
  updateClock();
});
manualScaleController.onChange((value) => {
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.manualScale = Math.min(
    value,
    1.05
    // 0.9999999
  );
});

noiseController.onChange((value) => {
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.noiseLevel = value;
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.vNoiseLevel = value;
});

snappinessController.onChange((value) => {
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.snappiness = value;
});

threshController1.onChange((value) => {});
threshController2.onChange((value) => {});
threshController3.onChange((value) => {});

const inputField = gridResController.domElement.querySelector("input");
inputField.addEventListener("keydown", async (event) => {
  const value = parseInt(inputField.value, 10);
  if (value !== sv.gridResolution) {
    if (event.key === "Enter") {
      if (sv.workerDone) {
        if (value < sv.gridResolutionMax) sv.gridResolution = value;
        else {
          gridResController.setValue(sv.gridResolutionMax);
          sv.gridResolution = sv.gridResolutionMax;
        }
        if (value == 0) {
          gridResController.setValue(1);
          sv.gridResolution = 1;
        }
        const passMeImgs = await recalculateGrid();
        await updateActiveImgBar();
        await updateSvgIcons();
        await updateCellData(passMeImgs);
      }
    }
  }
});

// Add the toggle parameter to control visibility
// const showSingleImgModeController = gui
// .add(sv.params, "showSingleImgMode")
// .name("Single Image Mode");

// const outerDiv = showSingleImgModeController.domElement.parentElement;
// outerDiv.classList.add("title-class");

// References for dynamically added controllers
let scaleDynamicController,
  startInvisibleController,
  clipDarkController,
  clipLightController;

// Function to add advanced parameters
sv.advanced = gui.addFolder("Advanced");
sv.advanced.open();
sv.advanced.hide();
function addAdvancedParameters() {
  clipDarkController = sv.advanced
    .add(sv.params, "clipDarkOutliers", 0.0, 1.0, 0.001)
    .name("Clip Dark Outliers");
  clipLightController = sv.advanced
    .add(sv.params, "clipLightOutliers", 0.0, 1.0, 0.001)
    .name("Clip Light Outliers");

  scaleDynamicController = sv.advanced
    .add(sv.params, "scaleDynamically")
    .name("Scale Dynamically");

  startInvisibleController = sv.advanced
    .add(sv.params, "startInvisible")
    .name("Start Invisible");

  clipDarkController.onChange((value) => {
    // if (value) sv.params.coU = 1;
    // else sv.params.coU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.clipDarkOutliers =
      value;
  });
  clipLightController.onChange((value) => {
    // if (value) sv.params.coU = 1;
    // else sv.params.coU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.clipLightOutliers =
      value;
  });

  startInvisibleController.onChange((value) => {
    if (value) sv.params.siU = 1;
    else sv.params.siU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.sI = sv.params.siU;
  });

  scaleDynamicController.onChange((value) => {
    if (value) sv.params.sdU = 1;
    else sv.params.sdU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.sD = sv.params.sdU;
  });
}
addAdvancedParameters();
