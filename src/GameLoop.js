function GameLoop ({ fpsHandler } = {}) {
  this.frame = this.frame.bind(this)
  this.lastTime = 0
  this.fpsRatio = 60 / 1000
  this.updateCallback = () => {}
  this.renderCallback = () => {}
  this.fpsHandler = fpsHandler
  this.update = true
}

GameLoop.prototype.start = function (updateCallback, renderCallback) {
  this.updateCallback = updateCallback
  this.renderCallback = renderCallback
  window.requestAnimationFrame(this.frame)
}

GameLoop.prototype.pause = function () {
  this.pause = true
}

GameLoop.prototype.stop = function () {
  this.stopped = true
}

GameLoop.prototype.frame = function (time) {
  const seconds = (time - this.lastTime) / 1000
  this.lastTime = time

  if (seconds < 0.2) {
    this.updateCallback(seconds)
    this.renderCallback(seconds)
  } else {
    console.log('skip render', seconds)
  }

  if (!this.stopped) {
    window.requestAnimationFrame(this.frame)
  }
}

export default GameLoop
