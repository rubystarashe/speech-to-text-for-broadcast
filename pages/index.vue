<template>
<div>
  <div id="whiteboard" :style="{ background: whiteboardToggle ? 'white' : 'none'}"></div>
  <canvasArea id="canvasArea" :toggle="canvasToggle" @off="canvasToggleOff"/>
  <div id="area">
    <div class="text" v-if="!socketToggle && textToggle">기다리는 중입니다... 현재 열려있는 포트: {{port}}</div>
    <div v-else-if="textToggle" class="text hidden" v-for="m in mes" :key="m">{{m}}</div>
  </div>
  <div :style="{ opacity: mousepointToggle ? 1 : 0 }" id="mousepointer"></div>
</div>
</template>

<style>
body {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
}
#whiteboard {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}
#canvasArea {
  position: fixed;
}
#area {
  position: absolute;
  bottom: 10%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  font-size: 4vh;
  pointer-events: none;
}
.text {
  text-align: center;
  background: black;

  box-shadow: 1vh 0 0 black, -1vh 0 0 black;
  pointer-events: none;
}
@keyframes hidden {
  0% { opacity: 1 }
  100% { opacity: 0 }    
}
.hidden {
  animation: hidden 1s 5s forwards;
}
#mousepointer {
  position: fixed;
  width: 2vh;
  height: 2vh;
  border: .3vh solid red;
  border-radius: 50%;
  pointer-events: none;
}
</style>

<script>
import canvasArea from '~/components/canvas'

export default {
  components: {
    canvasArea
  },
  data() {
    return {
      port: null,
      socketToggle: false,
      mes: [],
      canvasToggle: false,
      mouse: {},
      mousepointToggle: false,
      whiteboardToggle: false,
      textToggle: true
    }
  },
  watch: {
    mouse: function() {
      this.mousepointer = document.getElementById("mousepointer")
      this.mousepointer.style.top = (this.mouse.y - (window.innerHeight * 0.013)) + 'px'
      this.mousepointer.style.left = (this.mouse.x - (window.innerHeight * 0.013)) + 'px'
    }
  },
  methods: {
    canvasToggleOff() {
      this.canvasToggle = false
    }
  },
  mounted() {
    this.port = location.port
    
    this.$electron.ipcRenderer.on('socketToggle', (event, mes) => {
      this.mes = []
      this.socketToggle = mes
    })
		this.$electron.ipcRenderer.on('record', (event, mes) => {
      if (this.mes.length > 200) this.mes = []
      this.mes.push(mes.replace(/^ /gi, ''))
    })
    this.$electron.ipcRenderer.on('canvasToggle', (event, mes) => {
      this.canvasToggle = mes
      if(!mes) {
        this.$electron.ipcRenderer.send('whiteboardToggle', false)
        this.whiteboardToggle = false
      }
    })
    this.$electron.ipcRenderer.on('mousepointToggle', (event, mes) => {
      this.mousepointToggle = !this.mousepointToggle
    })
    this.$electron.ipcRenderer.on('textToggle', (event, mes) => {
      this.textToggle = !this.textToggle
    })
    this.$electron.ipcRenderer.on('mouse', (event, mes) => {
      this.mouse = mes
    })
    this.$electron.ipcRenderer.on('whiteboardToggle', (event, mes) => {
      if(mes) {
        this.$electron.ipcRenderer.send('mouseIgnoreToggle', false)
        this.canvasToggle = true
      } else {
        this.$electron.ipcRenderer.send('mouseIgnoreToggle', true)
        this.canvasToggle = false
      }
      this.whiteboardToggle = mes
    })
  },
  beforeDestroy() {
    this.$electron.ipcRenderer.removeListener('socketToggle', () => {})
    this.$electron.ipcRenderer.removeListener('record', () => {})
    this.$electron.ipcRenderer.removeListener('mouseIgnoreToggle', () => {})
    this.$electron.ipcRenderer.removeListener('mousepointToggle', () => {})
    this.$electron.ipcRenderer.removeListener('mouse', () => {})
    this.$electron.ipcRenderer.removeListener('whiteboardToggle', () => {})
  }
}
</script>
