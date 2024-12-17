good afternoon :)

today, i would like to use a web worker to do the heavy lifting that the populateGrid method is currently doing on the main thread.

Let's determine if it is feasible for the web worker to do the entire populateGrid method, given that it doesn't have dom access or access to p5js.

BEFORE THE LOOP:
We convert the image passed to populateGrid (a resized and greyscale version of the background image) to a canvas(?) so that we can use getImageData on it

We create a vanilla OffscreenCanvas instead of a p5 graphicsObject.

IN THE LOOP:
We replace the get function with the getImageData method of our context.

We use a new implementation of our calculateAverageBrightness function.

We set the pixel color to our offscreenCanvas using vanilla js.
We push our values to the cells array.


We pass the cells array with our tempCanvas back to the main thread.

We assign our tempCanvas to this.brightnessTex.
We replace our this.cells array with our new cells array.