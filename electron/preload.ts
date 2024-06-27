/* 预加载脚本 */
import { contextBridge, ipcRenderer } from 'electron';
import type { IElectronAPI } from './electron-env';

const exposeActions: IElectronAPI = {
  windowAction: (arg: string) => ipcRenderer.send('window:action', arg),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  renameAction: (arg: { 
    basePath: string; 
    oldName: string; 
    newName: string 
  }) => ipcRenderer.invoke('exploreAction:rename', arg),
  createFolder: (arg: { 
    basePath: string; 
    folderName: string 
  }) => ipcRenderer.invoke('exploreAction:createFolder', arg),
  createBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    targetFolderName: string, 
    sourcePath: string 
  }) => ipcRenderer.invoke('backup:create', arg),
  restoreBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    folderName: string, 
    destination: string, 
    isOnlyOverwrite: boolean 
  }) => ipcRenderer.invoke('backup:restore', arg),
  deleteFolder: (arg: string[]) => ipcRenderer.invoke('exploreAction:deleteFolder', arg),
  readFile: () => ipcRenderer.invoke('exploreAction:readFile'),
  readFolder: () => ipcRenderer.invoke('exploreAction:readFolder'),
  writeFile: (arg: string) => ipcRenderer.invoke('exploreAction:writeFile', arg),

  onWindowChange: (callback: Function) => ipcRenderer.on('window:change', (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld('electronAPI', exposeActions);
