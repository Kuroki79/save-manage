import type { GameRule } from '../types';

const gameRules: GameRule[] = [
  {
    name: "Grand Theft Auto V",
    folderPattern: "Grand Theft Auto V",
    executablePattern: "GTA5.exe",
    savePattern: "%USERPROFILE%\\Documents\\Rockstar Games\\GTA V\\Profiles\\*",
    saveType: "absolute"
  },
  {
    name: "The Witcher 3",
    folderPattern: "The Witcher 3*",
    executablePattern: "witcher3.exe",
    savePattern: "savegames",
    saveType: "relative"
  },
  {
    name: "Darkest Dungeon® II",
    folderPattern: "Darkest Dungeon® II",
    executablePattern: "Darkest Dungeon II.exe",
    savePattern: "%USERPROFILE%\\AppData\\LocalLow\\RedHook\\Darkest Dungeon II",
    saveType: "absolute"
  },
  {
    name: "Blender",
    folderPattern: "Blender",
    executablePattern: "Blender.exe",
    savePattern: "%USERPROFILE%\\AppData\\Roaming\\Blender Foundation",
    saveType: "absolute"
  },
  // 添加更多游戏规则...
];

export default gameRules;