<template>
  <div :class="{ 'max-window': isMaximized, 'win': !isMaximized }">
    <v-app id="inspire">
      <!-- 设置 z-index 尽可能的大，以防止 overlay 覆盖了系统栏 -->
      <v-system-bar style="z-index: 9999;" :color="primaryConfigStore.themeColor" window rounded>
        <v-spacer class="fill-height drag-area"></v-spacer>

        <v-btn @click="minWindow" icon="mdi-minus" variant="text"></v-btn>
        <v-btn @click="maxWindow" icon="mdi-checkbox-blank-outline" variant="text"></v-btn>
        <v-btn @click="closeWindow" icon="mdi-close" variant="text"></v-btn>
        <!-- <v-btn icon="mdi-window-minimize" variant="text"></v-btn> -->
        <!-- <v-btn icon="mdi-window-maximize" variant="text"></v-btn> -->
        <!-- <v-btn icon="mdi-close-thick" variant="text"></v-btn> -->
      </v-system-bar>

      <v-app-bar :color="primaryConfigStore.themeColor">
        <v-app-bar-nav-icon :icon="navIcon" @click="navIconAction"></v-app-bar-nav-icon>

        <v-app-bar-title>{{ currentPageTitle }}</v-app-bar-title>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
        <v-list :color="primaryConfigStore.themeColor">
          <v-list-item prepend-icon="mdi-home" to="/home" title="主页"></v-list-item>
          <v-list-item prepend-icon="mdi-cog" to="/settings" title="设置"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="custom-main">
        <v-container class="custom-container">
          <div class="container-wrapper">
            <RouterView />
          </div>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useIpcRenderer } from '@vueuse/electron';
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

const primaryConfigStore = usePrimaryConfigStore();
const ipcRenderer = useIpcRenderer();
const drawer = ref<boolean>(false);

const isMaximized = ref<boolean>(false);
const currentPageTitle = ref<string>('主页');
const navIcon = ref<string>('mdi-menu');

ipcRenderer.on('onMaximize', () => {
  isMaximized.value = true;
});

ipcRenderer.on('onUnmaximize', () => {
  isMaximized.value = false;
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

function maxWindow() {
  if (isMaximized.value) {
    ipcRenderer.send('window-action', 'restore');
    isMaximized.value = false;
  } else {
    ipcRenderer.send('window-action', 'max');
    isMaximized.value = true;
  }
}

function minWindow() {
  ipcRenderer.send('window-action', 'min');
}

function closeWindow() {
  ipcRenderer.send('window-action', 'close');
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
