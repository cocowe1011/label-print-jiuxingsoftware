import { app, BrowserWindow, globalShortcut, ipcMain, Menu, dialog, Tray, screen } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import nodes7 from 'nodes7';
import HttpUtil from '@/utils/HttpUtil'
import logger from 'electron-log'
// 设置日志文件的保存路径
logger.transports.file.file = app.getPath("userData") + "/app.log";

// 初始化日志记录器
logger.transports.file.level = "info";
logger.transports.console.level = "info";
// 日期样式
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
console.log(app.getPath("userData"))
logger.transports.file.file = app.getPath("userData") + "/app.log";

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');
var appTray = null;
let closeStatus = false;
var conn = new nodes7;
// electron 开启热更新
try {
  require('electron-reloader')(module,{});
} catch (_) {}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

global.sharedObject = {
  userInfo: {}
}
let mainWindow = null;
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 820,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    icon: './build/icons/icon.ico'
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('logStatus', (event, arg) => {
    console.log(arg)
    if(arg === 'login') {
      // 此程序无需登录后全屏，这一块不会走
      mainWindow.setResizable(true)
      mainWindow.setBounds({ x: 0, y: 0, width: screen.getPrimaryDisplay().workAreaSize.width, height: screen.getPrimaryDisplay().workAreaSize.height });
    } else {
      // 太几把坑了，windows系统setSize center方法失效 必须先mainWindow.unmaximize()
      mainWindow.unmaximize()
      mainWindow.center();
      global.sharedObject.userInfo = {}
    }
  })
  // 定义自定义事件
  ipcMain.on('close-window', function() {
    mainWindow.close();
  })
  // 定义自定义事件
  ipcMain.on('min-window', (event, arg) => {
    mainWindow.minimize();
  })
  // 定义自定义事件
  ipcMain.on('max-window', (event, arg) => {
    if (arg === 'max-window') {
      return mainWindow.maximize()
    }
    mainWindow.unmaximize()
    mainWindow.center();
  })
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('mainWin-max', 'max-window')
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('mainWin-max', 'unmax-window')
  })
  mainWindow.on('close', (e) => {
    closeStatus = true;
    e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
    dialog.showMessageBox({
      type: 'warning',
      title: '提醒！',
      message:'确认关闭程序吗？',
      buttons: ['关闭程序', '放入托盘','取消'],   //选择按钮，点击确认则下面的idx为0，取消为1
      cancelId: 2, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then(idx => {
      if (idx.response == 2) {
        e.preventDefault();
      } else if(idx.response == 0) {
        mainWindow = null
        app.exit();
      }else{
        mainWindow.setSkipTaskbar(true);
        mainWindow.hide();
      }
    })
  });
  ipcMain.on('request-printers', (event) => {
    const printers = mainWindow.webContents.getPrinters();
    event.reply('get-printers', printers);
  });
  setAppTray();
  if (process.env.NODE_ENV === 'production') {
    // 启动Java进程
    spawn(path.join(__static, './jre', 'jre1.8.0_251', 'bin', 'java'), ['-Xmx1024m', '-Xms1024m', '-jar', path.join(__static, './jarlib', 'label-print-jiuxing-middle.jar')]);
  }

  // 开发者工具
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow.webContents.openDevTools()
  })
  globalShortcut.register('CommandOrControl+F11', () => {
    mainWindow.isFullScreen() ? mainWindow.setFullScreen(false) : mainWindow.setFullScreen(true);
  })
  // 定义自定义事件
  ipcMain.on('full_screen', function() {
    mainWindow.isFullScreen() ? mainWindow.setFullScreen(false) : mainWindow.setFullScreen(true);
  })
  // 程序启动时判断是否存在报表、日志等本地文件夹，没有就创建
  createFile('labelPrint.grf');
  // 创建 Socket 服务端
  const server = net.createServer((socket) => {
    console.log('Client connected');
    mainWindow.webContents.send('dealSocketStatus', true)
    socket.on('data', (data) => {
      mainWindow.webContents.send('getWeightJson', JSON.parse(data));
      mainWindow.webContents.send('dealSocketStatus', true)
      // socket.write('Hello, client.'); // 向客户端发送响应
    });
    socket.on('end', () => {
      console.log('Client disconnected');
      mainWindow.webContents.send('dealSocketStatus', false)
    });
    socket.on('error', (error) => {
        console.error(`Error: ${error}`);
        mainWindow.webContents.send('dealSocketStatus', false)
      });
    });
  server.listen(2000, () => {
    console.log('Server listening on port 2000');
  });

  // 创建 Socket 客户端连接
  const client = new net.Socket();
  const HOST = '192.168.10.253';
  const PORT = 5700;

  client.on('error', (err) => {
    console.error(`Client connection error: ${err.message}`);
    // 失败了也不要影响其他流程
  });

  client.on('close', () => {
    console.log('Client connection closed');
    mainWindow.webContents.send('dealSocketStatus', false);
  });

  client.connect(PORT, HOST, () => {
    console.log(`Connected to server: ${HOST}:${PORT}`);
    mainWindow.webContents.send('dealSocketStatus', true);
  });

  client.on('data', (data) => {
    try {
      const dataStr = data.toString('ascii').replace(/[^\d,]/g, '').trim();
      const parts = dataStr.split(',');
      
      // 检查第三项（索引为2）是否为"02"
      if (parts.length > 2 && parts[2].trim() === '02') {
        const firstPart = parts[0].trim();
        
        // 进行重量转换 0008522是8.522Kg
        const weightNum = parseInt(firstPart, 10);
        if (!isNaN(weightNum)) {
          // 转换为保留3位小数的字符串
          const weightVal = (weightNum / 1000).toFixed(3);
          const jsonToSend = { weight: weightVal };
          
          if (mainWindow && !mainWindow.isDestroyed()) {
             mainWindow.webContents.send('getWeightJson', jsonToSend);
             mainWindow.webContents.send('dealSocketStatus', true);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing data:', e);
    }
  });
  ipcMain.handle('read-config-file', async (event, arg) => {
    if(!fs.existsSync("D://label_temp_data/config/config.json")){
      fs.writeFile("D://label_temp_data/config/config.json", JSON.stringify({machineName:""}), function(err) {});
      return {};
    };
    return await fs.readFileSync("D://label_temp_data/config/config.json", 'utf8');
  })
  
  ipcMain.handle('update-config-file', async (event, arg) => {
    await fs.writeFileSync("D://label_temp_data/config/config.json", JSON.stringify(arg))
  })
  // 定义自定义事件
  ipcMain.on('writeLogToLocal', (event, arg) => {
    fs.appendFile("D://label_temp_data/log/" + ((new Date()).toLocaleDateString() + ".txt").replaceAll('/','-'), arg + '\n', function(err) {});
  })
});

function createFile(fileNameVal) {
  const sourcePath = path.join(__static, './report', fileNameVal);// 要复制的文件的路径=
  const destinationPath = 'D://label_temp_data/report'; // 目标文件夹的路径

  // 检查源文件是否存在
  if (!fs.existsSync(sourcePath)) {
    console.error('源文件不存在');
    return;
  }

  // 获取源文件的文件名
  const fileName = path.basename(sourcePath);

  // 构建目标文件的完整路径
  const destinationFilePath = path.join(destinationPath, fileName);

  // 检查目标文件夹是否存在，如果不存在则创建它
  if (!fs.existsSync(destinationPath)) {
    try {
      fs.mkdirSync(destinationPath, { recursive: true });
      console.log('目标文件夹已成功创建');
    } catch (err) {
      console.error('创建目标文件夹时出现错误：', err);
      return;
    }
  }

  const destinationLogPath = 'D://label_temp_data/log'; // 目标文件夹的路径

  // 创建日志的文件夹
  if (!fs.existsSync(destinationLogPath)) {
    try {
      fs.mkdirSync(destinationLogPath, { recursive: true });
      console.log('目标文件夹已成功创建');
    } catch (err) {
      console.error('创建目标文件夹时出现错误：', err);
      return;
    }
  }

  const destinationSetPath = 'D://label_temp_data/config'; // 目标文件夹的路径

  // 创建日志的文件夹
  if (!fs.existsSync(destinationSetPath)) {
    try {
      fs.mkdirSync(destinationSetPath, { recursive: true });
      console.log('目标文件夹已成功创建');
    } catch (err) {
      console.error('创建目标文件夹时出现错误：', err);
      return;
    }
  }

  // 检查目标文件是否已经存在
  if (fs.existsSync(destinationFilePath)) {
    console.log('目标文件已存在，跳过复制操作');
  } else {
    try {
      // 使用流的方式复制文件
      fs.copyFileSync(sourcePath, destinationFilePath);
      console.log('文件已成功复制到目标文件夹');
    } catch (err) {
      console.error('文件复制过程中出现错误：', err);
    }
  }
}

const setAppTray = () => {  
  // 系统托盘右键菜单
  var trayMenuTemplate = [
      {
          label: '退出',
          click: function() {
              app.quit()
          }
      }
  ]

  console.log()
  // 系统托盘图标目录
  appTray = new Tray(path.join(__static, './icon.ico'))

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('九星标签打印系统')

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu)

  appTray.on("click", function(){
    //主窗口显示隐藏切换
    if(mainWindow.isVisible()){
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    }else{
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  })
}
