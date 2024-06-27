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

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list density="compact">
            <v-list-subheader>配置</v-list-subheader>

            <v-list-item @click="dialog = true">
              <template v-slot:prepend>
                <v-icon :color="mainConfig.themeColor" icon="mdi-swap-horizontal"></v-icon>
              </template>

              <v-list-item-title>导入/导出</v-list-item-title>
            </v-list-item>

            <!--<v-list-subheader>功能</v-list-subheader>
            <v-list-item @click="dialog = true">
              <template v-slot:prepend>
                <v-icon :color="mainConfig.themeColor" icon="mdi-swap-horizontal"></v-icon>
              </template>

              <v-list-item-title>扫描用户目录</v-list-item-title>
            </v-list-item> -->

            <!-- <v-list-item v-for="(item, i) in appBarMenuItems" :key="i" :value="item"
              @click="() => appBarMenuAction(item.action)">
              <template v-slot:prepend>
                <v-icon :color="mainConfig.themeColor" :icon="item.icon"></v-icon>
              </template>

              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item> -->
          </v-list>
        </v-menu>
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
            <v-dialog v-model="dialog" width="auto">
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
          </div>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { usePrimaryConfigStore } from './stores/primaryConfig';
import myRouter from '@/router';

const routerTitleConfig: { [key: string]: string } = {
  home: '主页',
  settings: '设置',
  saveProfileDetail: '存档配置详情',
};

const mainPageRoute: string[] = ['home', 'settings'];

const route = useRoute();
const router = useRouter();

const { mainConfig, saveList, globalSnackBar, globalSnackBarText, dateTimeFlag } = storeToRefs(usePrimaryConfigStore());
const { changeSnackTextThenShow } = usePrimaryConfigStore();

const drawer = ref<boolean>(false);
const dialog = ref<boolean>(false);

const isMaximized = ref<boolean>(false);
const currentPageTitle = ref<string>('主页');
const navIcon = ref<string>('mdi-menu');
const importExportType = ref<string>('mainConfig');

const appBarMenuItems = ref([
  {
    icon: 'mdi-import',
    action: 'import',
    text: '导入'
  },
  {
    icon: 'mdi-export',
    action: 'export',
    text: '导出'
  }
]);

if (mainConfig.value.autoBackupTime) {
  const oldTime = dateTimeFlag.value ? dateTimeFlag.value : new Date();
  const newTime = new Date();

  const timeDiff = newTime.getTime() - oldTime.getTime();

  console.log(timeDiff / 3600);

  // setInterval(() => {
  //   console.log('自动备份');
  // }, mainConfig.value.autoBackupTime * 60 * 60 * 1000);
}

window.electronAPI.onWindowChange((isMax: boolean) => {
  // console.log(isMax);
  isMaximized.value = isMax;
});

myRouter.afterEach((to) => {
  // console.log(to);
  if (to.name) {
    navIcon.value = mainPageRoute.includes(to.name as string) ? 'mdi-menu' : 'mdi-arrow-left';
    currentPageTitle.value = routerTitleConfig[to.name as string];
  }
});

function navIconAction() {
  if (!mainPageRoute.includes(route.name as string)) {
    router.back();
  } else {
    drawer.value = !drawer.value;
  }
}

async function scanUserFolder() {
  const res = await window.electronAPI.readFolder();
  console.log(res);
}

async function appBarMenuAction(action: string) {
  switch (action) {
    case 'import': {
      const res = await window.electronAPI.readFile();
      if (res === '操作已取消') {
        changeSnackTextThenShow(res);
        return;
      }

      const importObj = JSON.parse(res);

      if (importExportType.value === 'mainConfig') {
        mainConfig.value = importObj;
      } else {
        saveList.value = [...saveList.value, ...importObj.saveList];
      }

      break;
    }
    case 'export': {
      const outputConfig = importExportType.value === 'mainConfig' ? mainConfig.value : { saveList: saveList.value };
      const outputStr = JSON.stringify(outputConfig);

      // console.log(outputStr);
      const res = await window.electronAPI.writeFile(outputStr);
      changeSnackTextThenShow(res);
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
