const {app, BrowserWindow, screen, ipcMain, ipcRenderer} = require('electron')
const url = require("url");
const path = require("path");
const spawn = require('child_process').spawn
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
  // var py = spawn('python',['dot_track.py'])
  // coord = ''
  // py.stdout.on('data',function(data){
  //   coord += data.toString();
  //   console.log(coord)
  // })
  
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
      title: Title,
      message: Message,
      icon: Icon,
      sound: false
    })
}

ipcMain.on('screenCap', () => {
  py = spawn('python', ['screenshot.py'])
  fileName = ''
  py.stdout.on('data',function(data){
    fileName += data.toString();
    console.log(fileName)
  })
  setTimeout(() =>{
    notificaiton(fileName,'Image successfully saved! ',path.join(path.join(__dirname,'/screenshots'),fileName))},1000)
})

ipcMain.on('exit',() =>{
  app.quit()
})

ipcMain.on('toolModal',(event,toolName) =>{
  notificaiton("Tool Selected",toolName+' Selected!',null)
})

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})