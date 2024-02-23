import {
  createFolder,
  renameFile,
  getDirList,
  copyFile,
  copyFolder,
  deleteFolder,
  deleteFolderFile
} from "./fileTools";
import path from 'path';

import { app, BrowserWindow, ipcMain, dialog } from 'electron';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    title: 'Main window',
    frame: false,
    show: false,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Load your file
    win.loadFile('dist/index.html');
  }

  // 当已渲染完毕的时候再显示窗口，可以避免打开软件时白屏的问题
  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('maximize', () => {
    // console.log('maximize');
    win.webContents.send("onMaximize");
  });

  win.on('unmaximize', () => {
    // console.log('unmaximize');
    win.webContents.send("onUnmaximize");
  });

  ipcMain.on('window-action', (e, arg) => {
    switch (arg) {
      case 'min':
        win.minimize();
        break;
      case 'max':
        win.maximize();
        break;
      case 'restore':
        win.restore();
        break;
      case 'close':
        win.close();
        break;
      default:
        break;
    }
  });
  
  ipcMain.on('create-folder', (e, arg) => {
    try {
      createFolder(path.join(arg.basePath, arg.folderName));
    } catch (e) {
      console.log(e);
    }
  });
  
  ipcMain.on('rename-file', (e, arg) => {
    renameFile(arg.oldName, path.join(arg.basePath, arg.newName));
  });
  
  ipcMain.on('chose-directory-dialog', (e, arg) => {
    dialog.showOpenDialog({
      properties: [arg.prop],
      title: '请选择默认目录',
      buttonLabel: '选择'
    }).then(result => {
      console.log(result);
      if (result.canceled) return;
      e.sender.send(arg.action, result.filePaths);
    });
  });
  
  ipcMain.on('get-dir-list', (e, arg) => {
    e.sender.send('getDirList', getDirList(arg));
  });
  
  ipcMain.on('create-backup', (e, arg) => {
    const newBackupFolderPath = path.join(arg.basePath, arg.folderName, arg.createTime);
    // console.log(newBackupFolderPath);
    try {
      createFolder(newBackupFolderPath);
      copyFolder(arg.source, newBackupFolderPath);
      win.webContents.send("file-operation", '创建备份成功');
    } catch (e) {
      console.log(e);
    }
  });
  
  ipcMain.on('restore-backup', (e, arg) => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    // const newBackupFolderPath = path.join(arg.basePath, arg.folderName, '第二次');
    // console.log(newBackupFolderPath);
    try {
      copyFolder(sourcePath, arg.destination);
      win.webContents.send("file-operation", '还原备份成功');
    } catch (e) {
      console.log(e);
    }
  });

  ipcMain.on('delete-backup', (e, arg) => {
    try {
      deleteFolder(path.join(arg.basePath, arg.folderName, arg.createTime));
      win.webContents.send("file-operation", '删除备份成功');
    } catch (e) {
      console.log(e);
    }
  });

  ipcMain.on('delete-profile', (e, arg) => {
    try {
      deleteFolder(path.join(arg.basePath, arg.folderName));
      // win.webContents.send("file-operation", '删除本地文件成功');
    } catch (e) {
      console.log(e);
    }
  });

  ipcMain.on('clean-folder-then-restore', (e, arg) => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      deleteFolderFile(arg.destination);
      copyFolder(sourcePath, arg.destination);
      win.webContents.send("file-operation", '还原备份成功');
    } catch (e) {
      console.log(e);
    }
  });
  
  ipcMain.on('copy-file', (e, arg) => {
    copyFile(arg.source, arg.destination);
  });
  
  ipcMain.on('copy-folder', (e, arg) => {
    copyFolder(arg.source, arg.destination);
  });
});

// 关闭窗口
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});