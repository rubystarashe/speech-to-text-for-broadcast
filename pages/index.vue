<template>
<div>
  <canvasArea id="canvasArea" :toggle="canvasToggle" @off="canvasToggleOff"/>
  <div id="area">
    <div class="text" v-if="!socketToggle">기다리는 중입니다... 현재 열려있는 포트: {{port}}</div>
    <div v-else class="text hidden" v-for="m in mes" :key="m">{{m}}</div>
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
      mousepointToggle: true
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
      if (this.mes.length > 10) this.mes.splice(0, 1)
      this.mes.push(mes.replace(/^ /gi, ''))
    })
    this.$electron.ipcRenderer.on('mouseIgnoreToggle', (event, mes) => {
      this.canvasToggle = mes
    })
    this.$electron.ipcRenderer.on('mousepointToggle', (event, mes) => {
      this.mousepointToggle = mes
    })
    this.$electron.ipcRenderer.on('mouse', (event, mes) => {
      this.mouse = mes
    })
  },
  beforeDestroy() {
    this.$electron.ipcRenderer.removeListener('socketToggle', () => {})
    this.$electron.ipcRenderer.removeListener('record', () => {})
  }
}
</script>
