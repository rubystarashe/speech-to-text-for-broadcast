<template>
<div>
  <canvas id="canvas"
    @mousedown.left="touchDown"
    @mousemove="touchMove"
    @mouseup.left="drawEnd"
    @mousedown.right="colorpickerOn"
    @mouseup.right="colorpickerOff"
  />
  <colorpicker
    v-if="colorpickerToggle"
    :position="mouse"
    @changecolor="changecolor"
  />
</div>
</template>

<script>
import colorpicker from './colorpicker'

export default {
  components: {
    colorpicker
  },
  props: [
    'toggle'
  ],
  data() {
    return {
      color: 'red',
      canva_area: null,
      canva: null,
      canva_loc: null,
      mouseToggle: false,
      mouse: {
        x: 0,
        y: 0
      },
      colorpickerToggle: false,
      mousepointer: null
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
    changecolor(c) {
      this.color = c
      this.colorpickerToggle = false
    },
    draw() {
      //this.canva.clearRect(0, 0, this.canva_loc.right, this.canva_loc.bottom)
      this.canva.lineTo(this.mouse_inarea.x, this.mouse_inarea.y)
      this.canva.strokeStyle = this.color
      this.canva.lineWidth = 3
      this.canva.stroke()
    },
    drawEnd() {
      this.mouseToggle = false
      this.canva.closePath();
    },
    clear() {
      this.canva.clearRect(0, 0, this.canva_loc.right, this.canva_loc.bottom)
      this.canva.beginPath()
      this.colorpickerToggle = false
      this.$electron.ipcRenderer.send('mouseIgnoreToggle', true)
    },
    touchDown(e) {
      this.mouseToggle = true
      this.canva.beginPath()
      this.mouse = {
        x: e.pageX,
        y: e.pageY
      }
      this.canva.moveTo(this.mouse_inarea.x, this.mouse_inarea.y)
    },
    touchMove(e) {
      this.mouse = {
        x: e.pageX,
        y: e.pageY
      }
      if (this.mouseToggle) this.draw()
    },
    colorpickerOn(e) {
      this.colorpickerToggle = true
    },
    colorpickerOff(e) {
      this.color = 'red'
      this.colorpickerToggle = false
    }
  },
  mounted() {
    this.canva_area = document.getElementById("canvas")
    this.canva_area.width  = window.innerWidth
    this.canva_area.height = window.innerHeight
    this.canva = this.canva_area.getContext("2d")
    this.canva_loc = this.canva_area.getBoundingClientRect()
    this.canva.imageSmoothingEnabled= false
    
    this.$electron.ipcRenderer.on('canvasReset', (event, mes) => {
      this.clear()
      this.$emit('off', false)
    })
  },
  beforeDestory() {
    this.$electron.ipcRenderer.removeListener('canvasReset', () => {})
  }
}
</script>

<style>
@keyframes blink {
  50% { filter: brightness(.9) }
}

#canvas {
  position: absolute;
  animation: blink .4s linear infinite;
}
</style>