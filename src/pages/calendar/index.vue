<script setup lang="ts">
import Menu from "./home/components/Menu.vue";
</script>
<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      collapsed
      :show-trigger="false"
    >
      <Menu />
    </n-layout-sider>
    <n-layout-content class="box-border overflow-hidden h-screen">
      <!-- <router-view v-slot="{ Component }">
        <keep-alive include="DateContent">
          <component :is="Component" />
        </keep-alive>
      </router-view> -->
      <router-view />
    </n-layout-content>
  </n-layout>
</template>
