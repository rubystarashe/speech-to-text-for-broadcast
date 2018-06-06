<template>
<div>
  <canvas id="colorpicker"
    @mousemove="mouseOn"
    @mouseup.right="mouseOff"
  />
</div>
</template>

<script>
export default {
  props: [
    'position'
  ],
  data() {
    return {
      img: null,
      canva_area: null,
      canva: null,
      canva_loc: null,
      mouse: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    mouse_inarea() {
      return {
        x: this.mouse.x - this.canva_loc.left,
        y: this.mouse.y - this.canva_loc.top
      }
    }
  },
  methods: {
    setCanva() {
      this.canva_area = document.getElementById("colorpicker")
      this.canva_area.style.top = (this.position.y - (window.innerHeight * 0.1)) + 'px'
      this.canva_area.style.left = (this.position.x - (window.innerHeight * 0.1)) + 'px'
      this.canva_area.width  = window.innerHeight * 0.2
      this.canva_area.height = window.innerHeight * 0.2
      this.canva = this.canva_area.getContext("2d")
      this.canva_loc = this.canva_area.getBoundingClientRect()
      
      this.canva.drawImage(this.img, 0, 0, this.canva_area.width, this.canva_area.height)
    },
    mouseOn(e) {
      this.mouse = {
        x: e.pageX,
        y: e.pageY
      }
    },
    mouseOff(e) {
      const imageData = this.canva.getImageData(this.mouse_inarea.x, this.mouse_inarea.y, 1, 1)
      const pixel = imageData.data
      const pixelColor = 'rgb(' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2]
      this.$emit('changecolor', pixelColor || 'black')
    }
  },
  mounted() {
    this.img = new Image()
    this.img.onload = this.setCanva
    this.img.src = './colorpicker.png'
  }
}
</script>

<style>
#colorpicker {
  position: absolute;
}
</style>