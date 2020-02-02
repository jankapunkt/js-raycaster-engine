import Cache from './Cache.js'

const isUndefined = x => x === null || typeof x === 'undefined'
const throwUndefined = x => {
  if (isUndefined(x)) {
    throw new Error(`Unexpected undefined`)
  }
}

const defaults = {
  keyFunction: (x, y, angle, range) => `${x};${y};${angle};${range}`
}

class Ray extends Array {}

function RayCaster (map) {
  if (!map) throw new Error(`Expected map, got undefined or null`)
  this.map = map

  // caches
  this.cache = new Cache({strict: true})
  this.origin = { height: 0, distance: 0 }
  this.noWall = () => ({ length2: Infinity })
}

RayCaster.prototype.inspect = function (sin, cos, step, shiftX, shiftY, distance, offset) {
  const dx = cos < 0 ? shiftX : 0
  const dy = sin < 0 ? shiftY : 0
  step.mapx = step.x - dx
  step.mapy = step.y - dy
  step.height = this.map.get(step.mapx, step.mapy) ? 1 : 0
  step.distance = distance + Math.sqrt(step.length2)
  if (shiftX) {
    step.shading = cos < 0 ? 2 : 0
  } else {
    step.shading = sin < 0 ? 2 : 1
  }
  step.offset = offset - Math.floor(offset)
  return step
}

RayCaster.prototype.step = function step (rise, run, x, y, inverted) {
  // no wall detectable
  if (run === 0) {
    return this.noWall()
  }

  const dx = run > 0
    ? Math.floor(x + 1) - x
    : Math.ceil(x - 1) - x
  const dy = dx * (rise / run)

  return {
    x: inverted ? y + dy : x + dx,
    y: inverted ? x + dx : y + dy,
    length2: dx * dx + dy * dy
  }
}

RayCaster.prototype.ray = function ray (list, origin, range, sin, cos) {
  const self = this
  const stepX = self.step(sin, cos, origin.x, origin.y)
  const stepY = self.step(cos, sin, origin.y, origin.x, true)
  const nextStep = stepX.length2 < stepY.length2
    ? self.inspect(sin, cos, stepX, 1, 0, origin.distance, stepX.y)
    : self.inspect(sin, cos, stepY, 0, 1, origin.distance, stepY.x)

  list.push(origin)
  if (nextStep.distance > range) {
    return list
  }
  return self.ray(list, nextStep, range, sin, cos)
}

RayCaster.prototype.cast = function (point, angle, range) {
  throwUndefined(point)
  throwUndefined(angle)
  throwUndefined(range)
  const self = this
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)
  this.origin.x = point.x
  this.origin.y = point.y
  const list = new Ray()
  return self.ray(list, this.origin, range, sin, cos)
}

RayCaster.prototype.get = function (point, angle, range) {
  this.key = defaults.keyFunction(point.x, point.y, angle, range)
  //const cached = this.cache.get(this.key)
  //if (cached) {
  //  return cached
  //}

  const ray = this.cast(point, angle, range)
  //this.cache.add(ray, this.key)
  //if (this.cache.count % 10 === 0) console.log(this.cache.size())
  return ray
}

RayCaster.prototype.dispose = function () {
  delete this.map

  this.cache.dispose()
  delete this.cache
  delete this.origin
  delete this.noWall
}

export default RayCaster
