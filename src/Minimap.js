function Minimap ({ canvas, map, scale, background, wallColor, actorColor }) {
  this.canvas = canvas
  this.ctx = canvas.getContext('2d')
  this.canvas.width = map.width * scale
  this.canvas.height = map.height * scale
  this.map = map
  this.scale = scale || 1
  this.bg = background || '#FFFFFF'
  this.wallColor = wallColor || '#A4A4A4'
  this.actorColor = actorColor || '#4A4A4A'
  this.key = ''
  this.debug = false
}

Minimap.prototype.update = function (state, player) {
  if (state.map) {
    this.drawActive = true
    this.x = player.x
    this.y = player.y
    this.direction = player.direction
    this.key = player.x.toString() + player.y.toString() + player.direction.toString()
  }

  if (!state.map && this.drawActive) {
    this.drawActive = false
    this.clear()
  }
}

Minimap.prototype.clear = function () {
  const ctx = this.ctx
  const map = this.map
  const mapWidth = map.width
  const mapHeight = map.height
  const scale = this.scale
  ctx.clearRect(0, 0, mapWidth * scale, mapHeight * scale)
}

Minimap.prototype.render = function ({ rayCache, threshold = 1 } = {}) {
  if (!this.drawActive) return

  const ctx = this.ctx
  const map = this.map
  const mapWidth = map.width
  const mapHeight = map.height
  const scale = this.scale

  ctx.clearRect(0, 0, mapWidth * scale, mapHeight * scale)

  // draw background as rect
  ctx.fillStyle = this.bg
  ctx.strokeStyle = this.wallColor
  ctx.rect(0, 0, mapWidth * scale, mapHeight * scale)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = 'none'

  // Loop through all blocks on the map
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const wall = map.get(x, y)
      if (wall >= threshold) {
        ctx.fillStyle = this.wallColor
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
  }

  // player as mini square
  ctx.fillStyle = this.actorColor
  ctx.fillRect(this.x * scale - 2, this.y * scale - 2, 4, 4)

  // player direction
  ctx.beginPath()
  ctx.strokeStyle = this.actorColor
  ctx.moveTo(this.x * scale, this.y * scale)
  ctx.lineTo((this.x + Math.cos(this.direction) * 4) * scale, (this.y + Math.sin(this.direction) * 4) * scale)
  ctx.closePath()
  ctx.stroke()

  // rays casted
  const rays = rayCache && rayCache.get(this.key)
  if (rays) {
    let len = rays.length
    let i
    let k
    let ray
    let step
    let hit
    for (i = 0; i < rays.length; i++) {
      if (i % 10 !== 0) continue
      ray = rays[ i ]
      for (k = 0; k < ray.length; k++) {
        step = ray[ k ]
        if (step.height !== 1) continue
        ctx.beginPath()
        ctx.strokeStyle = this.actorColor
        ctx.moveTo(this.x * scale, this.y * scale)
        ctx.lineTo((step.x) * scale, (step.y) * scale)
        ctx.closePath()
        ctx.stroke()
        break
      }
    }
  }

  ctx.fillStyle = this.bg
}

export default Minimap
