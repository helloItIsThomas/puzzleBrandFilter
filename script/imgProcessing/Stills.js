import { sv } from "../utils/variables.js";
import { downloadCanvas } from "../utils/utils.js";
import { getAveColor } from "../imgProcessing/getAveColor.js";

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

      const imageData = tempContext.getImageData(0, 0, originalW, originalH);

      const rowCount = sv.rowCount;
      const colCount = sv.colCount;
      const cellW = originalW / colCount;
      const cellH = originalH / rowCount;

      worker.postMessage({ imageData, rowCount, colCount, cellW, cellH });

      worker.onmessage = (e) => {
        const result = e.data;
        const canvas = document.createElement("canvas");
        canvas.width = originalW;
        canvas.height = originalH;
        canvas.width = originalW;
        canvas.height = originalH;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(tempCanvas, 0, 0);
        this.cells = result.cells;
        // lets implement a function that expects a canvas and returns the average color for the canvas.
        const cellWidth = canvas.width / sv.colCount;
        const cellHeight = canvas.height / sv.rowCount;

        let aveColorData = [];

        for (let row = 0; row < sv.rowCount; row++) {
          for (let col = 0; col < sv.colCount; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;

            const cellCanvas = document.createElement("canvas");
            cellCanvas.width = cellWidth;
            cellCanvas.height = cellHeight;
            const ctx = cellCanvas.getContext("2d");

            ctx.drawImage(
              canvas,
              x,
              y,
              cellWidth,
              cellHeight,
              0,
              0,
              cellWidth,
              cellHeight
            );
            aveColorData.push(getAveColor(cellCanvas));
          }
        }
        const aveColorCanvas = document.createElement("canvas");
        aveColorCanvas.width = canvas.width;
        aveColorCanvas.height = canvas.height;
        const aveColorCtx = aveColorCanvas.getContext("2d");

        for (let row = 0; row < sv.rowCount; row++) {
          for (let col = 0; col < sv.colCount; col++) {
            const aveColor = aveColorData[row * sv.colCount + col];
            aveColorCtx.fillStyle = `rgb(${aveColor.brightness}, ${aveColor.brightness}, ${aveColor.brightness})`;
            aveColorCtx.fillRect(
              col * cellWidth,
              row * cellHeight,
              cellWidth,
              cellHeight
            );
          }
        }
        this.brightnessTex = aveColorCanvas;
        // downloadCanvas(aveColorCanvas);
        resolve();
      };
      worker.onerror = (e) => {
        reject();
        console.error("Worker error:", e.message, e);
      };
    });
  }
}
