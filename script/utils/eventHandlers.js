import { sv } from "./variables.js";
import { updateCellData } from "../imgProcessing/imageProcessing.js";
import { AVC, HEVC } from "media-codecs";
import { initGridLoadingScreen } from "../rendering/loading.js";
import { showLoadIcon, initializeLoadIcon } from "./icons.js";
import { fitImageToWindow, downloadCanvas } from "../utils/utils.js";
import { gsap } from "gsap";
import { updateSvgIcons } from "./loadImages.js";

export function handleImgInputAtRuntime(p) {
  sv.animUnderImgs = [];

  sv.tempUploadFiles.forEach((_file) => {
    if (_file.type === "image") {
      p.loadImage(_file.data, function (img) {
        sv.animUnderImgs.push(img);
        if (sv.animUnderImgs.length === sv.totalSourceUploadNum) {
          updateActiveImgBar();
          recalculateGrid();
        }
      });
    } else {
      console.warn("Invalid file type detected:", _file.type);
      document.getElementById("badFile").style.opacity = 1;
      setTimeout(() => {
        document.getElementById("badFile").style.opacity = 0;
      }, 5000);
      return;
    }
  });
}

export async function recalculateGrid(resizeTo = "bodyRight") {
  let _imgs = Array.isArray(sv.animUnderImgs)
    ? sv.animUnderImgs
    : [sv.animUnderImgs]; // Ensure _imgs is always an array

  // Preprocess images
  const processedImages = _imgs.map((img) => {
    img = fitImageToWindow(img, resizeTo);
    // check if both images are the same size and aspect ratio.

    const processed = img.get();
    processed.filter(sv.p.GRAY);
    return processed;
  });

  const imgs = processedImages;

  //    • figure out how we are handling 2 images of different sizes. ATTEMPTING TO FIX THIS NOW.
  // this assumes all background images are the same size and aspect ratio(?)
  // set the gridW and gridH to the maximum of both images

  // if (imgs.length > 1) {
  // sv.gridW = Math.max(imgs[0].width, imgs[1].width);
  // sv.gridH = Math.max(imgs[0].height, imgs[1].height);
  // } else {
  // sv.gridW = imgs[0].width;
  // sv.gridH = imgs[0].height;
  // }
  sv.gridW = imgs[0].width;
  sv.gridH = imgs[0].height;

  imgs.forEach((img) => {
    // if images are not the same aspect ratio, throw an error
    if (img.width / img.height !== sv.gridW / sv.gridH) {
      throw console.error("Images are not the same aspect ratio");
    }
  });

  sv.workerDone = false;
  showLoadIcon();

  sv.colCount = sv.gridResolution;
  sv.cellW = sv.gridW / sv.colCount;
  sv.cellH = sv.cellW;
  sv.rowCount = sv.p.floor(sv.gridH / sv.cellH);
  sv.totalCells = sv.rowCount * sv.colCount;
  sv.xExcess = (sv.cellW * sv.colCount) / sv.gridW;
  sv.yExcess = (sv.cellH * sv.rowCount) / sv.gridH;
  // console.log(sv.xExcess, sv.yExcess);

  await updateCellData(imgs);

  console.log("••••••recalculated grid");
}

export function updateActiveImgBar() {
  // set oneActiveImage flag here
  if (sv.totalSourceUploadNum == 1) {
    sv.oneActiveImage = true;
    sv.advanced.show();
  } else if (sv.totalSourceUploadNum > 1) {
    sv.oneActiveImage = false;
    sv.advanced.hide();
  } else throw console.error("Less than 1 active image detected");

  // get the background images
  const imgs = sv.animUnderImgs;

  // clear the preview bar
  const previewBar = document.getElementById("activeImages");
  while (previewBar.firstChild) {
    previewBar.removeChild(previewBar.firstChild);
  }

  // make a copy of each background image and put it in previewBar.
  // resizing for these is happening automatically with css.
  imgs.forEach((img, index) => {
    const previewImg = sv.p.createImage(img.width, img.height);
    previewImg.copy(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width,
      img.height
    );
    const previewCanvas = Object.assign(document.createElement("canvas"), {
      width: previewImg.width,
      height: previewImg.height,
      id: `${index}`,
    });
    previewCanvas.getContext("2d").drawImage(previewImg.canvas, 0, 0);
    // Find the correct position to insert the canvas
    const existingCanvases = previewBar.children;
    let insertPosition = index;

    // Insert at the correct position or append if it's the last element
    if (insertPosition < existingCanvases.length) {
      previewBar.insertBefore(previewCanvas, existingCanvases[insertPosition]);
    } else {
      previewBar.appendChild(previewCanvas);
    }
  });
}

let resizeTimeout;
let resizingStarted = false;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  if (!resizingStarted) {
    resizingStarted = true;
    // gsap.to("#pixiApp", { opacity: 0, duration: 0.1 });
    gsap.to("#bodyLeft", { opacity: 0, duration: 0.1 });
    gsap.to("#bodyRight", { opacity: 0, duration: 0.1 });
  }

  resizeTimeout = setTimeout(() => {
    initializeLoadIcon();
    recalculateGrid();
    updateSvgIcons();

    resizingStarted = false; // Reset for next resize
  }, 500); // Adjust timeout as needed
});
