export interface SaveItemInter {
  id: string,
  name: string,
  dirName: string,
  location: string,
  createTime: string,
  historyBackupList: HistoryBackupListInter,
  isOnlyOverwrite: boolean
}

export interface HistoryBackupInter {
  // 用于创建目录时用的时间字符串
  createTime: string,
  note: string
}

export interface ipcReturnMsg {
  success: boolean,
  data?: Array<object | string> | object | string,
  message: string,
}

export interface GameRule {
  name: string;
  folderPattern: string;
  executablePattern: string;
  savePattern: string;
  saveType: 'absolute' | 'relative'; // 'absolute' 表示存档路径是绝对路径，'relative' 表示相对于游戏安装目录
}

export interface LibraryFolder {
  path: string;
  apps: { [appId: string]: string };
}

export interface SteamGame {
  name: string;
  installDir: string;
  appId: string;
  savePath: string
}

export type SaveListInter = Array<SaveItemInter>;
export type HistoryBackupListInter = Array<HistoryBackupInter>;