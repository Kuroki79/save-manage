// electron-env.d.ts
export interface IElectronAPI {
  // preload.ts 中使用的方法，此处也要同步申明
  windowAction: (arg: string) => void;
  selectFolder: () => Promise<string>;
  renameAction: (arg: { 
    basePath: string; 
    oldName: string; 
    newName: string 
  }) => Promise<string>;
  createFolder: (arg: { 
    basePath: string; 
    folderName: string 
  }) => Promise<string>;
  createBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    targetFolderName: string, 
    sourcePath: string 
  }) => Promise<string>;
  restoreBackup: (arg: { 
    createTime: string, 
    basePath: string, 
    folderName: string, 
    destination: string, 
    isOnlyOverwrite: boolean 
  }) => Promise<string>;
  deleteFolder: (arg: string[]) => Promise<string>,
  
  onWindowChange: (callback: Function) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    // electronAPI: any;
  }
}