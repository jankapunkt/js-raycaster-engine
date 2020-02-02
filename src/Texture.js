function Texture (src, width, height) {
  this.loaded = false
  this.width = width
  this.height = height
  this.image = undefined

  const self = this
  const image = new window.Image()
  image.onload = function () {
    image.onload = null
    self.image = image
    self.loaded = true
    console.log('loaded', src)
  }
  image.src = src
}

export default Texture
