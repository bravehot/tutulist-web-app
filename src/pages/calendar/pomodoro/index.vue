<script setup lang="ts">
import ChangeTheme from "../components/ChangeTheme.vue";
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <section class="h-14 flex justify-end px-2">
        <ChangeTheme />
      </section>
    </n-layout-header>
    <n-layout-content class="h-full">
      <section class="w-full p-10 pb-0 container">
        <header class="h-20">
          <h2
            class="text-xl text-neutral-700 dark:text-neutral-300 tracking-wider mb-4"
          >
            番茄时钟
          </h2>
          <h3 class="mb-5">
            <n-button
              text
              tag="a"
              href="https://baike.baidu.com/item/%E7%95%AA%E8%8C%84%E5%B7%A5%E4%BD%9C%E6%B3%95/6353502"
              target="_blank"
              type="primary"
            >
              番茄工作法，
            </n-button>
            请珍惜那无人打扰的 25 分钟。
          </h3>
        </header>
      </section>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.container {
  max-width: none;
  height: calc(100vh - 57px);
  .content {
    height: calc(100% - 100px);
  }
}
</style>
