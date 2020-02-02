import { describe, it } from 'mocha'
import { assert } from 'chai'
import Map from '../src/Map'

const data = [
  1, 1, 1, 1,
  1, 0, 0, 1,
  1, 0, 0, 1,
  1, 1, 1, 1
]

const create = ({ width, height, data }) => new Map({ data, width, height })
const dataEquals = (map) => {
  for (let i = 0; i < data.length; i++) {
    assert.equal(data[i], map.data[i])
  }
}

describe('Map', function () {
  describe('constructor', function () {
    it ('can be constructed without parameters', function () {
      const map = new Map()
      assert.isDefined(map)
      assert.equal(map.width, Map.defaults.width)
      assert.equal(map.height, Map.defaults.height)
      assert.equal(map.size, map.width * map.height)
    })

    it ('can be constructed by given data', function () {
      const map = create({ width: 4, height: 4, data: data })
      assert.equal(map.width, 4)
      assert.equal(map.height, 4)
      assert.equal(map.size, 16)
      dataEquals(map)
    })
  })

  describe ('load', function () {
    it ('loads data into the map', function () {
      const map = new Map({ width: 4, height: 4 })
      map.load(data)
      dataEquals(map)
    })
  })

  describe ('get', function () {
    it ('returns the value at an xy index', function () {
      const map = create({ width: 4, height: 4, data })
      for (let i = 0; i< 4; i++) {
        for (let k = 0; k < 4; k++) {
          assert.isNotNull(map.get(i, k))
        }
      }
    })

    it ('returns explicitly null if a value is not found', function () {
      const map = create({ width: 4, height: 4, data })
      assert.isNull(map.get())
      assert.isNull(map.get(-10, 10))
      assert.isNull(map.get(10, 10))
    })
  })

  describe ('set', function () {
    it ('sets the value at an xy index', function () {
      const map = create({width: 4, height: 4})
      for (let i = 0; i< 4; i++) {
        for (let k = 0; k < 4; k++) {
          const value = data[k * 4 + i]
          const setValue = map.set(i, k, value)
          assert.equal(setValue, value)
        }
      }
      dataEquals(map)
    })

    it ('returns null if the position is invalid', function () {
      const map = create({ width: 4, height: 4, data })
      assert.isNull(map.set())
      assert.isNull(map.set(-10, 10))
      assert.isNull(map.set(10, 10))
    })
  })

  describe ('randomize', function () {
    it ('generates a random map', function () {
      const map = create({ width: 4, height: 4 })
      map.randomize()
      for (let i = 0; i< map.size; i++) {
        assert.isDefined(map.data[i])
        assert.isNotNull(map.data[i])
        assert.isTrue('number' === typeof  map.data[i])
      }
    })
  })
})