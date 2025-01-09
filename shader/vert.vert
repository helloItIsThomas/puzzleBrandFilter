in vec2 aPosition;
in vec2 aUV;
in vec2 aPositionOffset;
in float aIndex;

uniform float vRowCount;
uniform float vColCount;
uniform float vTime;
uniform float manualScale;
uniform float vNoiseLevel;
uniform float clipDarkOutliers;
uniform float clipLightOutliers;
uniform int sD;
uniform int sI;
uniform int cO;
uniform sampler2D bTex1;
uniform sampler2D bTex2;
uniform sampler2D noiseTex;
uniform int numBTexes;

uniform float vCellW;
uniform float vCellH;

out vec2 vUV;
out float vIndex;
out float debugF0;
out float debugF1;
out vec2 debugV0;
out vec2 debugV1;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {

    float clock = vTime;

    float rowCount = vRowCount;
    float colCount = vColCount;

    float totalCells = rowCount * colCount;
    float indexFloat = aIndex * totalCells;
    float x = mod(indexFloat, colCount) / colCount;
    float y = floor(indexFloat / colCount) / rowCount;
    vec2 bTexUV = vec2(x, y);
    float noise = (texture2D(noiseTex, bTexUV).r) * vNoiseLevel;
    vec4 bTexColor = texture2D(bTex1, bTexUV);
    float brightness = bTexColor.r;

    vec2 bTexUV2 = vec2(x, y);
    // bTexUV2 = adjustUV(bTexUV2, bTex2AR);
    vec4 bTexColor2 = texture2D(bTex2, bTexUV2);
    vec4 testLerp = mix(bTexColor, bTexColor2, clock);
    brightness = testLerp.r;

    float modValue = 1.00001;
    // float modValue = 1.0;

        // adding 0.06 to this because i set the borderScaler to 0.95 in createGraphicsForSingleImage(). This resolves the issue we were having with the thin line around each of the modules.
    float scale = mod(manualScale, modValue) + 0.06;

    if(numBTexes == 1) {
        if(sD == 1) {
            scale = mod(vTime + brightness, modValue);
        } else if(sI == 1) {
            scale = mod(vTime, modValue);
        }
        if(brightness < clipDarkOutliers || brightness > 1.0 - clipLightOutliers) {
            //this is sometimes going off when it shouldn't on during page reload and maybe on page resize too.
            scale = 0.25;
        }
    } else if(numBTexes > 1) {
        if(sD == 1) {
            scale = mod(1.0, modValue);
        } else if(sI == 1) {
            scale = mod(1.0, modValue);
        }
    }

    // scale = 0.5;

    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;

    // gl_Position = vec4((mvp * vec3(aPosition * (scale) + aPositionOffset, 1.0)).xy, 0.0, 1.0);
    // aPosition seems to be the position of the first four vertexes.
    // aPositionOffset seems to 

    vec2 d = (vCellW * 0.5) + (aPosition * scale + (aPositionOffset - (vCellW * 0.5 * scale)));

    gl_Position = vec4((mvp * vec3(d, 1.0)).xy, 0.0, 1.0);
    // gl_Position = vec4(0.25, 0.85, 0.0, 1.0);

    vUV = aUV;
    vIndex = aIndex;
    debugF0 = scale;
    debugV0 = aPosition;
    debugV1 = aPositionOffset;

}