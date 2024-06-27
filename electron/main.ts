import {
  createFolder,
  renameFileAndFolder,
  getDirList,
  copyFile,
  copyFolder,
  deleteFolder,
  deleteFolderFile,
  readFile,
  writeFile
} from './fileTools';
import path from 'path';

import { app, BrowserWindow, ipcMain, dialog } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: '存档管理',
    frame: false,
    show: false,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      contextIsolation: true,
      // nodeIntegration: true,
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
    win.webContents.send('window:change', true);
  });

  win.on('unmaximize', () => {
    // console.log('unmaximize');
    win.webContents.send('window:change', false);
  });

  ipcMain.on('window:action', (e, arg) => {
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

  ipcMain.handle('exploreAction:createFolder', (e, arg) => {
    try {
      createFolder(path.join(arg.basePath, arg.folderName));
      return '目录创建成功';
    } catch (e) {
      // console.log(e);
      return e;
    }
  });

  ipcMain.handle('exploreAction:rename', (e, arg) => {
    try {
      renameFileAndFolder(
        path.join(arg.basePath, arg.oldName),
        path.join(arg.basePath, arg.newName)
      );

      return '重命名成功';
    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('dialog:selectFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择目录',
      buttonLabel: '选择'
    });

    console.log(filePaths);

    if (!canceled) {
      return filePaths[0];
    }
  });

  ipcMain.handle('get-dir-list', (e, arg) => {
    try {
      return getDirList(arg);
    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('backup:create', (e, arg) => {
    const newBackupFolderPath = path.join(arg.basePath, arg.targetFolderName, arg.createTime);
    try {
      createFolder(newBackupFolderPath);
      copyFolder(arg.sourcePath, newBackupFolderPath);
      return '创建备份成功';
    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('backup:restore', (e, arg) => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      if (arg.isOnlyOverwrite) {
        deleteFolderFile(arg.destination);
      }
      copyFolder(sourcePath, arg.destination);
      return '还原备份成功';
    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('exploreAction:deleteFolder', (e, arg) => {
    try {
      deleteFolder(path.join(...arg));
      return '目录删除成功';
    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('exploreAction:readFile', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        title: '选择文件',
        buttonLabel: '选择',
        filters: [
          { name: 'JSON文件', extensions: ['json'] },
        ]
      });
  
      console.log(filePaths);

      if (canceled) return '操作已取消';

      return readFile(filePaths[0]);

    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('exploreAction:readFolder', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '选择目录',
        buttonLabel: '选择',
      });
  
      console.log(filePaths);

      if (canceled) return '操作已取消';

      return getDirList(filePaths[0]);

    } catch (e) {
      return e;
    }
  });

  ipcMain.handle('exploreAction:writeFile', async (e, arg) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: '保存为',
        buttonLabel: '保存',
        filters: [
          { name: 'JSON文件', extensions: ['json'] },
        ]
      });
  
      console.log(filePath);

      if (canceled) return '操作已取消';

      writeFile(filePath as string, arg);

      return '导出成功';
    } catch (e) {
      console.log(e);
    }
  });

  ipcMain.handle('copy-file', (e, arg) => {
    try {
      copyFile(arg.source, arg.destination);
      return '拷贝文件成功';
    } catch (e) {
      return e;
    }
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
