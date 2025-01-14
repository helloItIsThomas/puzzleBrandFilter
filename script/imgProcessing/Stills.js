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
        console.log("aveColorData: ", aveColorData);

        // here we are populating this.brightnessTex with the colors stored in aveColorData.
        const aveColorCanvas = document.createElement("canvas");
        aveColorCanvas.width = originalW;
        aveColorCanvas.height = originalH;
        const aveColorCtx = aveColorCanvas.getContext("2d");
        for (let row = 0; row < sv.rowCount; row++) {
          for (let col = 0; col < sv.colCount; col++) {
            // THIS IS COMMENTED OUT FOR DEBUGGING REASONS
            const aveColor = aveColorData[row * sv.colCount + col];
            aveColorCtx.fillStyle = `rgba(${aveColor.red}, ${aveColor.green}, ${aveColor.blue}, ${aveColor.alpha})`;
            aveColorCtx.fillRect(col * cellW, row * cellH, cellW, cellH);
          }
        }
        downloadCanvas(aveColorCanvas, "aveColorCanvas.png");
        this.brightnessTex = aveColorCanvas;
        resolve();
      };
      worker.onerror = (e) => {
        reject();
        console.error("Worker error:", e.message, e);
      };
    });
  }
}
