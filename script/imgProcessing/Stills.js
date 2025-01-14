import { sv } from "../utils/variables.js";
import { downloadCanvas } from "../utils/utils.js";
import { recreateImageFromData } from "../utils/recreateImgFromData.js";

export class Still {
  constructor() {
    this.processedImage = null;
    this.currentImageIndex = 0;
    this.brightnessTex = null;
    this.cells = [];
  }

  populateGridWithWorker(image) {
    const originalW = image.width;
    const originalH = image.height;

    // temp debug activity //
    // const originalW = sv.gridW;
    // const originalH = sv.gridH;
    // temp debug activity OVER //

    // Create a temporary canvas to make sure the image is in native format.
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalW;
    tempCanvas.height = originalH;
    const tempContext = tempCanvas.getContext("2d");
    tempContext.drawImage(image.canvas, 0, 0, originalW, originalH);

    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("/script/workers/populateWorker.js", import.meta.url),
        { type: "module" }
      );

      const rowCount = sv.rowCount;
      const colCount = sv.colCount;
      const cellW = originalW / colCount;
      const cellH = originalH / rowCount;

      // image data here is the data of a source image
      const imageData = tempContext.getImageData(0, 0, originalW, originalH);
      // imageData here is accurate

      const dta = imageData.data;
      const dtaW = originalW;
      const dtaH = originalH;

      worker.postMessage({ dta, dtaW, dtaH, rowCount, colCount, cellW, cellH });

      worker.onmessage = (e) => {
        const result = e.data;
        this.cells = result.cells;
        const aveColorData = result.aveColorData;
        const cellData = result.cellData;
        console.log(
          "cellW: ",
          cellW,
          "cellH: ",
          cellH,
          "cellW*cellH * 4: ",
          cellW * cellH * 4
        );
        // lets see if we can reconstruct the top corner of the image.
        // we should have an array of all rgba values of all pixels of the top left cell.
        const topLeftCornerRGBAData = cellData[0];
        const pixelColors = [];
        for (let i = 0; i < topLeftCornerRGBAData.length; i += 4) {
          const red = topLeftCornerRGBAData[i];
          const green = topLeftCornerRGBAData[i + 1];
          const blue = topLeftCornerRGBAData[i + 2];
          const alpha = topLeftCornerRGBAData[i + 3];
          pixelColors.push({ red, green, blue, alpha });
        }
        console.log("—: ", cellData[0].length);
        console.log("pixelColors: ", pixelColors);
        const testCanvas = document.createElement("canvas");
        testCanvas.width = cellW;
        testCanvas.height = cellH;
        const testCtx = testCanvas.getContext("2d");
        for (let y = 0; y < cellH; y++) {
          for (let x = 0; x < cellW; x++) {
            const pixelColor = pixelColors[y * cellW + x];
            if (pixelColor != undefined) {
              console.log("pixelColor: ", pixelColor);
              testCtx.fillStyle = `rgba(${pixelColor.red}, ${pixelColor.green}, ${pixelColor.blue}, ${pixelColor.alpha})`;
              testCtx.fillRect(x, y, 1, 1);
            }
          }
        }
        downloadCanvas(testCanvas);
        this.brightnessTex = testCanvas;
        resolve();
      };
      worker.onerror = (e) => {
        reject();
        console.error("Worker error:", e.message, e);
      };
    });
  }
}
