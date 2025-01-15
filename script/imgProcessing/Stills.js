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

    const thisCtx = image.canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("/script/workers/populateWorker.js", import.meta.url),
        { type: "module" }
      );

      const imageData = thisCtx.getImageData(0, 0, originalW, originalH);

      const rowCount = sv.rowCount;
      const colCount = sv.colCount;
      const cellW = originalW / colCount;
      const cellH = originalH / rowCount;

      worker.postMessage({ imageData, rowCount, colCount, cellW, cellH });

      worker.onmessage = (e) => {
        const result = e.data;

        this.cells = result.cells;
        const cellWidth = sv.cellW; //canvas.width / sv.colCount;
        const cellHeight = sv.cellH; //canvas.height / sv.rowCount;

        let aveColorData = [];

        for (let row = 0; row < sv.rowCount; row++) {
          for (let col = 0; col < sv.colCount; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;

            const imageData = thisCtx.getImageData(x, y, cellWidth, cellHeight);
            const thisAveColor = getAveColor(imageData);
            aveColorData.push(thisAveColor);
          }
        }
        const aveColorCanvas = document.createElement("canvas");
        aveColorCanvas.width = originalW; //canvas.width;
        aveColorCanvas.height = originalH; //canvas.height;
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
        downloadCanvas(aveColorCanvas);
        resolve();
      };
      worker.onerror = (e) => {
        reject();
        console.error("Worker error:", e.message, e);
      };
    });
  }
}
