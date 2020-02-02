import { describe, it } from 'mocha'
import { assert } from 'chai'
import RayCaster from '../src/RayCaster.js'

const mockMap = (val) => ({ get () { return val || 0 } })

describe('Raycaster', function () {
  describe('constructor', function () {
    it('creates a new instance', function () {
      const map = mockMap()
      const rc = new RayCaster(map)
      assert.isDefined(rc)
      assert.isDefined(rc.cache)
      assert.equal(rc.map, map)
    })
    it('throws if no map is provided', function () {
      assert.throws(function () {
        new RayCaster()
      })
    })
  })
  
  describe('step', function () {
    it ('returns an infinite length for cos of exact 0', function () {
      const map = mockMap(12345)
      const rc = new RayCaster(map)
      const step = rc.step(0,0,0,0,false)
      assert.equal(step.length2, Infinity )
    })

    it ('returns a correct step for a given position and angles')
    it ('returns a correct step for a given inverted position and angles')
  })

  describe('inspect', function () {
    it ('updates a step height, based on the given wall height from the map', function () {
      const map = mockMap(12345)
      const rc = new RayCaster(map)
      const step = { x: 0, y: 0 }
      const inspectedStep = rc.inspect(0, 0, step, 0, 0, 0, 0)
      assert.equal(inspectedStep.height, 12345)
    })

    it ('updates a step distance, based on length2', function () {
      const map = mockMap(12345)
      const rc = new RayCaster(map)
      const step = { length2: 9 }
      const inspected = rc.inspect(0.5, 0.5, step, 1, 0, 9, 1)
      assert.equal(inspected.distance, 12)
    })

    it ('updates a step shading, based on shiftx and shifty')
    it ('updates a step offset, based on offset')
  })

  describe('ray', function () {
    it ('is not yet tested')
  })

  describe('cast', function () {
    it('throws on undefined point, angle or range', function () {
      assert.throws(function () {
        const map = mockMap()
        const rc = new RayCaster(map)
        rc.cast()
      })
    })

    it('casts a ray set by a given point, angle and range', function () {
      const map = mockMap(1)
      const rc = new RayCaster(map)
      const range = 10
      const rays = rc.cast({ x: 0, y: 0 }, 0, range)
      assert.isDefined(rays)
    })

    it('stores the origin in the first entry', function () {
      const map = mockMap(1)
      const rc = new RayCaster(map)
      const range = 20
      const ray = rc.get({ x: 0, y: 0 }, 0, range)
      assert.deepEqual(ray[ 0 ], { x: 0, y: 0, height: 0, distance: 0 })
    })
  })
  describe('get', function () {
    it('returns a cached ray, if it exists', function () {
      const map = mockMap(1)
      const rc = new RayCaster(map)
      const ray = rc.cast({ x: 0, y: 0 }, 0, 10)
      assert.deepEqual(ray, rc.get({ x: 0, y: 0 }, 0, 10))
    })
    it('returns a newly casted ray, if it not yet exists', function () {
      const map = mockMap(1)
      const rc = new RayCaster(map)
      const range = 20
      const ray = rc.get({ x: 0, y: 0 }, 0, range)
      assert.isDefined(ray)
    })
  })

  describe('dispose', function () {
    it('removes references to injected properties', function () {
      const map = mockMap(1)
      const rc = new RayCaster(map)
      rc.dispose()
      assert.isUndefined(rc.map)
      assert.isUndefined(rc.cache)
      // does not however dispose the map data
      assert.isDefined(map)
    })
  })
})