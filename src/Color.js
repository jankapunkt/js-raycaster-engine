function Color (r = 0, g = 0, b = 0, a = 1) {
  this.r = r
  this.g = g
  this.b = b
  this.a = a
}

Color.random = function (lower = 35) {
  const r = Math.floor(Math.random() * 255) + lower
  const g = Math.floor(Math.random() * 255) + lower
  const b = Math.floor(Math.random() * 255) + lower
  const a  = 1
  return new Color(r, g, b, a)
}

Color.prototype.toArray = function () {
  return [ this.r, this.g, this.b, this.a ]
}

export default Color
