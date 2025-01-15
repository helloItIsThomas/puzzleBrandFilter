WORKING ON FINALIZING OFFSET FEATURES

now single image mode seems to have a working offset feature.
now let's work on mult image mode.

currently, the noise offset slider does not do anything in mult image mode.
That is because, in the vertex shader, the noise bits are only applied if there is only one texture (in single image mode).

so, we need to add noise to the mult.frag shader.
