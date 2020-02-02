const defaultCodes = {
  a: 'left',
  d: 'right',
  w: 'forward',
  s: 'backward',
  x: 'map',
  'shift': 'run'
}
const defaultMouse = {
  sensitivity: 50
}

function Controls (codes, mouseSensitivity) {
  this.codes = codes || defaultCodes
  this.states = {
    'left': false,
    'right': false,
    'forward': false,
    'backward': false,
    'run': false,
    'map': false,
    'rotateX': 0,
    'rotateY': 0
  }
  this.mouseSensitivity = mouseSensitivity || defaultMouse.sensitivity
  window.document.addEventListener('keydown', this.onKey.bind(this, true), false)
  window.document.addEventListener('keyup', this.onKey.bind(this, false), false)
  window.document.addEventListener('mousemove', this.onMousemove.bind(this), false)
}

Controls.prototype.onMousemove = function (e) {
  const negx = e.movementX < 0 ? -1 : 1
  const negy = e.movementY < 0 ? -1 : 1
  const absX = Math.abs(e.movementX)
  const absY = Math.abs(e.movementY)
  const x = absX > this.mouseSensitivity
    ? this.mouseSensitivity
    : absX
  const y = absY > this.mouseSensitivity
    ? this.mouseSensitivity
    : absY
  this.states.rotateX = x * negx
  this.states.rotateY = y * negy
  e.preventDefault()
  e.stopPropagation()
}

Controls.prototype.onKey = function (val, e) {
  const state = this.codes[ e.key.toLowerCase() ]
  if (typeof state === 'undefined') return
  this.states[ state ] = val
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
}

export default Controls
