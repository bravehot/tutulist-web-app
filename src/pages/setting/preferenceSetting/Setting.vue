<script setup lang="ts">
import { reactive, toRefs, watchEffect } from "vue";
import { Save20Regular as SaveIcon } from "@vicons/fluent";

import FormLabel from "./FormLabel.vue";

import useCalendarStore from "@/stores/calendar";
import useGlobalStore from "@/stores/global";

import { StartWeekEnum, WeekNameEnum } from "@/types/setting/calendar";
import { ThemeEnum } from "@/types/enum";

import { handleSaveSetting } from "@/service/setting";

const calendarStore = useCalendarStore();
const globalStore = useGlobalStore();

const settingInfo = reactive({
  startWeekName: StartWeekEnum.MONDAY,
  weekName: WeekNameEnum.STAR_WEEK,
  theme: ThemeEnum.SYSTEM,
});

const { isStartSunday, isStarWeek } = toRefs(calendarStore);
const { settingTheme } = toRefs(globalStore);

const handleSave = async () => {
  const { code } = await handleSaveSetting({
    startWeek: settingInfo.startWeekName,
    weekName: settingInfo.weekName,
    theme: settingInfo.theme,
  });
  if (code === 200) {
    calendarStore.setStartSunday(settingInfo.startWeekName);
    calendarStore.setStarWeek(settingInfo.weekName);

    globalStore.settingTheme = settingInfo.theme;

    if (settingInfo.theme !== ThemeEnum.SYSTEM) {
      globalStore.handleTheme(
        settingInfo.theme === ThemeEnum.DARK ? "dark" : null
      );
    } else {
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const theme = matchMedia.matches ? "dark" : null;
      globalStore.handleTheme(theme);
    }
    window.$message.success("保存成功");
  }
};

watchEffect(() => {
  settingInfo.weekName = isStarWeek.value;
  settingInfo.startWeekName = isStartSunday.value;
  settingInfo.theme = settingTheme.value;
});
</script>
<template>
  <n-card title="日历视角" class="h-full">
    <template #header-extra>
      <n-button text type="primary" @click="handleSave">
        <template #icon>
          <n-icon>
            <SaveIcon />
          </n-icon>
        </template>
        保存
      </n-button>
    </template>

    <n-form :model="settingInfo">
      <n-form-item label="起始周">
        <n-radio-group v-model:value="settingInfo.startWeekName">
          <n-space>
            <n-radio value="monday"> 星期一 </n-radio>
            <n-radio value="sunday"> 星期日 </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <FormLabel>
        周命名
        <template #tooltipText> 你喜欢周一，还是星期一 </template>
      </FormLabel>
      <n-form-item :show-label="false">
        <n-radio-group v-model:value="settingInfo.weekName">
          <n-space>
            <n-radio value="week"> 周 </n-radio>
            <n-radio value="starWeek"> 星期 </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="系统主题">
        <n-radio-group v-model:value="settingInfo.theme">
          <n-space>
            <n-radio :value="ThemeEnum.DARK"> 暗黑模式 </n-radio>
            <n-radio :value="ThemeEnum.LIGHT"> 亮色模式 </n-radio>
            <n-radio :value="ThemeEnum.SYSTEM"> 跟随系统 </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
    </n-form>
  </n-card>
</template>
