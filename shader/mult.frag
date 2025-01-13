precision highp float;

in vec2 vUV;
in float vIndex;

uniform sampler2D hourglassTex;
uniform sampler2D leftCircleTex;
uniform sampler2D rightCircleTex;
uniform sampler2D noiseTex;
uniform sampler2D bTex1;
uniform sampler2D bTex2;
uniform float noiseLevel;

uniform float time;
uniform float gridResolution;
uniform float rowCount;
uniform float colCount;
uniform float cellW;
uniform float cellH;
uniform float hgAR;
uniform float lcAR;
uniform float rcAR;
uniform float bTex1AR;
uniform float bTex2AR;

uniform float tlThresh1;
uniform float tlThresh2;
uniform float tlThresh3;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

float ease(float t, float easeFactor) {
    // Ensure easeFactor is between 0.5 and 2 for reasonable curve control
    easeFactor = mix(0.2, 3.0, easeFactor);
    return pow(t, easeFactor) / (pow(t, easeFactor) + pow(1.0 - t, easeFactor));
}

vec2 adjustUV(vec2 uv, float aspectRatio) {
    if(aspectRatio >= 1.0) {
        uv.x = uv.x * aspectRatio;
    } else {
        uv.y = uv.y * (1.0 / aspectRatio);
    }
    return uv;
}

float aR0 = 0.0;
float aG0 = 0.0;
float aB0 = 0.0;

float a0 = 0.0;
float a1 = 0.0;
float a2 = 0.0;
float a3 = 0.0;

void main() {
    vec2 uv = vUV;
    float totalCells = rowCount * colCount;

    // vIndex is a normalized float that is unique to each geometry instance.
    // 0.0*4, 0.33*4, 0.666*4, 1.0*4
    // 0.0*4, 0.25*4, 0.5*4, 0.75*4
    float indexFloat = vIndex * totalCells; // Scale normalized index to total cells
    // indexFloat = non-normalized geom instance index.
    // 0, 1, 2, 3

    float x = mod(indexFloat, colCount) / colCount;
    // 0%2=(0 / 2) = 0
    // 1%2=(1 / 2) = 0.5
    // 2%2=(0 / 2) = 0
    // 3%2=(1 / 2) = 0.5
    // find the normalized position of each cell's x position.
    float y = floor(indexFloat / colCount) / rowCount;
    // floor(0/2) = 0/2 = 0
    // floor(1/2) = 0/2 = 0
    // floor(2/2) = 1/2 = 0.5
    // floor(3/2) = 1/2 = 0.5
    // ••
    // (0, 0), (0.5, 0), (0, 0.5), (0.5, 0.5)

    float uvX = uv.x * (1.0 / colCount);
    float uvY = uv.y * (1.0 / rowCount);

    vec2 bTexUV = vec2(x + uvX, y + uvY);
    vec4 bTexColor = texture2D(bTex1, bTexUV);
    a0 += bTexColor.r;
    a1 += bTexColor.g;
    a2 += bTexColor.b;

    vec2 bTexUV2 = vec2(x, y);
    vec4 bTexColor2 = texture2D(bTex2, bTexUV2);

    // ••••
    // ••••
    // ••••

    float noise = texture2D(noiseTex, bTexUV).r * noiseLevel;
    float sharp = 2.0;
    float backForthClock = sin(time + noise);
    backForthClock = atan(sharp * backForthClock) / atan(sharp);
    backForthClock = map(backForthClock, -1.0, 1.0, 0.0, 1.05);
    float clock = backForthClock;

    // vec4 mixedColor = mix(bTexColor, bTexColor2, clock);
    // t set to 1 for debug
    vec4 mixedColor = mix(bTexColor, bTexColor2, 1.0);
    float brightness = mixedColor.r;

    // ••••

    // Apply offsets to the UV coordinates
    vec2 hgUV = vUV / vec2(hgAR, 1.0);
    vec2 lcUV = vUV / vec2(lcAR, 1.0);
    vec2 rcUV = vUV / vec2(rcAR, 1.0);

    float lcUV_x;
    float hgUV_x;
    float rcUV_x;

    float point1 = tlThresh1; //0.2; 0.0
    float point2 = tlThresh2; //0.4; 0.0
    float point3 = tlThresh3; //0.8; 0.0

    // Map brightness to lcUV.x (0.0 to 0.25 for brightness 0.0 to 0.25)
    if(brightness <= point1) {
        lcUV_x = brightness / point1 * point1;
    } else {
        lcUV_x = point1;
    }

    // Map brightness to hgUV.x (0.0 to 0.5 for brightness 0.25 to 0.6)
    if(brightness > point1 && brightness <= point2) {
        hgUV_x = (brightness - point1) / (point2 - point1) * 0.5;
    } else if(brightness > point2) {
        // hgUV_x = 0.5;
        hgUV_x = 0.55;
    } else {
        hgUV_x = 0.0;
    }

    // Map brightness to rcUV.x
    if(brightness > point1 && brightness <= point2) {
    // Map 0.25 - 0.4 brightness to 0.0 - 0.25 rcUV.x
        rcUV_x = (brightness - point1) / (point2 - point1) * point1;
    } else if(brightness > point2 && brightness <= point3) {
    // Keep rcUV_x constant at 0.25 in the mid-range to prevent snapping
        rcUV_x = point1;
    } else if(brightness > point3) {
    // Map 0.6 - 1.0 brightness to 0.25 - 1.0 rcUV.x
        rcUV_x = point1 + (brightness - point3) / (1.0 - point3) * 0.75;
    } else {
        rcUV_x = 0.0;
    }

    hgUV.x = hgUV.x + hgUV_x;
    lcUV.x = lcUV.x + 0.125 + lcUV_x;
    rcUV.x = rcUV.x - 0.125 + rcUV_x;

    // Sample each texture with its own offset
    vec4 hourglass = texture2D(hourglassTex, hgUV);
    vec4 leftCircle = texture2D(leftCircleTex, lcUV);
    vec4 rightCircle = texture2D(rightCircleTex, rcUV);

    // gl_FragColor = rightCircle + leftCircle;
    // gl_FragColor = hourglass;
    // gl_FragColor = hourglass + rightCircle + leftCircle;
    vec3 dc = bTexColor.rgb;
    // vec3 dc = averageColor.rgb;
    // gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
    gl_FragColor = vec4(dc.r, dc.g, dc.b, 1.0);
}
