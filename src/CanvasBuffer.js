/**
 * Allows to draw to/from an offscreen canvas.
 * @param alpha Disable if you know that there will be no alpha channel required
 * @param width width of the offscreen canvas
 * @param height height of the offscreen canvas
 * @constructor
 */

function CanvasBuffer ({ alpha = true, width, height, canvas } = {}) {
  this.canvas = canvas || document.createElement('canvas')
  this.canvas.width = width
  this.canvas.height = height
  this.width = width
  this.height = height
  this.isCanvasBuffer = true
  this.ctx = this.canvas.getContext('2d', { alpha })
}

/**
 * Disposes the current buffer's canvas and context
 */

CanvasBuffer.prototype.dispose = function () {
  this.ctx = null
  this.canvas = null
}

/**
 * Transforms the context by a given function.
 * The context is passed of the buffer is passed
 * as only parameter
 * @type {function(context): *}
 */

CanvasBuffer.prototype.post = CanvasBuffer.prototype.pre = function (fct) {
  return fct(this.ctx, this.canvas)
}

/**
 * Draws the current frame of a canvas into the buffer
 * @param onScreenCanvas
 */

CanvasBuffer.prototype.from = function (onScreenCanvas) {
  this.ctx.drawImage(onScreenCanvas, 0, 0)
}

/**
 * Draws the buffer into the canvas
 * @param onScreenContext
 */

CanvasBuffer.prototype.to = function (onScreenContext, sx, sy, sw, sh, dx, dy, dw, dh) {
  onScreenContext.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh)
}

export default CanvasBuffer
