import { sv } from "../utils/variables.js";
import { downloadCanvas } from "../utils/utils.js";

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
        this.brightnessTex = canvas;
        this.cells = result.cells;
        resolve();
      };
      worker.onerror = (e) => {
        reject();
        console.error("Worker error:", e.message, e);
      };
    });
  }
}
