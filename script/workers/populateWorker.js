onmessage = function (e) {
  const { dta, dtaW, dtaH, rowCount, colCount, cellW, cellH } = e.data;

  const cells = [];

  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < colCount; x++) {
      const xPos = x * cellW;
      const yPos = y * cellH;

      // Populate cell object
      cells.push({
        gridIndex: y * colCount + x,
        x: xPos,
        y: yPos,
        width: cellW,
        height: cellH,
      });
    }
  }

  const cellData = splitImageDataIntoCells(dta, dtaW, dtaH, rowCount, colCount);
  console.log(cellData);
  let aveColorData = [];
  // for (const cell of cellData) {
  // const imageDataObject = new ImageData(
  // new Uint8ClampedArray(cell.data),
  // cell.width,
  // cell.height
  // );
  // const canvas = document.createElement("canvas");
  // canvas.width = width;
  // canvas.height = height;
  // const context = canvas.getContext("2d");
  // context.putImageData(imageData, 0, 0);
  // downloadCanvas(canvas, "cellData.png");
  // const aveColor = getAveColor(cell);
  // aveColorData.push(aveColor);
  // }

  const imageData = dta.data;
  // const cellData = [];

  const result = {
    cells,
    imageData,
    aveColorData,
    cellData,
  };

  // • • • //
  // FUNCTIONS BELOW //
  // • • • //

  function getAveColor(imageData) {
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

  // Make a function that takes the imageData of an entire image and breaks it into separate arrays representing the data of each cell of the image
  function splitImageDataIntoCells(dta, dtaW, dtaH, rowCount, colCount) {
    const cellWidth = dtaW / colCount;
    const cellHeight = dtaH / rowCount;
    const cells = [];

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const xStart = col * cellWidth;
        const yStart = row * cellHeight;
        const cellData = new Uint8ClampedArray(cellWidth * cellHeight * 4); // 4 for RGBA

        for (let y = 0; y < cellHeight; y++) {
          for (let x = 0; x < cellWidth; x++) {
            const srcIndex = ((yStart + y) * dtaW + (xStart + x)) * 4;
            const destIndex = (y * cellWidth + x) * 4;

            cellData[destIndex] = dta[srcIndex]; // R
            cellData[destIndex + 1] = dta[srcIndex + 1]; // G
            cellData[destIndex + 2] = dta[srcIndex + 2]; // B
            cellData[destIndex + 3] = dta[srcIndex + 3]; // A
          }
        }
        cells.push({ data: cellData, width: cellWidth, height: cellHeight });
      }
    }
    return cells;
  }

  postMessage(result);
};
