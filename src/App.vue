<template>
  <div :class="{ 'max-window': isMaximized, 'win': !isMaximized }">
    <v-app id="inspire">
      <!-- 设置 z-index 尽可能的大，以防止 overlay 覆盖了系统栏 -->
      <v-system-bar style="z-index: 9999;" :color="mainConfig.themeColor" window rounded>
        <v-spacer class="fill-height drag-area"></v-spacer>

        <v-btn @click="minWindow" icon="mdi-minus" variant="text"></v-btn>
        <v-btn @click="maxWindow" icon="mdi-checkbox-blank-outline" variant="text"></v-btn>
        <v-btn @click="closeWindow" icon="mdi-close" variant="text"></v-btn>
      </v-system-bar>

      <v-app-bar :color="mainConfig.themeColor">
        <v-app-bar-nav-icon :icon="navIcon" @click="navIconAction"></v-app-bar-nav-icon>

        <v-app-bar-title>{{ currentPageTitle }}</v-app-bar-title>

        <v-spacer></v-spacer>

        <template v-slot:append>
          <!-- <v-btn v-if="currentRouterName === 'home'" icon="mdi-magnify"></v-btn> -->
          <v-tooltip text="多选">
            <template v-slot:activator="{ props }">
              <v-btn v-if="currentRouterName === 'home'" v-bind="props" icon="mdi-checkbox-multiple-outline"
                @click="multiCheckMode = !multiCheckMode"></v-btn>
            </template>
          </v-tooltip>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list density="compact">
              <v-list-subheader>配置</v-list-subheader>

              <v-list-item @click="importExportDialog = true">
                <template v-slot:prepend>
                  <v-icon :color="mainConfig.themeColor" icon="mdi-swap-horizontal"></v-icon>
                </template>

                <v-list-item-title>导入/导出</v-list-item-title>
              </v-list-item>

              <v-list-subheader>功能</v-list-subheader>
              <v-list-item @click="scanSteamGames">
                <template v-slot:prepend>
                  <v-icon :color="mainConfig.themeColor" icon="mdi-magnify-scan"></v-icon>
                </template>

                <v-list-item-title>导入Steam游戏</v-list-item-title>
              </v-list-item>

              <v-list-item @click="scanUserFolder">
                <template v-slot:prepend>
                  <v-icon :color="mainConfig.themeColor" icon="mdi-magnify-scan"></v-icon>
                </template>

                <v-list-item-title>扫描常用存档路径</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer">
        <v-list :color="mainConfig.themeColor">
          <v-list-item prepend-icon="mdi-home" to="/home" title="主页"></v-list-item>
          <v-list-item prepend-icon="mdi-cog" to="/settings" title="设置"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="custom-main">
        <v-container class="custom-container">
          <div class="container-wrapper">
            <RouterView />
            <v-snackbar :timeout="3000" v-model="globalSnackBar">
              {{ globalSnackBarText }}
            </v-snackbar>
            <v-dialog v-model="importExportDialog" width="auto">
              <v-card title="导入/导出">
                <template v-slot:prepend>
                  <v-icon :color="mainConfig.themeColor" icon="mdi-content-save-plus"></v-icon>
                </template>
                <v-form ref="profileForm">
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <p>类型</p>
                          <v-radio-group v-model="importExportType" inline>
                            <v-radio label="软件配置" value="mainConfig"></v-radio>
                            <v-radio label="存档配置" value="saveList"></v-radio>
                          </v-radio-group>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn prepend-icon="mdi-import" :color="mainConfig.themeColor" variant="tonal"
                      @click="() => appBarMenuAction('import')">
                      导入
                    </v-btn>
                    <v-btn prepend-icon="mdi-export" :color="mainConfig.themeColor" variant="tonal"
                      @click="() => appBarMenuAction('export')">
                      导出
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
            <v-dialog v-model="scanSteamDialog" min-width="600px" width="auto" scrollable>
              <template v-slot:default>
                <v-card :loading="scanCardLoading" prepend-icon="mdi-application-import" title="导入Steam游戏">
                  <template v-slot:loader="{ isActive }">
                    <v-progress-linear :active="isActive" color="deep-purple" height="4"
                      indeterminate></v-progress-linear>
                  </template>
                  <v-card-text class="px-4" :style="{ height: windowHeight - 200 + 'px' }">
                    <v-list lines="two" density="compact">
                      <v-list-item v-for="gameObj in importGameList" :key="gameObj.id"
                        @click="gameObj.checked = !gameObj.checked">
                        <template v-slot:prepend>
                          <v-list-item-action start>
                            <v-checkbox-btn :model-value="gameObj.checked"
                              @update:model-value="gameObj.checked = $event"></v-checkbox-btn>
                          </v-list-item-action>
                        </template>

                        <v-list-item-title>{{ gameObj.name }}</v-list-item-title>

                        <v-list-item-subtitle>
                          {{ gameObj.gamePath }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-btn text="关闭" @click="scanSteamDialog = false"></v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="surface-variant" text="导入" variant="flat" @click="importSteamGame"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
            <v-dialog v-model="scanUserDialog" min-width="600px" width="auto" scrollable>
              <template v-slot:default>
                <v-card :loading="scanCardLoading" prepend-icon="mdi-application-import" title="导入Steam游戏">
                  <template v-slot:loader="{ isActive }">
                    <v-progress-linear :active="isActive" color="deep-purple" height="4"
                      indeterminate></v-progress-linear>
                  </template>
                  <v-card-text class="px-4" :style="{ height: windowHeight - 200 + 'px' }">
                    <v-list lines="two" density="compact">
                      <v-list-item v-for="gameObj in userFolderSaveList" :key="gameObj.id"
                        @click="gameObj.checked = !gameObj.checked">
                        <template v-slot:prepend>
                          <v-list-item-action start>
                            <v-checkbox-btn :model-value="gameObj.checked"
                              @update:model-value="gameObj.checked = $event"></v-checkbox-btn>
                          </v-list-item-action>
                        </template>

                        <v-list-item-title>{{ gameObj.name }}</v-list-item-title>

                        <v-list-item-subtitle>
                          {{ gameObj.savePath }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-btn text="关闭" @click="scanUserDialog = false"></v-btn>

                    <v-spacer></v-spacer>

                    <v-btn color="surface-variant" text="导入" variant="flat" @click="scanUserFolder"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </div>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import throttle from 'lodash/throttle';
import { usePrimaryConfigStore } from './stores/primaryConfig';
import myRouter from '@/router';
import type { SteamGame } from './types';

const routerTitleConfig: { [key: string]: string } = {
  home: '主页',
  settings: '设置',
  saveProfileDetail: '存档配置详情',
};

// const mainPageRoute: string[] = ['home', 'settings'];
const mainPageRoute: string[] = ['home', 'settings'];

const route = useRoute();
const router = useRouter();

// const { mainConfig, saveList, globalSnackBar, globalSnackBarText, dateTimeFlag } = storeToRefs(usePrimaryConfigStore());
const { mainConfig, saveList, globalSnackBar, globalSnackBarText, multiCheckMode } = storeToRefs(usePrimaryConfigStore());
const { changeSnackTextThenShow, addSaveProfile } = usePrimaryConfigStore();

const drawer = ref<boolean>(false);
const importExportDialog = ref<boolean>(false);
const scanSteamDialog = ref<boolean>(false);
const scanUserDialog = ref<boolean>(false);
const scanCardLoading = ref<boolean>(false);

const isMaximized = ref<boolean>(false);
const currentPageTitle = ref<string>('主页');
const navIcon = ref<string>('mdi-menu');
const importExportType = ref<string>('mainConfig');
const currentRouterName = ref<string>('home');

const windowHeight = ref<number>(0);

const importGameList = ref<Array<{ name: string, gamePath: string, savePath: string, id: string, checked: boolean }>>([]);
const userFolderSaveList = ref<Array<{ name: string, savePath: string, id: string, checked: boolean }>>([]);

// const appBarMenuItems = ref([
//   {
//     icon: 'mdi-import',
//     action: 'import',
//     text: '导入'
//   },
//   {
//     icon: 'mdi-export',
//     action: 'export',
//     text: '导出'
//   }
// ]);

const throttledHandleResize = throttle(watchWindowResize, 200);

onMounted(() => {
  windowHeight.value = window.innerHeight;

  window.addEventListener('resize', throttledHandleResize);
});

// if (mainConfig.value.autoBackupTime) {
//   const oldTime = dateTimeFlag.value ? dateTimeFlag.value : new Date();
//   const newTime = new Date();

//   const timeDiff = newTime.getTime() - oldTime.getTime();

//   console.log(timeDiff / 3600);

//   setInterval(() => {
//     console.log('自动备份');
//   }, mainConfig.value.autoBackupTime * 60 * 60 * 1000);
// }

// 监听主线程中窗口最大化/最小化
window.electronAPI.onWindowChange((isMax: boolean) => {
  // console.log(isMax);
  isMaximized.value = isMax;
});

// 监听路由，判断路由地址是否处于第一层级，处于第一层级就展示主页图标，反之展示返回按钮
myRouter.afterEach((to) => {
  // console.log(to);
  if (to.name) {
    currentRouterName.value = to.name as string;
    navIcon.value = mainPageRoute.includes(to.name as string) ? 'mdi-menu' : 'mdi-arrow-left';
    currentPageTitle.value = routerTitleConfig[to.name as string];
  }
});

function watchWindowResize() {
  windowHeight.value = window.innerHeight;
  // console.log(window.innerWidth, window.innerHeight);
}

function navIconAction() {
  if (!mainPageRoute.includes(route.name as string)) {
    router.back();
  } else {
    drawer.value = !drawer.value;
  }
}

// 扫描系统用户目录
async function scanUserFolder() {

  scanUserDialog.value = true;
  scanCardLoading.value = true;

  importGameList.value = [];

  const result = await window.electronAPI.getSteamGames();
  if (result.success) {
    // console.log(result.data);

    (result.data as Array<SteamGame>).forEach((element: SteamGame) => {

      if (saveList.value.find(save => save.name === element.name) === undefined) {
        importGameList.value.push({
          name: element.name,
          gamePath: element.installDir,
          savePath: '',
          id: element.appId,
          checked: false
        });
      }
    });

    scanCardLoading.value = false;
  } else {
    changeSnackTextThenShow(result.message);
    console.error('Failed to fetch Steam games:', result.message);
    scanCardLoading.value = false;
  }
}

// 扫描Steam已安装的游戏
async function scanSteamGames() {

  scanSteamDialog.value = true;
  scanCardLoading.value = true;

  importGameList.value = [];

  const result = await window.electronAPI.getSteamGames();
  if (result.success) {
    // console.log(result.data);

    (result.data as Array<SteamGame>).forEach((element: SteamGame) => {

      if (saveList.value.find(save => save.name === element.name) === undefined) {
        importGameList.value.push({
          name: element.name,
          gamePath: element.installDir,
          savePath: '',
          id: element.appId,
          checked: false
        });
      }
    });

    scanCardLoading.value = false;
  } else {
    changeSnackTextThenShow(result.message);
    console.error('Failed to fetch Steam games:', result.message);
    scanCardLoading.value = false;
  }
}

async function importSteamGame() {
  const checkedGames = importGameList.value.filter(item => item.checked);

  if (checkedGames) {
    checkedGames.forEach(async element => {

      let dirNameArr = element.gamePath.split('\\');

      const saveProfile = {
        id: '',
        createTime: '',
        name: element.name,
        dirName: dirNameArr[dirNameArr.length - 1],
        location: element.savePath,
        isOnlyOverwrite: true,
        historyBackupList: []
      };

      const res = await window.electronAPI.createFolder({ basePath: mainConfig.value.saveFolder, folderName: saveProfile.dirName });

      if (res.success) {
        addSaveProfile(saveProfile);
      } else {
        changeSnackTextThenShow(res.message);
      }
    });

    changeSnackTextThenShow('导入成功');

    scanDialog.value = false;

  } else {
    changeSnackTextThenShow('请至少选中一个');
    // scanDialog.value = false;
  }
}

// 应用栏菜单按钮事件
async function appBarMenuAction(action: string) {
  switch (action) {
    case 'import': {
      const res = await window.electronAPI.readFile();
      if (res.success) {
        const importObj = JSON.parse(res.data as string);

        if (importExportType.value === 'mainConfig') {
          mainConfig.value = importObj;
        } else {
          saveList.value = [...saveList.value, ...importObj.saveList];
        }
        return;
      }

      changeSnackTextThenShow(res.message);

      break;
    }
    case 'export': {
      const outputConfig = importExportType.value === 'mainConfig' ? mainConfig.value : { saveList: saveList.value };
      const outputStr = JSON.stringify(outputConfig);

      // console.log(outputStr);
      const res = await window.electronAPI.writeFile(outputStr);
      changeSnackTextThenShow(res.message);
      break;
    }
  }
}

function maxWindow() {
  if (isMaximized.value) {
    window.electronAPI.windowAction('restore');
    isMaximized.value = false;
  } else {
    window.electronAPI.windowAction('max');
    isMaximized.value = true;
  }
}

function minWindow() {
  window.electronAPI.windowAction('min');
}

function closeWindow() {
  window.electronAPI.windowAction('close');
}
</script>

<style>
html,
body {
  overflow-y: hidden;
}

.win {
  width: 100%;
  height: 100vh;
  /* width: calc(100% - 10px); */
  /* height: calc(100vh - 10px); */
  /* background-color: #FFFFFF; */
  border-radius: 20px;
  /* box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); */
  /* margin: 5px; */
}

.max-window {
  width: 100%;
  height: 100vh;
  background-color: #FFFFFF;
}

.custom-main {
  max-height: 100%;
}

.custom-container {
  height: 100%;
  max-width: 100% !important;
  overflow-y: auto !important;
}

.container-wrapper {
  margin-left: auto;
  margin-right: auto;
}

.drag-area {
  -webkit-app-region: drag;
}

/* width */
::-webkit-scrollbar {
  width: 12px;
  /* height: 15px; */
}

/* Track */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: transparent;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  /* -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  background-color: #3f84ed;
  transition: all .2s ease-in-out;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--v-theme-primary));
}

@media (min-width: 960px) {
  .container-wrapper {
    max-width: 900px;
  }
}
</style>
