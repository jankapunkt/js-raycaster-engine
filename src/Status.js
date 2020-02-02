import Player from './Player.js'

function Status ({ canvas, width, height }) {
  this.canvas = canvas
  this.width = canvas.width = width || window.innerWidth
  this.height = canvas.height = height || window.innerHeight
  this.ctx = canvas.getContext('2d')
  this.shouldRender = false
  this.damageTimeDefault = 0.5 // seconds
}

Status.prototype.register = function (player) {
  player.on(Player.ON_DAMAGE, function (event) {
    const player = event.player
    const damagedBy = event.damagedBy
    this.damaged(player, damagedBy)
  })
}

Status.prototype.damaged = function (actor, damageSource) {
  this.damageTime = this.damageTimeDefault
  this.isDamaged = true
  this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
  this.ctx.fillRect(0, 0, this.width, this.height)
}

Status.prototype.update = function (states, delta) {
  if (this.damageTime > 0) {
    console.log(delta)
    this.damageTime -= delta
  } else if (this.isDamaged) {
    this.isDamaged = false
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}

Status.prototype.render = function () {}

export default Status
