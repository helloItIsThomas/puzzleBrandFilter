import { sv } from "../utils/variables.js";
import { downloadCanvas, getAspectRatio } from "../utils/utils.js";

import {
  Assets,
  Buffer,
  BufferUsage,
  Mesh,
  Shader,
  Geometry,
  Texture,
  ImageSource,
  GlProgram,
  Container,
} from "pixi.js";

async function loadFragShader() {
  const vertexLoader = import.meta.glob("../../shader/vert.vert", {
    as: "raw",
  });
  const fragmentLoader = sv.oneActiveImage
    ? import.meta.glob("../../shader/single.frag", { as: "raw" })
    : import.meta.glob("../../shader/mult.frag", { as: "raw" });

  const [vertex, fragment] = await Promise.all([
    vertexLoader["../../shader/vert.vert"](),
    sv.oneActiveImage
      ? fragmentLoader["../../shader/single.frag"]()
      : fragmentLoader["../../shader/mult.frag"](),
  ]);

  return { vertex, fragment };
}

export async function shaderRendering() {
  const { vertex, fragment } = await loadFragShader();
  const gl = { vertex, fragment };

  sv.totalTriangles = sv.totalCells;

  sv.instancePositionBuffer = new Buffer({
    data: new Float32Array(sv.totalTriangles * 2),
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
  });

  sv.triangles = [];

  const offsetWidth = sv.pApp.renderer.width * 0.5 - sv.gridW * 0.5;
  const offsetHeight = sv.pApp.renderer.height * 0.5 - sv.gridH * 0.5;

  for (let i = 0; i < sv.totalTriangles; i++) {
    // assuming the grid of both images is the same...
    const cell = sv.stills[0].cells[i];
    sv.triangles[i] = {
      // x: cell.x,
      // y: cell.y,
      x: cell.x + offsetWidth,
      y: cell.y + offsetHeight,
      speed: 1.0,
    };
  }

  // Create a new buffer for unique IDs
  const instanceIndexBuffer = new Buffer({
    data: new Float32Array(
      [...Array(sv.totalTriangles).keys()].map((i) => i / sv.totalTriangles)
    ),
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
  });

  console.log("instanceIndexBuffer: ", instanceIndexBuffer.data);

  const geometry = new Geometry({
    topology: "triangle-strip",
    instanceCount: sv.totalTriangles,
    attributes: {
      aPosition: [0.0, 0.0, sv.cellW, 0.0, sv.cellW, sv.cellH, 0.0, sv.cellH],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      aPositionOffset: {
        buffer: sv.instancePositionBuffer,
        instance: true,
      },
      aIndex: {
        buffer: instanceIndexBuffer,
        instance: true,
      },
    },
    indexBuffer: [0, 1, 2, 0, 2, 3],
  });

  //// WIP WIP WIP WIP WIP WIP

  if (sv.noiseCanvasGraphic) {
    sv.noiseCanvasGraphic.remove();
    sv.noiseCanvasGraphic = undefined;
  }

  const noiseCanvas = sv.p.createGraphics(sv.gridResolution, sv.gridResolution);
  sv.noiseCanvasGraphic = noiseCanvas;

  let n = 0;
  sv.noisyValues = [];
  for (let y = 0; y < sv.rowCount; y++) {
    for (let x = 0; x < sv.colCount; x++) {
      // const noisyValue = sv.p.noise(n * sv.p.noise(n / sv.gridResolution));
      const noisyValue = sv.p.noise(n);
      sv.noisyValues.push(noisyValue);
      sv.noisyMax = sv.p.max(sv.noisyMax, noisyValue);
      sv.noisyMin = sv.p.min(sv.noisyMin, noisyValue);
      noiseCanvas.set(x, y, sv.p.color(noisyValue * 255));
      n++;
    }
  }
  noiseCanvas.updatePixels();
  //// WIP WIP WIP WIP WIP WIP END END END END

  let resources = {};
  if (resources) {
    Object.keys(resources).forEach((key) => {
      const resource = resources[key];
      if (resource instanceof WebGLBuffer) gl.deleteBuffer(resource);
      else if (resource instanceof HTMLElement) resource.remove();
    });
  }
  resources = {}; // Clears the object reference.
  resources = createResources(noiseCanvas);

  let bTexes = [];
  bTexes = sv.stills.map((still) => {
    let src = new ImageSource({ resource: still.brightnessTex });
    let tex = new Texture({ source: src });

    return tex;
  });

  resources.waveUniforms.numBTexes = { value: bTexes.length, type: "i32" };

  if (bTexes.length == 1) {
    resources["bTex1"] = bTexes[0].source;
    resources["bTex2"] = bTexes[0].source;

    resources.waveUniforms.bTex1AR = {
      value: getAspectRatio(bTexes[0].source),
      type: "f32",
    };
    resources.waveUniforms.bTex2AR = {
      value: getAspectRatio(bTexes[0].source),
      type: "f32",
    };
  } else if (bTexes.length == 2) {
    resources["bTex1"] = bTexes[0].source;
    resources["bTex2"] = bTexes[1].source;

    resources.waveUniforms.bTex1AR = {
      value: getAspectRatio(bTexes[0].source),
      type: "f32",
    };
    resources.waveUniforms.bTex2AR = {
      value: getAspectRatio(bTexes[1].source),
      type: "f32",
    };
  } else if (bTexes.length > 2) {
    console.error(" > 2 Images Not Supported ");
  } else console.log(" Currently " + bTexes.length + "Number of Images ");

  const shader = Shader.from({
    gl,
    resources,
  });

  sv.triangleMesh = new Mesh({
    geometry,
    shader,
    drawMode: "triangle-list",
  });

  sv.pApp.stage.removeChildren();
  sv.sceneContainer = new Container();
  sv.sceneContainerFrame = new Container();
  sv.sceneContainerFrame.addChild(sv.sceneContainer);
  sv.pApp.stage.addChild(sv.sceneContainerFrame);

  const data = sv.instancePositionBuffer.data;
  let count = 0;
  for (let i = 0; i < sv.totalTriangles; i++) {
    const triangle = sv.triangles[i];
    data[count++] = triangle.x * sv.xExcess;
    data[count++] = triangle.y * sv.yExcess;
  }

  sv.sceneContainer.addChild(sv.triangleMesh);
}

function createResources(noiseCanvas) {
  // Common properties for both modes
  let noiseSrc = new ImageSource({ resource: noiseCanvas.canvas });
  let noiseTex = new Texture({ source: noiseSrc });

  console.log("row count: ", sv.rowCount);
  console.log("col count: ", sv.colCount);

  const commonResources = {
    noiseTex: noiseTex.source,
    waveUniforms: {
      time: { value: 1.0, type: "f32" },
      vTime: { value: 1.0, type: "f32" },
      tlThresh1: { value: sv.tlThresh1, type: "f32" },
      tlThresh2: { value: sv.tlThresh2, type: "f32" },
      tlThresh3: { value: sv.tlThresh3, type: "f32" },
      vTlThresh1: { value: sv.tlThresh1, type: "f32" },
      vTlThresh2: { value: sv.tlThresh2, type: "f32" },
      vTlThresh3: { value: sv.tlThresh3, type: "f32" },
      vCellW: { value: sv.cellW, type: "f32" },
      vCellH: { value: sv.cellH, type: "f32" },
      cellW: { value: sv.cellW, type: "f32" },
      cellH: { value: sv.cellH, type: "f32" },
      // manualScale: { value: 0.999, type: "f32" },
      manualScale: { value: 1.05, type: "f32" },
      gridResolution: { value: sv.gridResolution, type: "f32" },
      rowCount: { value: sv.rowCount, type: "f32" },
      colCount: { value: sv.colCount, type: "f32" },
      vRowCount: { value: sv.rowCount, type: "f32" },
      vColCount: { value: sv.colCount, type: "f32" },
      sD: { value: sv.params.sdU, type: "i32" },
      sI: { value: sv.params.siU, type: "i32" },
      cO: { value: sv.params.coU, type: "i32" },
      clipDarkOutliers: { value: 0.0, type: "f32" },
      clipLightOutliers: { value: 0.0, type: "f32" },
      noiseLevel: { value: sv.noiseOffset, type: "f32" },
      vNoiseLevel: { value: sv.noiseOffset, type: "f32" },
      vNoisyMin: { value: sv.noisyMin, type: "f32" },
      vNoisyMax: { value: sv.noisyMax, type: "f32" },
    },
  };

  const graphics = sv.oneActiveImage
    ? [sv.iconAtlas.canvas]
    : [
        sv.customShapeGraphics.canvas,
        sv.circleGraphicLeft.canvas,
        sv.circleGraphicRight.canvas,
      ];

  const textures = graphics.map(
    (canvas) => new Texture({ source: new ImageSource({ resource: canvas }) })
  );

  // downloadCanvas(textures[0].source.resource);

  // Mode-specific textures
  const modeSpecificTextures =
    sv.oneActiveImage === true
      ? {
          atlasTex: textures[0].source,
          waveUniforms: {
            iconAR: { value: 1.0, type: "f32" },
          },
        }
      : (() => {
          const [art1, art2, art3] = textures.map((tex) =>
            sv.p.int(tex.source.width / tex.source.height)
          );
          return {
            hourglassTex: textures[0].source,
            leftCircleTex: textures[1].source,
            rightCircleTex: textures[2].source,
            waveUniforms: {
              hgAR: { value: art1, type: "f32" },
              lcAR: { value: art2, type: "f32" },
              rcAR: { value: art3, type: "f32" },
            },
          };
        })();

  // Merge common and specific resources
  return {
    ...commonResources,
    ...modeSpecificTextures,
    waveUniforms: {
      ...commonResources.waveUniforms,
      ...modeSpecificTextures.waveUniforms,
    },
  };
}
