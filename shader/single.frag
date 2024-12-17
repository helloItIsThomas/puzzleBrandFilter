precision highp float;

in vec2 vUV;
in float vIndex;

uniform float rowCount;
uniform float colCount;
uniform float noiseLevel;
uniform sampler2D noiseTex;
uniform sampler2D bTex1;
uniform sampler2D bTex2;
uniform sampler2D atlasTex;

uniform float vTlThresh1;
uniform float vTlThresh2;
uniform float vTlThresh3;

void main() {

    float atlasColCount = 5.0;
    float atlasRowCount = 4.0;
    float totalNumCells = atlasColCount * atlasRowCount;

    float totalCells = rowCount * colCount;
    float indexFloat = vIndex * totalCells;

    float x = mod(indexFloat, colCount) / colCount;
    float y = floor(indexFloat / colCount) / rowCount;
    vec2 bTexUV = vec2(x, y);
    float noise = (texture2D(noiseTex, bTexUV).r) * noiseLevel;

    vec4 bTexColor = texture2D(bTex1, bTexUV);
    float brightness = bTexColor.r + vTlThresh1;

    float range = floor(totalNumCells - 1.0);
    float bToIndex = float(floor(brightness * range));
    // clipOutliers

    float row = floor(bToIndex / atlasRowCount);
    float col = mod(bToIndex, atlasColCount);

    float xi = col;
    float yi = row;

    vec2 debugUV = vec2((vUV.x / atlasColCount) + (mod((1.0 / atlasColCount) * xi, 1.0)), (vUV.y / atlasRowCount) + (mod((1.0 / atlasRowCount) * yi, 1.0)));

    gl_FragColor = texture2D(atlasTex, debugUV);
}
