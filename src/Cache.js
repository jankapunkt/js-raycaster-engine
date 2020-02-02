const defaults = {
  keyFunction: val => val,
  limit: 32,
  strict: false
}

/**
 * Simple generic cache to store values by using a function to generate keys.
 * @param keyFunction the function to generate a key by given arguments
 * @param strict optional, defaults to false
 * @param limit optional the maximum size of the cache
 * @constructor
 */

function Cache ({ keyFunction, strict, limit } = {}) {
  this.map = {}
  this.count = 0
  this.strict = strict || defaults.strict
  this.keyFunction = keyFunction || defaults.keyFunction
  this.limit = limit || defaults.limit
}

/**
 * Gets a key by applying arguments to a given key function.
 */

Cache.prototype.key = function (args) {
  return this.keyFunction.apply(this, args)
}

/**
 * Adds a value to the cache. All following arguments are used by the key function
 * to determine the caching key. If this operation exceeds the cache limit, the cache is cleared.
 * @param value the value to be stored
 * @param key the String to use as a store key
 * @throws if strict an error is thrown when a value exists for the generated key
 */

Cache.prototype.add = function (value, key) {
  // const key = this.key(args)
  const keyExists = Object.prototype.hasOwnProperty.call(this.map, key)
  if (this.strict && keyExists) {
    throw new Error(`Expected no value to be present for key <${key}>`)
  }

  // delete the first occurrence in the map
  // that is not our new added key if limit
  // is exceeded by our current size
  if (this.count === this.limit) {
    this.clear()
  }

  this.map[ key ] = value
  if (!keyExists) {
    this.count++
  }
}

/**
 * Returns a value by given key or undefined if none found.
 * @param key The key to access the items
 * @returns {*}
 */

Cache.prototype.get = function (key) {
  return this.map[ key ]
}

/**
 * Returns the size of the cache as integer
 * @return {number}
 * @throws strict mode only: if the internal counter if unequal to the number of items in the map an error is thrown.
 */
Cache.prototype.size = function () {
  if (!this.strict) {
    return this.count
  }

  const keys = Object.keys(this.map).length
  if (keys !== this.count) {
    throw new Error(`Expected size of ${this.count}, got ${keys}`)
  }
  return keys
}

/**
 * Clears the cache and resets the counter.
 */
Cache.prototype.clear = function () {
  for (const key in this.map) {
    delete this.map[ key ]
  }
  this.count = 0
}

/**
 * Clears the cache and removes all references.
 */
Cache.prototype.dispose = function () {
  this.clear()
  delete this.map
  delete this.count
  delete this.strict
  delete this.keyFunction
  delete this.owner
}

export default Cache
