import Cache from './Cache.js'
import Globals from './Globals.js'
import CanvasBuffer from './CanvasBuffer.js'

function Camera ({ canvas, resolution, focalLength, canvasScale, range, isMobile, scaleFactor }) {
  this.canvas = canvas
  this.ctx = canvas.getContext('2d')
  this.canvasScale = canvasScale || 1
  this.width = canvas.width = window.innerWidth * this.canvasScale
  this.height = canvas.height = window.innerHeight * this.canvasScale

  // projection plane configurable
  this.resolution = resolution
  this.spacing = this.width / resolution
  this.focalLength = focalLength || 0.8
  this.range = range || (isMobile ? 8 : 14)
  this.scale = (this.width + this.height) / (scaleFactor || 1200)
  this.buffer = null
  this.rainEnabled = true

  // caches
  this.key = undefined
  this.rayCache = new Cache()
  this.projectionCache = {}
}

Camera.prototype.update = function (states, player, actors, rayCaster) {
  if (states.map && !this.buffer) {
    const offScreenBuffer = new CanvasBuffer({ width: this.width, height: this.height })
    offScreenBuffer.pre(function (ctx) {
      ctx.filter = 'blur(3px)'
    })
    offScreenBuffer.from(this.canvas)
    offScreenBuffer.post(function (ctx) {
      ctx.filter = 'none'
    })
    this.buffer = offScreenBuffer
  }
  if (!states.map && this.buffer) {
    this.buffer.dispose()
    this.buffer = null
  }

  // cast rays only if player moves, otherwise
  // we just use the rays from the last cast because there
  // is nothing new to be calculated
  const key = player.x.toString() + player.y.toString() + player.direction.toString()
  if (this.key === key) {
    return
  } else {
    this.key = key
  }

  const cachedRays = this.rayCache.get(this.key)
  if (!cachedRays) { //this.rays.length < this.resolution || player.isRotating || player.isMoving) {
    const rays = []
    rays.length = this.resolution
    for (let column = 0; column < this.resolution; column++) {
      const x = column / this.resolution - 0.5
      const angle = Math.atan2(x, this.focalLength)
      const ray = rayCaster.cast(player, player.direction + angle, this.range)
      ray.angle = angle
      rays[ column ] = ray
    }
    this.rayCache.add(rays, this.key)
  }

  // update actors, find actors in view field
  // TODO get math to calculate view field of actor
  // TODO and add calculated values to this.actors
  // TODO which will then be used to draw them in render
}

Camera.prototype.drawFromBuffer = function () {
  this.buffer.to(this.ctx, 0, 0, this.buffer.width, this.buffer.height, 0, 0, this.width, this.height)
}

Camera.prototype.render = function (player, environment, map, rayCaster) {
  // use buffered image for example when
  // a menu is opened, the minimap is opened, etc.
  if (this.buffer) {
    this.drawFromBuffer()
    return
  }
  this.clearBackground()
  this.drawSky(player, environment)
  this.drawColumns(player, environment, map)
//  this.drawActors(player, environment, map)
  // this.drawWeapon(player.weapon, player.paces)
}

Camera.prototype.clearBackground = function () {
  // Store the current transformation matrix
  this.ctx.save();

// Use the identity matrix while clearing the canvas
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.width, this.height);

// Restore the transform
  this.ctx.restore();
}

Camera.prototype.drawSky = function (player,  environment) {
  const sky = environment.sky
  if (!sky || !sky.textures || sky.textures.length === 0) return

  const texture = sky.textures[sky.current]
  const width = texture.width * (this.height / texture.height) * 2
  const left = (player.direction / Globals.CIRCLE) * -width
  const height = (this.height / 1.5) - ((this.height / 1.5) * player.directionV)

  // begin draw
  this.ctx.save()

  // draw from buffer
  if (texture.canvas) {
      texture.to(this.ctx, 0, 0, texture.width, texture.height, left, 0, width, height)
    if (left < width - this.width) {
      texture.to(this.ctx, 0, 0, texture.width, texture.height, left + width -1, 0, width, height)
    }
  }

  // draw from image
  if (texture.image) {
    this.ctx.drawImage(texture.image, 0, 0, texture.width, texture.height, left, 0, width, this.height / 2)
    if (left < width - this.width) {
      this.ctx.drawImage(texture.image, 0, 0, texture.width, texture.height, left + width, 0, width, this.height / 2)
    }
  }

  // optional light effects
  if (environment.light > 0) {
    this.ctx.fillStyle = '#ffffff'
    this.ctx.globalAlpha = environment.light * 0.1
    this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5)
  }

  // end draw
  this.ctx.restore()


}

Camera.prototype.drawColumns = function (player, environment, map) {
  this.ctx.save()
  const rays = this.rayCache.get(this.key)
  for (let i = 0, len = rays.length; i < len; i++) {
    const entry = rays[ i ]
    this.drawColumn(i, entry, player, environment, map)
  }
  this.ctx.restore()
}

Camera.prototype.drawColumn = function (columnIndex, ray, player, environment, map) {
  const ctx = this.ctx
  const left = Math.floor(columnIndex * this.spacing)
  const width = Math.ceil(this.spacing)
  const angle = ray.angle
  let hit = -1
  let projection
  let step
  let alpha
  let groundX

  const wallHeight = 1 // TODO load from height map

  // scanning the current ray by checking if this hit
  // is not facing a wall (where ray.height > 0)
  while (++hit < ray.length && ray[ hit ].height <= 0) {}

  // draw single ray
  for (let s = ray.length - 1; s >= 0; s--) {
    step = ray[ s ]
    projection = this.project(wallHeight, angle, player.directionV, step.distance)
    alpha = Math.max((step.distance + step.shading) / environment.ambient.light - environment.light, 0)

    // TODO draw ceiling if defined in environment
    // if (s > hit) {
    //
    // }

    // we draw the ground from the most bottom step up to the
    // point where the ray has made a hit to the wall
    if (s <= hit) {
      const ground = environment.ground && environment.ground.texture
      if (ground) {
        // if we have a ground texture defined in our environment,
        // we draw it in the same way as we do with our wall textures
        groundX = Math.floor(ground.width * step.offset)
        ctx.globalAlpha = 1

        if (ground.loaded) {
          ctx.drawImage(ground.image, groundX, 0, 1, ground.height, left, projection.bottom, width, projection.height)
        }

        if (ground.isCanvasBuffer) {
          ground.to(ctx, groundX, 0, 1, ground.height, left, projection.bottom, width, projection.height)
        }

        // shadowing effect
        ctx.fillStyle = '#000000'
        ctx.globalAlpha = alpha
        ctx.fillRect( left, projection.bottom, width, projection.height)

      } else {
        // otherwise we draw by a given color and some alpha so we create
        // some sense of a ground here and avoid the color to be just blank
        ctx.fillStyle = (environment.ground && environment.ground.color) || '#000000'
        ctx.globalAlpha = alpha
        ctx.fillRect(left, projection.bottom, width, projection.height)
      }
    }

    if (s === hit) {
      const value = map.get(step.mapx, step.mapy)
      const texture = environment.wall && environment.wall.textures && environment.wall.textures[ value - 1 ]
      if (texture) {
        let textureX = Math.floor(texture.width * step.offset)

        if (texture.loaded) {
          ctx.globalAlpha = 1
          ctx.drawImage(texture.image, textureX, 0, 1, texture.height * wallHeight, left, projection.top, width, projection.height)
        }

        if (texture.canvas) {
          ctx.globalAlpha = 1
          texture.to(ctx, textureX, 0, 1, texture.height * wallHeight, left, projection.top, width, projection.height)
        }
      } else {
        ctx.fillStyle = (environment.wall && environment.wall.color) || '#000000'
        ctx.globalAlpha = 1
        ctx.fillRect(left, projection.top, width, projection.height)
      }

      // applying ambient light
      // to the textures as semi-transparent layer
      // on top of the texture images
      ctx.fillStyle = '#000000'
      ctx.globalAlpha = alpha
      ctx.fillRect(left, projection.top, width, projection.height)
    }

    // draw rain from environment for this column
    // so we can draw more drops on top of a wall
    // by knowing its boundaries and projection
    if (environment.rain && environment.rain.amount && !environment.rain.disabled) {
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = 0.15
      this.rainDrops = Math.pow(Math.random(), 100 - environment.rain.amount) * s
      this.rain = (this.rainDrops > 0) && this.project(0.1, angle, player.directionV, step.distance)
      while (--this.rainDrops > 0) {
        ctx.fillRect(left, Math.random() * this.rain.top, 1, this.rain.height)
      }
    }
  }
}

Camera.prototype.drawActors = function (player, map) {
  const actors = this.actors
  if (actors.length === 0) return

  const ctx = this.ctx
  this.ctx.save()

  ctx.fillStyle = '#ffAA00'
  ctx.globalAlpha = 0.15
  this.actors.forEach(actor => {

  })
  this.ctx.restore()

}

Camera.prototype.drawWeapon = function (weapon, paces) {
  const bobX = Math.cos(paces * 3) * this.scale * 6
  const bobY = Math.sin(paces * 5) * this.scale * 6
  const left = this.width * 0.66 + bobX
  const top = this.height * 0.6 + bobY
  this.ctx.drawImage(weapon.image, left, top, weapon.width * this.scale, weapon.height * this.scale)
}

Camera.prototype.project = function (height, angleH, angleV, distance) {
  const z = distance * Math.cos(angleH)
  const wallHeight = this.height * height / z
  const bottom = this.height / 2 * ((1  - angleV )+ 1 / z)
  this.projectionCache.top = bottom - wallHeight
  this.projectionCache.bottom = bottom
  this.projectionCache.height = wallHeight
  return this.projectionCache
}

Camera.prototype.dispose = function () {
  this.rayCache.dispose()
  delete this.projectionCache
  delete this.ctx
  delete this.canvas
}

export default Camera
