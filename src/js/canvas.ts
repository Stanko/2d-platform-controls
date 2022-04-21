// WIP

const canvas = document.querySelector('canvas');

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  const devicePixelRatio = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  const ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(devicePixelRatio, devicePixelRatio);

  return ctx;
}

const ctx = setupCanvas(canvas);
