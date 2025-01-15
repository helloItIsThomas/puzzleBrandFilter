Ok,
time to work on either optimizing the brightness averaging, or moving it to another thread via web workers.
I have spent a lot of time on moving it to another thread,
so i will try to optimize it first.

I am doing two things of note in Stills.js after the web worker is finished:
• looping through the cells and drawing them to their own canvas.
• calculating the average color of each of these canvases.
also
• creating a single new canvas, then going through the cells and drawing their average color to it.
This bit can very likely be optimized by using the putImageData method.

What are we trying to do here?
Separate all pixels into cells.
Calculate the average color of each cell.
Draw the average color of each cell to a new canvas.

This means we can likely remove the drawing of cells to their own canvas.
Instead we can probably keep them as an array.
