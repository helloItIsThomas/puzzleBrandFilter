onmessage = function (e) {
  const { dta, dtaW, dtaH, rowCount, colCount, cellW, cellH, gridRes } = e.data;

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

  const cellData = splitImageDataIntoCells(
    dta,
    dtaW,
    dtaH,
    rowCount,
    colCount,
    gridRes
  );

  let aveColorData = [];
  for (const cell of cellData) {
    const aveColor = getAveColor(cell);
    aveColorData.push(aveColor);
  }

  const result = {
    cells,
    aveColorData,
    // cellData here should be a list of arrays that contain every color of every pixel in an array. its length should be cellW*cellH*4
    cellData,
  };

  // • • • //
  // FUNCTIONS BELOW //
  // • • • //

  function getAveColor(cellData) {
    // console.log(imageData);
    const data = cellData;
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    let pixelCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const rD = data[i]; // || 0;
      const gD = data[i + 1]; // || 0;
      const bD = data[i + 2]; // || 0;
      const aD = data[i + 3]; // || 0;
      r += rD;
      g += gD;
      b += bD;
      a += aD;
      pixelCount++;
    }
    const aR = Math.round(r / pixelCount);
    const aG = Math.round(g / pixelCount);
    const aB = Math.round(b / pixelCount);
    const aA = Math.round(a / pixelCount);
    const aBright = Math.round((r + g + b) / (pixelCount * 3));

    // console.log(aR, aG, aB, aA, aBright);

    return {
      red: aR,
      green: aG,
      blue: aB,
      alpha: aA,
      brightness: aBright,
    };
  }

  // Make a function that takes the imageData of an entire image and breaks it into separate arrays representing the data of each cell of the image
  function splitImageDataIntoCells(
    dta,
    dtaW,
    dtaH,
    rowCount,
    colCount,
    gridRes
  ) {
    const cellWidth = dtaW / colCount;
    const cellHeight = dtaH / rowCount;
    const _cells = [];

    // i want to return a list of cells called _cells
    // each cell object should include a list of pixels called cellPixels
    // the length of each cell should be (cellW * cellH * 4)

    // if we print these:
    console.log(
      "num pixels in a cell: ",
      cellWidth * cellHeight,
      "num colors in a cell: ",
      cellWidth * cellHeight * 4
    );

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const xStart = col * cellWidth;
        const yStart = row * cellHeight;
        const cellPixels = new Uint8ClampedArray(cellWidth * cellHeight * 4); // 4 for RGBA
        // console.log("num colors in a cell: ", cellPixels.length);
        // cellPixels.length should be equal to the number of pixels in one cell * 4 (for rgba).

        for (let y = 0; y < cellHeight; y++) {
          for (let x = 0; x < cellWidth; x++) {
            const srcIndex = ((yStart + y) * dtaW + (xStart + x)) * 4;
            // const srcIndex = ((yStart + y) * dtaW + (xStart + x)) * 4;
            const destIndex = (y * cellWidth + x) * 4;

            cellPixels[destIndex] = dta[srcIndex]; // R
            cellPixels[destIndex + 1] = dta[srcIndex + 1]; // G
            cellPixels[destIndex + 2] = dta[srcIndex + 2]; // B
            cellPixels[destIndex + 3] = dta[srcIndex + 3]; // A
          }
        }
        _cells.push(cellPixels);
      }
    }
    return _cells;
  }

  postMessage(result);
};
