import { app, BrowserWindow, ipcMain, dialog } from 'electron';

import path from 'path';

import {
  createFolder,
  renameFileAndFolder,
  getDirList,
  copyFolder,
  deleteFolder,
  deleteFolderFile,
  readFile,
  writeFile
} from './fileTools';

import { getSteamGames, getUserFolderSaveList } from './scanTools';

import { PromptInfo } from '../src/utils/PromptInfoEnum';
import type { ipcReturnMsg } from '@/types';

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

  // 监听窗口的最大化事件
  win.on('maximize', () => {
    // console.log('maximize');
    win.webContents.send('window:change', true);
  });

  // 监听窗口的最小化事件
  win.on('unmaximize', () => {
    // console.log('unmaximize');
    win.webContents.send('window:change', false);
  });

  // console.log(os.homedir());

  // 监听渲染层发送过来的标识符，来执行对应的窗口行为
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

  ipcMain.handle('scanAction:getSteamGames', async (): Promise<ipcReturnMsg> => {
    try {
      const games = await getSteamGames();
      return { success: true, data: games, message: PromptInfo.SCAN_OP_STEAM_LIBRARY_SUCCESS };
    } catch (error: any) {
      console.error('Failed to get Steam games:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('scanAction:getUserFolderSaveList', async (e, arg): Promise<ipcReturnMsg> => {
    try {
      const games = await getUserFolderSaveList(arg);
      return { success: true, data: games as string[], message: PromptInfo.SCAN_OP_STEAM_LIBRARY_SUCCESS };
    } catch (error: any) {
      console.error('Failed to get Steam games:', error);
      return { success: false, message: error.message };
    }
  });

  // 创建目录
  ipcMain.handle('exploreAction:createFolder', (e, arg): ipcReturnMsg => {
    try {
      createFolder(path.join(arg.basePath, arg.folderName));
      return { success: true, message: PromptInfo.FILE_OP_CREATE_DIR_SUCCESS };
    } catch (error: any) {
      // console.log(e);
      return { success: false, message: error.message };
    }
  });

  // 重命名
  ipcMain.handle('exploreAction:rename', (e, arg): ipcReturnMsg => {
    try {
      renameFileAndFolder(
        path.join(arg.basePath, arg.oldName),
        path.join(arg.basePath, arg.newName)
      );

      return { success: true, message: PromptInfo.FILE_OP_RENAME_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 对话窗选择目录
  ipcMain.handle('dialog:selectFolder', async (): Promise<ipcReturnMsg> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择目录',
      buttonLabel: '选择'
    });

    // console.log(filePaths);

    if (!canceled) {
      return { success: true, data: filePaths[0], message: PromptInfo.FILE_OP_SELECT_DIR_SUCCESS };
    } else {
      return { success: false, message: PromptInfo.COMMON_ACTION_CANCEL };
    }
  });

  // 创建备份
  ipcMain.handle('backup:create', (e, arg): ipcReturnMsg => {
    const newBackupFolderPath = path.join(arg.basePath, arg.targetFolderName, arg.createTime);
    try {
      createFolder(newBackupFolderPath);
      copyFolder(arg.sourcePath, newBackupFolderPath);
      return { success: true, message: PromptInfo.BACKUP_OP_CREATE_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 还原备份
  ipcMain.handle('backup:restore', (e, arg): ipcReturnMsg => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      if (arg.isOnlyOverwrite) {
        deleteFolderFile(arg.destination);
      }
      copyFolder(sourcePath, arg.destination);
      return { success: true, message: PromptInfo.BACKUP_OP_RESTORE_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 删除目录
  ipcMain.handle('exploreAction:deleteFolder', (e, arg): ipcReturnMsg => {
    try {
      deleteFolder(path.join(...arg));
      return { success: true, message: PromptInfo.FILE_OP_DELETE_DIR_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 读取选定文件的内容
  ipcMain.handle('exploreAction:readFile', async (): Promise<ipcReturnMsg> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        title: '选择文件',
        buttonLabel: '选择',
        filters: [{ name: 'JSON文件', extensions: ['json'] }]
      });

      console.log(filePaths);

      if (canceled) return { success: false, message: PromptInfo.COMMON_ACTION_CANCEL };

      return { success: true, data: readFile(filePaths[0]), message: PromptInfo.FILE_OP_READ_FILE_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 获取指定目录下的文件结构
  ipcMain.handle('exploreAction:readFolder', async (): Promise<ipcReturnMsg> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '选择目录',
        buttonLabel: '选择'
      });

      console.log(filePaths);

      if (canceled) return { success: false, message: PromptInfo.COMMON_ACTION_CANCEL };

      return { success: true, data: getDirList(filePaths[0]), message: PromptInfo.FILE_OP_READ_DIR_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // 写入文件
  ipcMain.handle('exploreAction:writeFile', async (e, arg): Promise<ipcReturnMsg> => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: '保存为',
        buttonLabel: '保存',
        filters: [{ name: 'JSON文件', extensions: ['json'] }]
      });

      console.log(filePath);

      if (canceled) return { success: false, message: PromptInfo.COMMON_ACTION_CANCEL };

      writeFile(filePath as string, arg);

      return { success: true, message: PromptInfo.FILE_OP_WRITE_FILE_SUCCESS };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });
});

// 关闭窗口
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
