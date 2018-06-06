const http = require('http')
const { Nuxt, Builder } = require('nuxt')
let config = require('./nuxt.config.js')
config.rootDir = __dirname
const nuxt = new Nuxt(config)
const builder = new Builder(nuxt)
const server = http.createServer(nuxt.render)

if (config.dev) {
	builder.build().catch(e => {
		console.error(e)
		process.exit(1)
	})
}

server.listen()
const _NUXT_URL_ = `http://localhost:${server.address().port}`
console.log(`Nuxt on ${_NUXT_URL_}`)

const setupEvents = require('./squirrel')
if (setupEvents.handleSquirrelEvent()) {
   return
}

let win = null
const electron = require('electron')
const path = require('path')
const app = electron.app
const ipcMain = electron.ipcMain
const newWin = () => {
	win = new electron.BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true,
    show: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    toolbar: false,
    resizable: false,
    fullscreen: true,
		icon: path.join(__dirname, 'static/icon.png')
  })
  const socket = require('./socket.io')(server, win)
  win.setIgnoreMouseEvents(true)
  win.on('ready-to-show', () => {
    win.show()
    //win.webContents.openDevTools()
  })
  win.on('closed', () => win = null)
  const execSync = require('child_process').execSync
  const recorder = execSync('start chrome https://rubystarashe.github.io/speech-to-text-recorder/')
	if (config.dev) {
	  !function pollServer() {
			http.get(_NUXT_URL_, res => {
				if (res.statusCode === 200) {
          win.loadURL(_NUXT_URL_)
        } else {
          setTimeout(pollServer, 300)
        }
      })
      .on('error', pollServer)
		}()
	} else {
    win.loadURL(_NUXT_URL_)
  }
}
app.on('ready', () => {
  if (config.dev) require('vue-devtools').install()
  newWin()
  const globalShortcut = electron.globalShortcut
  let mouseIgnoreToggle = true
  globalShortcut.register('Alt+C', () => {
    mouseIgnoreToggle = !mouseIgnoreToggle
    win.webContents.send('mouseIgnoreToggle', !mouseIgnoreToggle)
    win.setIgnoreMouseEvents(mouseIgnoreToggle)
  })
  globalShortcut.register('Alt+R', () => {
    win.webContents.send('canvasReset')
  })
  ipcMain.on('mouseIgnoreToggle', (e, mes) => {
    mouseIgnoreToggle = mes
    win.setIgnoreMouseEvents(mouseIgnoreToggle)
  })
})
app.on('window-all-closed', () => app.quit())
app.on('activate', () => win === null && newWin())
