export function getAveColor(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;
  let pixelCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    pixelCount++;
  }
  const aR = Math.round(r / pixelCount);
  const aG = Math.round(g / pixelCount);
  const aB = Math.round(b / pixelCount);
  const aA = 1.0;
  const aBright = Math.round((r + g + b) / (pixelCount * 3));

  return {
    red: aR,
    green: aG,
    blue: aB,
    alpha: aA,
    brightness: aBright,
  };
}
