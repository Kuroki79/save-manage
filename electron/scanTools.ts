import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parse as parseVdf } from 'vdf-parser';

import type { LibraryFolder, SteamGame } from '../src/types';
import { getDirList } from './fileTools';

const execAsync = promisify(exec);

async function findSteamPath(): Promise<string | null> {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Steam',
    'C:\\Program Files\\Steam',
    path.join(os.homedir(), 'Steam'),
    path.join(os.homedir(), 'Library', 'Application Support', 'Steam'),
    path.join(os.homedir(), '.local', 'share', 'Steam'),
    path.join(os.homedir(), '.steam', 'steam')
  ];

  // 检查常见路径
  for (const steamPath of possiblePaths) {
    if (await fs.promises.access(steamPath).then(() => true).catch(() => false)) {
      return steamPath;
    }
  }

  // 在 Windows 上尝试从注册表获取路径
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync('powershell.exe -Command "Get-ItemProperty -Path HKCU:\\Software\\Valve\\Steam -Name SteamPath | Select-Object -ExpandProperty SteamPath"');
      const steamPath = stdout.trim();
      if (steamPath && await fs.promises.access(steamPath).then(() => true).catch(() => false)) {
        return steamPath;
      }
    } catch (error) {
      console.error('Error reading Steam path from registry:', error);
    }
  }

  return null;
}

function findLibraryFolders(steamPath: string): LibraryFolder[] {
  const libraryFoldersPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');

  if (!fs.existsSync(libraryFoldersPath)) {
    return [{ path: path.join(steamPath, 'steamapps'), apps: {} }];
  }

  const libraryFoldersContent = fs.readFileSync(libraryFoldersPath, 'utf-8');
  const libraryFolders = parseVdf(libraryFoldersContent) as any;

  return Object.values(libraryFolders.libraryfolders).map((folder: any) => ({
    path: folder.path,
    apps: folder.apps || {}
  }));
}

async function getSteamGames(): Promise<SteamGame[]> {
  const steamPath = await findSteamPath();
  if (!steamPath) {
    throw new Error('Steam installation not found');
  }

  const libraryFolders = await findLibraryFolders(steamPath);
  const games: SteamGame[] = [];

  for (const folder of libraryFolders) {
    const appsPath = path.join(folder.path, 'steamapps');
    
    const files = await fs.promises.readdir(appsPath);
    for (const file of files) {
      if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
        const manifestPath = path.join(appsPath, file);
        const manifestContent = await fs.promises.readFile(manifestPath, 'utf-8');
        const manifest = parseVdf(manifestContent) as any;

        games.push({
          name: manifest.AppState.name,
          installDir: path.join(appsPath, 'common', manifest.AppState.installdir),
          appId: manifest.AppState.appid,
        });
      }
    }
  }

  return games;
}

async function getUserFolderSaveList (name: string) {
  const appDataList: Array<string> = getDirList(path.join(os.homedir(), 'AppData'));
  appDataList.forEach((element: string) => {
    console.log(getDirList(path.join(os.homedir(), 'AppData', element)));
  });
}

export {
  getSteamGames
};