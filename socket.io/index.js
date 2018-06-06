const {ipcMain} = require('electron')

module.exports = (server, win) => {
  const io = require('socket.io')(server)
  console.log('Socket.io server init')
  io.on('connection', client => {
    win.webContents.send('socketToggle', true)
    client.on('disconnect', () => {
      win.webContents.send('socketToggle', false)
    });
    client.on('record', mes => {
      win.webContents.send('record', mes)
    })
  })
}
