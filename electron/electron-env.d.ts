import type { ipcReturnMsg } from "@/types";

// electron-env.d.ts
export interface IElectronAPI {
  // preload.ts 中使用的方法，此处也要同步申明
  windowAction: (arg: string) => void;
  selectFolder: () => Promise<ipcReturnMsg>;
  renameAction: (arg: { 
    basePath: string; 
    oldName: string; 
    newName: string 
  }) => Promise<ipcReturnMsg>;
  createFolder: (arg: { 
    basePath: string; 
    folderName: string 
  }) => Promise<ipcReturnMsg>;
  createBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    targetFolderName: string, 
    sourcePath: string 
  }) => Promise<ipcReturnMsg>;
  restoreBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    folderName: string, 
    destination: string, 
    isOnlyOverwrite: boolean 
  }) => Promise<ipcReturnMsg>;
  deleteFolder: (arg: string[]) => Promise<ipcReturnMsg>,
  readFile: () => Promise<ipcReturnMsg>,
  readFolder: () => Promise<ipcReturnMsg>,
  writeFile: (arg: string) => Promise<ipcReturnMsg>,

  getSteamGames: () => Promise<ipcReturnMsg>,
  
  onWindowChange: (callback: Function) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}