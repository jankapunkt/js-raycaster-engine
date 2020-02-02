import Texture from './Texture.js'
import AudioPlayer from './AudioPlayer.js'
import Globals from './Globals.js'

function Player ({ x, y, direction, health, defaultSpeed, runFactor, sounds }) {
  this.x = x
  this.y = y
  this.isMoving = false
  this.health = health || 100
  this.defaultSpeed = defaultSpeed || 2.7
  this.runFactor = runFactor || 1.5
  this.speed = this.defaultSpeed
  this.direction = direction
  this.directionV = 0
  this.weapon = new Texture('assets/knife_hand.png', 319, 320)
  this.paces = 0
  this.eventDispatcher = new window.EventTarget()
  this.sounds = new AudioPlayer()
  this.sounds.init(sounds)
  this.lockControls = false
}

Player.ON_DEAD = 'onPlayerDead'
Player.ON_DAMAGE = 'onPlayerDamaged'

Player.prototype.on = function (eventName, callback) {
  this.eventDispatcher.addEventListener(eventName, callback)
}

Player.prototype.dispatchEvent = function (name, options) {
  const self = this
  const event = new window.Event(name)
  Object.assign(event, options)
  event.player = self
  this.eventDispatcher.dispatchEvent(event)
}

Player.prototype.damage = function (value, damageSource) {
  const self = this
  self.health -= value
  self.damaged = true
  self.dispatchEvent(Player.ON_DAMAGE, { damagedBy: damageSource })

  if (self.health <= 0) {
    self.dispatchEvent(Player.ON_DEAD, { killedBy: damageSource })
  }
}

Player.prototype.rotateH = function (angle) {
  this.direction = (this.direction + angle + Globals.CIRCLE) % (Globals.CIRCLE)
}

Player.prototype.rotateV = function (amount) {
  if ((amount > 0 && this.directionV > 1) || (amount < 0 && this.directionV < -1)) {
    return
  }
  this.directionV = this.directionV + amount
  if (this.directionV > 1) this.directionV = 1
  if (this.directionV < -1) this.directionV = -1
}

Player.prototype.walk = function (distance, dir, map) {
  const dx = Math.cos(this.direction + dir) * distance
  const dy = Math.sin(this.direction + dir) * distance
  const mapx = map.get(this.x + dx, this.y)
  const mapy = map.get(this.x, this.y + dy)

  if (mapx <= 0) {
    this.x += dx
  }

  if (mapy <= 0) {
    this.y += dy
  }

  this.paces += distance
}

Player.prototype.walkSound = function (isWalking) {
  if (isWalking && !this.walkingSoundPlaying) {
    this.sounds.play('walk', { loop: true })
    this.walkingSoundPlaying = true
  }
  if (!isWalking && this.walkingSoundPlaying) {
    this.sounds.stop('walk')
    this.walkingSoundPlaying = false
  }
}

Player.prototype.runSound = function (isRunning) {
  if (isRunning && !this.runSoundPlaying) {
    this.sounds.play('run', { loop: true, volume: 1 })
    this.runSoundPlaying = true
  }
  if (!isRunning && this.runSoundPlaying) {
    this.sounds.stop('run')
    this.runSoundPlaying = false
  }
}

Player.prototype.update = function (controls, map, seconds) {
  if (controls.map || this.lockControls) {
    this.runSound(false)
    this.walkSound(false)
    this.isMoving = false
    this.isRotating = false
    return
  }

  this.isRotating = false

  if (controls.rotateX) {
    this.rotateH(controls.rotateX / 15 * Math.PI * seconds)
    controls.rotateX = 0
    this.isRotating = true
  }

  if (controls.rotateY) {
    this.rotateV(controls.rotateY / 15 * Math.PI * seconds)
    controls.rotateY = 0
    this.isRotating = true
  }

  if (!controls.left && !controls.right && !controls.forward && !controls.backward) {
    this.runSound(false)
    this.walkSound(false)
    this.isMoving = false
    return
  }

  this.isMoving = true
  let isRunning = false
  let speed = this.speed

  if (controls.run) {
    speed *= this.runFactor
    isRunning = true
  }

  // up
  if (controls.forward && !controls.left && !controls.right) {
    this.walk(speed * seconds, 0, map)
  }

  // down
  if (controls.backward && !controls.left && !controls.right) {
    this.walk(-speed * seconds, 0, map)
  }

  // left
  if (controls.left && !controls.forward && !controls.backward) {
    this.walk(speed * seconds, -Globals.PI_HALF, map)
  }

  // right
  if (controls.right && !controls.forward && !controls.backward) {
    this.walk(speed * seconds, Globals.PI_HALF, map)
  }

  // up left
  if (controls.forward && controls.left) {
    this.walk(speed * seconds, -Globals.PI_QUARTER, map)
  }

  // up right
  if (controls.forward && controls.right) {
    this.walk(speed * seconds, Globals.PI_QUARTER, map)
  }

  // down left
  if (controls.backward && controls.left) {
    this.walk(-speed * seconds, Globals.PI_QUARTER, map)
  }

  // down right
  if (controls.backward && controls.right) {
    this.walk(-speed * seconds, -Globals.PI_QUARTER, map)
  }

  this.runSound(isRunning)
  this.walkSound(!isRunning)
}

export default Player
