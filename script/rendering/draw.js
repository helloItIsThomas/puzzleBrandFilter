import { sv } from "../utils/variables.js";

export function draw() {
  if (sv.triangleMesh && sv.workerDone) {
    const uniforms = sv.triangleMesh.shader.resources.waveUniforms.uniforms;

    uniforms.tlThresh1 = sv.tlThresh1;
    uniforms.tlThresh2 = sv.tlThresh2;
    uniforms.tlThresh3 = sv.tlThresh3;
    uniforms.vTlThresh1 = sv.tlThresh1;
    uniforms.vTlThresh2 = sv.tlThresh2;
    uniforms.vTlThresh3 = sv.tlThresh3;

    if (!sv.oneActiveImage) {
      // uniforms.time = sv.pauseClock;
      uniforms.time = sv.clock;
      uniforms.vTime = 1.0;
    } else {
      if (sv.params.startInvisible) {
        uniforms.time = sv.clock;
        uniforms.vTime = sv.clock;
      } else {
        uniforms.time = sv.clock;
        uniforms.vTime = sv.clock;
      }
    }
  }
}
