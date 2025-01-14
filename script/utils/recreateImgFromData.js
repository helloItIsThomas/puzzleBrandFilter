import { downloadCanvas } from "./utils.js";

export function recreateImageFromData(dta, dtaW, dtaH) {
  const j = new ImageData(dta, dtaW, dtaH);
  const jCanvas = document.createElement("canvas");
  jCanvas.width = dtaW;
  jCanvas.height = dtaH;
  const jCtx = jCanvas.getContext("2d");
  jCtx.putImageData(j, 0, 0, 0, 0, dtaW, dtaH);

  return jCanvas;
}
