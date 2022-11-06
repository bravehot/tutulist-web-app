<template>
  <section class="grid grid-cols-7">
    <div
      v-for="weekName in currentList"
      :key="weekName"
      class="text-left text-xs pb-1 pl-2 border-b border-gray-200 dark:border-gray-500"
    >
      {{ weekName }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import useCalendarStore from "@/stores/calendar";

const calendarStore = useCalendarStore();

const currentList = ref();

watchEffect(() => {
  currentList.value = calendarStore.weekList;
});
</script>
