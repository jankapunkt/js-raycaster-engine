import { describe, it } from 'mocha'
import { assert } from 'chai'
import Cache from '../src/Cache.js'

const keyFunction = num => num * 2
const create = (options = {}) => {
  options.keyFunction = keyFunction
  return new Cache(options)
}

describe('Cache', function () {
  describe('constructor', function () {
    it('can be created using no parameters', function () {
      const cache = new Cache()
      assert.isDefined(cache)
      assert.equal(cache.keyFunction(123456), 123456)
      assert.equal(cache.size(), 0)
      assert.equal(cache.strict, false)
    })

    it('can be created using a custom key function', function () {
      const cache = create()
      assert.equal(cache.keyFunction(100), 200)
    })

    it('can be created with strict option', function () {
      const cache = create({ strict: true })
      assert.equal(cache.strict, true)
    })
  })

  describe('add', function () {
    it('adds a new value by given keys', function () {
      const expected = 'foo bar'
      const cache = create()
      assert.equal(cache.size(), 0)
      cache.add(expected, 0)
      assert.equal(cache.size(), 1)
      assert.equal(cache.map[ 0 ], expected)
    })
    it('throws in strict mode when value already exists', function () {
      const expected = 'foo bar'
      const cache = create({ strict: true })
      cache.add(expected, 0)
      assert.throws(function () {
        cache.add('something else', 0)
      })
      assert.equal(cache.map[ 0 ], expected)
    })
    it('overrides value in non-strict mode when value already exists', function () {
      const old = 'foo bar'
      const expected = 'something else'
      const cache = create({ strict: false })
      cache.add(old, 0)
      cache.add(expected, 0)
      assert.equal(cache.map[ 0 ], expected)
      assert.equal(cache.size(), 1)
    })
  })

  describe('get', function () {
    it('returns the value by given key if it exists', function () {
      const expected = 'something else'
      const cache = create()
      cache.add(expected, 1001)
      assert.equal(cache.get(1001), expected)
    })
    it('returns undefined by given key if it not exists', function () {
      const cache = create()
      cache.add('foo bar', 1001)
      assert.isUndefined(cache.get(1000))
      assert.isUndefined(cache.get())
    })
  })

  describe('size', function () {
    it('returns the amount of the added values', function () {
      const cache = create()
      assert.equal(cache.size(), 0)
      const amount = Math.floor(Math.random() * cache.limit)
      for (let i = 0; i < amount; i++) {
        cache.add(i, i)
      }
      assert.equal(cache.size(), amount)
    })

    it('checks the keys as size in strict mode', function () {
      const cache = create({ strict: true })
      assert.equal(cache.size(), 0)
      const amount = Math.floor(Math.random() * cache.limit)
      for (let i = 0; i < amount; i++) {
        cache.add(i, i)
      }
      assert.equal(cache.size(), amount)
    })

    it('throws if there is a mismatch between keys and size in strict mode', function () {
      const cache = create({ strict: true })
      assert.equal(cache.size(), 0)
      const amount = Math.floor(Math.random() * cache.limit)
      for (let i = 0; i < amount; i++) {
        cache.add(i, i)
      }
      delete cache.map[ 0 ]
      assert.throws(function () {
        cache.size()
      }, `Expected size of ${amount}, got ${amount - 1}`)
    })
  })

  describe('memory leak prevention', function () {
    it('clears if the limit has been exceeded', function () {
      const cache = create({ strict: true })
      assert.equal(cache.size(), 0)
      const amount = cache.limit + 1

      for (let i = 0; i < amount; i++) {
        cache.add(i, i)
      }
      console.log(cache.size(), cache.count, cache.map)
      assert.equal(cache.size(), 1)
    })
  })

  describe('dispose', function () {
    it('removes all references from the map', function () {
      const cache = create({ strict: false })
      assert.equal(cache.size(), 0)
      const amount = Math.floor(Math.random() * cache.limit)
      let i
      for (i = 0; i < amount; i++) {
        cache.add(i, i)
      }

      const map = cache.map
      for (i = 0; i < amount; i++) {
        assert.equal(map[ i ], i)
      }

      cache.dispose()
      for (i = 0; i < amount; i++) {
        assert.isUndefined(map[ i ])
      }

      assert.isUndefined(cache.map)
      assert.isUndefined(cache.count)
      assert.isUndefined(cache.strict)
      assert.isUndefined(cache.keyFunction)
    })
  })
})