const {app, BrowserWindow, screen, ipcMain} = require('electron')
const url = require("url");
const path = require("path");
const notifier = require('node-notifier');

let mainWindow

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    alwaysOnTop: true,
    frame:false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/FlexLaserz-app/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
function notificaiton(Title, Message, Icon){
    notifier.notify({
      title: "thing",
      subtitle: undefined,
      message: 'Hello',
      icon: Icon,
      appID: undefined,
      sound: true
    })
}

function screenCap(){
  var spawn = require('child_process').spawn,
  py = spawn('python', ['screenshot.py'])
  fileName = ''
  py.stdout.on('data',function(data){
    fileName += data.toString();
  })
  setTimeout(() =>{
    notificaiton('title','message',path.join(path.join(__dirname,'/screenshots'),fileName))
  },1000)

}

ipcMain.on('screenCap', (event, arg) => {
  screenCap()
})

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})