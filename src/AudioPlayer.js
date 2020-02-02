/**
 * Simple controller to handle audio actions.
 * @constructor
 */

function AudioPlayer () {
  this.sounds = {}
}

/**
 * Loads the sounds and binds events if any.
 * @param sources
 */

AudioPlayer.prototype.init = function (sources) {
  sources.forEach(({ id, url, listeners }) => {
    const audio = new window.Audio(url)
    this.sounds[ id ] = { url, audio: audio }
    if (listeners) {
      this.on(id, listeners)
    }
  })
}

/**
 * Adds event listeners to a sound by id. The listeners need to be an object of type {{[eventname]: Function}} pairs.
 * @param id The id of the sound
 * @param listeners The key value map Object for the events to listen and handle.
 */

AudioPlayer.prototype.on = function (id, listeners) {
  const sound = this.sounds[ id ]
  if (!sound) return
  if (!sound.listeners) sound.listeners = {}

  const audio = sound.audio
  Object.keys(listeners).forEach(eventName => {
    // attach event listener to audio
    const handler = listeners[ eventName ]
    audio.addEventListener(eventName, handler)

    // if we have already listeners for this event name
    // we just push it to the list, otherwise we create it
    if (sound.listeners[ eventName ]) {
      sound.listeners[ eventName ].push(handler)
    } else {
      sound.listeners[ eventName ] = [ handler ]
    }
  })
}

/**
 * Removes listeners by id
 * @param id
 * @param listeners
 */

AudioPlayer.prototype.off = function (id, listeners) {
  const sound = this.sounds[ id ]
  if (!sound || !sound.listeners) return

  const audio = sound.audio
  Object.keys(listeners).forEach(eventName => {
    // skip if there is no handler registered
    if (!sound.listeners[ eventName ]) {
      return
    }

    const handler = listeners[ eventName ]
    const handlerIndex = sound.listeners[ eventName ].indexOf(handler)

    // if this specific handler is not registered, we just skip here
    if (handler && handlerIndex === -1) {
      return
    }

    // if we have a handler, we remove only this one
    // otherwise we remove all handlers
    if (handler) {
      audio.removeEventListener(eventName, handler)
      sound.listeners[ eventName ].splice(handlerIndex, 1)
    } else {
      sound.listeners[ eventName ].forEach(anyHandler => audio.removeEventListener(eventName, anyHandler))
    }
  })

}

/**
 * Plays a sound by a given id and with given options
 * @param id The id of the sound to be played
 * @param volume optional - the volume of the sound
 * @param loop optional - loops the sound if true
 */

AudioPlayer.prototype.play = function (id, { volume, loop } = {}) {
  const sound = this.sounds[ id ]
  if (!sound) return
  if (volume) sound.audio.volume = volume
  if (loop) sound.audio.loop = loop
  sound.audio.play()
}

AudioPlayer.prototype.volume = function (id, value) {
  const sound = this.sounds[ id ]
  if (!sound) return
  sound.audio.volume = value
}

/**
 * Pauses a sound by given id
 * @param id The id of the sound
 */

AudioPlayer.prototype.pause = function (id) {
  const sound = this.sounds[ id ]
  if (!sound) return
  sound.audio.pause()
}

/**
 * Stops a sound by a given id. It pauses the sound and resets the time pointer to 0.
 * @param id Te id of the sound
 */

AudioPlayer.prototype.stop = function (id) {
  const sound = this.sounds[ id ]
  if (!sound) return
  sound.audio.pause()
  sound.audio.currentTime = 0
}

/**
 * Removes all event listeners from a sound and deletes it from the dictionary to allow GC to mark it.
 * @param id The id of the sound
 */

AudioPlayer.prototype.dispose = function (id) {
  if (id) {
    const sound = this.sounds[ id ]
    if (!sound) {
      console.warn('could not dispose sound by id', id)
      return
    }
    this.stop(id)
    if (sound.listeners) {
      this.off(id, sound.listeners)
    }
    sound.audio = null
    delete this.sounds[ id ]
  } else {
    // dispose all
    Object.keys(this.sounds).forEach(key => {
      this.dispose(key)
    })
  }
}

export default AudioPlayer
