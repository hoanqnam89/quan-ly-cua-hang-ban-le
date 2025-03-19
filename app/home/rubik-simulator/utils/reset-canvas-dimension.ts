export const resetCanvasDimension = (canvas: HTMLCanvasElement): void => {
  canvas.width = canvas?.offsetWidth;
  canvas.height = canvas?.offsetHeight;
}
