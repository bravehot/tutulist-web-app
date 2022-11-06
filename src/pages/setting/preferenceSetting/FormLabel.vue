<script setup lang="ts">
import { Info20Regular as InfoIcon } from "@vicons/fluent";
</script>
<template>
  <section class="flex items-center h-7 leading-7">
    <slot />
    <n-tooltip placement="right">
      <template #trigger>
        <span class="flex ml-2 items-center text-gray-400 cursor-pointer">
          <n-icon :size="16">
            <InfoIcon />
          </n-icon>
        </span>
      </template>
      <slot name="tooltipText" />
    </n-tooltip>
  </section>
</template>
