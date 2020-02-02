import AudioPlayer from './AudioPlayer.js'

const defaults = {
  thunder: {
    volume: 0.5,
    seed: 8
  }
}

function Environment ({ sky, wall, ground, light, rain, thunder, ambient } = 0) {
  this.light = 0

  this.rain = rain
  this.thunder = thunder
  this.ambient = ambient

  const sounds = []
  if (rain && rain.sound) sounds.push(rain.sound)
  if (thunder && thunder.sound) sounds.push(thunder.sound)
  if (ambient && ambient.sound) sounds.push(ambient.sound)

  this.sounds = new AudioPlayer()
  this.sounds.init(sounds)

  // textures
  this.sky = sky
  this.wall = wall
  this.ground = ground
}

Environment.prototype.update = function (seconds) {
  if (this.thunder && this.thunder.volume > 0) {
    if (this.light > 0) {
      this.light = Math.max(this.light - 10 * seconds, 0)
    } else if (Math.random() * (this.thunder.seed || defaults.thunder.seed) < seconds) {
      this.sounds.play(this.thunder.sound.id, { volume: this.thunder.sound.value || this.thunder.volume || defaults.thunder.volume })
      this.light = 2
    }
  }
}

Environment.prototype.dispose = function () {
  this.sounds.dispose()
}

export default Environment
