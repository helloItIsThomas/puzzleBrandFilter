import { downloadCanvas } from "../utils/utils.js";
import { sv } from "../utils/variables.js";

const cDiamMult = 0.5;
const scaleAmount = 1.0;

export function createGraphicsForSingleImage() {
  // create a 5x4 texture atlas, or sprite sheet.
  const atlasColCount = 5;
  const atlasRowCount = 4;

  const borderScaler = 1.0;
  const oW = sv.singleImgIcons[0].width;
  const oH = sv.singleImgIcons[0].height;
  const atlasW = oW * atlasColCount;
  const atlasH = oH * atlasRowCount;
  const iconW = sv.singleImgIcons[0].width;
  const iconH = sv.singleImgIcons[0].height;

  if (sv.createGraphicsForSingleImageGraphic) {
    sv.createGraphicsForSingleImageGraphic.remove();
    sv.createGraphicsForSingleImageGraphic = undefined;
  }

  const pg = sv.p.createGraphics(atlasW, atlasH);
  pg.pixelDensity(2);
  sv.createGraphicsForSingleImageGraphic = pg;

  console.log("sanity check");

  let i = 0;
  for (let y = 0; y < atlasRowCount; y++) {
    for (let x = 0; x < atlasColCount; x++) {
      if (sv.singleImgIcons[i]) {
        console.log(sv.singleImgIcons, sv.singleImgIcons.length);
        console.log("i: ", i);
        // const vanillaCanvas = sv.singleImgIcons[i++];
        const vanillaCanvas = sv.singleImgIcons[0];

        console.log(vanillaCanvas);
        // i think this is where the error is coming from.
        const imageData = vanillaCanvas
          .getContext("2d")
          .getImageData(0, 0, vanillaCanvas.width, vanillaCanvas.height);
        const p5TempCanvas = sv.p.createImage(
          vanillaCanvas.width,
          vanillaCanvas.height
        );
        p5TempCanvas.loadPixels();
        for (let i = 0; i < imageData.data.length; i++) {
          p5TempCanvas.pixels[i] = imageData.data[i];
        }
        p5TempCanvas.updatePixels();
        pg.image(
          p5TempCanvas,
          x * iconW + (iconW * 0.5 - iconW * borderScaler * 0.5),
          y * iconH + (iconH * 0.5 - iconH * borderScaler * 0.5),
          iconW * borderScaler,
          iconH * borderScaler
        );
      } else console.log("NO IMAGE FOUND FOR INDEX ", i);
    }
  }

  console.log(sv.singleImgIcons[0]);

  return pg;
}

export function createGraphicsForMultipleImages() {
  if (sv.circleGraphicLeft) sv.circleGraphicLeft.remove();
  if (sv.circleGraphicRight) sv.circleGraphicRight.remove();
  if (sv.customShapeGraphics) sv.customShapeGraphics.remove();

  sv.circleGraphicLeft = createLeftCircle(sv.cellW);
  sv.circleGraphicRight = createRightCircle(sv.cellW);
  sv.customShapeGraphics = createCenterGraphic(sv.cellW);
}

export function createLeftCircle(size) {
  const w = size * 2;
  const h = size;

  if (sv.createLeftCircleGraphic) {
    sv.createLeftCircleGraphic.remove();
    sv.createLeftCircleGraphic = undefined;
  }

  const pg = sv.p.createGraphics(w, h);
  sv.createLeftCircleGraphic = pg;

  pg.pixelDensity(2);
  pg.fill(sv.fillColor);
  pg.noStroke();
  // pg.stroke(255, 0, 0);
  pg.background(0, 255, 0);
  pg.clear();
  pg.ellipseMode(sv.p.CENTER);
  const circleDiameter = h * cDiamMult;
  pg.push();
  pg.translate(0.0, h * 0.5 - circleDiameter * scaleAmount);
  pg.scale(scaleAmount); // Scale down all elements
  pg.translate(circleDiameter * 0.5, h / 2);
  pg.ellipse(0.0, 0.0, circleDiameter, circleDiameter);
  pg.pop();
  return pg;
}

export function createRightCircle(size) {
  const w = size * 2;
  const h = size;

  if (sv.createRightCircleGraphic) {
    sv.createRightCircleGraphic.remove();
    sv.createRightCircleGraphic = undefined;
  }

  const pg = sv.p.createGraphics(w, h);
  sv.createRightCircleGraphic = pg;

  pg.pixelDensity(2);
  pg.noStroke();
  pg.fill(sv.fillColor);
  // pg.stroke(255, 0, 0);
  pg.background(0, 255, 0);
  pg.clear();
  pg.ellipseMode(sv.p.CENTER);
  const circleDiameter = h * cDiamMult; // Adjust the scale as needed

  pg.push();
  pg.translate(0.0, h * 0.5 - circleDiameter * scaleAmount);
  pg.scale(scaleAmount); // Scale down all elements
  pg.translate(w * 0.5 - circleDiameter * 0.5, h / 2);
  pg.ellipse(0.0, 0.0, circleDiameter, circleDiameter);
  pg.pop();
  return pg;
}

export function createCenterGraphic(size) {
  // const scaleAmount = 0.95;

  // Define quad dimensions
  const width = size * 2;
  const height = size;

  if (sv.createCenterGraphic) {
    sv.createCenterGraphic.remove();
    sv.createCenterGraphic = undefined;
  }

  const pg = sv.p.createGraphics(width, height);
  sv.createCenterGraphic = pg;

  // const cDiameter = height * cDiamMult * scaleAmount;
  const cDiameter = height * cDiamMult;
  pg.pixelDensity(2);
  pg.fill(sv.fillColor);
  pg.stroke("#fff");
  // pg.strokeWeight(1);
  pg.noStroke();

  const borderOffset = 0.0;

  pg.push();
  pg.translate(0.0, height * 0.5 - cDiameter * scaleAmount);
  pg.scale(scaleAmount); // Scale down all elements
  // Draw quad with padding
  pg.beginShape();
  pg.vertex(borderOffset, borderOffset);
  pg.vertex(width * 0.5 - borderOffset, borderOffset);
  pg.vertex(width * 0.5 - borderOffset, height - borderOffset);
  pg.vertex(borderOffset, height - borderOffset);
  pg.endShape(sv.p.CLOSE);

  // Draw two circular cutouts, centered vertically with padding adjustments
  pg.erase();
  pg.circle(borderOffset, height * 0.5, cDiameter - 2 * borderOffset); // Left circle
  pg.circle(
    width * 0.5 - borderOffset,
    height * 0.5,
    cDiameter - 2 * borderOffset
  ); // Right circle
  pg.noErase();
  pg.pop();

  return pg;
}
