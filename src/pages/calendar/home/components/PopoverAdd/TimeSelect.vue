<script setup lang="ts">
import dayjs from "dayjs";
import { computed, reactive, watchEffect } from "vue";
import weekOfYear from "dayjs/plugin/weekOfYear";
import updateLocale from "dayjs/plugin/updateLocale";
import { CalendarLtr20Regular as CalendarIcon } from "@vicons/fluent";

import useCalendarStore from "@/stores/calendar";

import { TimeStatusEnum } from "@/types/components/popover";
import { StartWeekEnum } from "@/types/setting/calendar";

dayjs.extend(weekOfYear);

const TODAY_1 = dayjs().format("YYYY-MM-DD");
const THIS_WEEK = dayjs().week();

const props = defineProps<{
  startTime: string;
  endTime: string;
  eventId?: number;
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (e: "change", time: { startTime: string; endTime: string }): void;
}>();

const calendarStore = useCalendarStore();

const timeInfo = reactive({
  startTime: dayjs().valueOf(),
  endTime: dayjs().valueOf(),
});

const selectTimeText = computed(() => {
  const { startTime, endTime } = props;
  if (startTime === endTime) {
    return dayjs(startTime).format("MM月DD日");
  }
  return `${dayjs(startTime).format("MM月DD日")} - ${dayjs(endTime).format(
    "MM月DD日"
  )}`;
});

const isSameTime = computed(() => {
  const { startTime, endTime } = props;
  return startTime === endTime;
});

const timeDetailText = computed(() => {
  let detailTimeText = "";
  let otherWeekText = "";

  const { startTime, endTime } = props;
  const diffDays =
    endTime === TODAY_1 ? 0 : dayjs(startTime).diff(TODAY_1, "d");
  const selectWeek = dayjs(startTime).week();
  let selectDay =
    calendarStore.isStartSunday !== StartWeekEnum.SUNDAY
      ? dayjs(startTime).get("day") - 1
      : dayjs(startTime).get("day");

  // 周天为 0
  if (selectDay < 0) {
    selectDay = 6;
  }

  // 处理上周、本周和下周的信息
  const diffWeeks = selectWeek - THIS_WEEK;

  if ([-1, 0, 1].includes(diffWeeks)) {
    let weekName = "";
    let dayName = "";

    switch (diffWeeks) {
      case -1:
        weekName = `上${calendarStore.weekList[selectDay]}`;
        break;
      case 1:
        weekName = `下${calendarStore.weekList[selectDay]}`;
        break;
      default:
        weekName = `${calendarStore.weekList[selectDay]}`;
        break;
    }
    if (Math.abs(diffDays) <= 2) {
      const isLast = diffDays !== 0 && diffDays < 0;
      switch (Math.abs(diffDays)) {
        case 0:
          dayName = "今天";
          break;
        case 1:
          dayName = isLast ? "昨天" : "明天";
          break;
        case 2:
          dayName = isLast ? "前天" : "后天";
          break;
      }
    }
    weekName = dayName ? "" : weekName;
    detailTimeText = `${weekName}${dayName}`;
  } else {
    if (diffDays < 0) {
      otherWeekText = `延期${Math.abs(diffDays)}天`;
    } else {
      otherWeekText = `${diffDays}天后`;
    }
  }

  const timeStatus =
    diffDays !== 0
      ? diffDays < 0
        ? TimeStatusEnum.LASTDAY
        : TimeStatusEnum.NEXTDAY
      : TimeStatusEnum.TODAY;

  return {
    detailTimeText,
    otherWeekText,
    timeStatus,
  };
});

const timeStatusType = computed(() => {
  const { timeStatus } = timeDetailText.value;

  switch (timeStatus) {
    case TimeStatusEnum.TODAY:
      return "success";
    case TimeStatusEnum.LASTDAY:
      return "error";
    case TimeStatusEnum.NEXTDAY:
      return "info";
    default:
      return "";
  }
});

watchEffect(() => {
  timeInfo.startTime = dayjs(props.startTime).valueOf();
  timeInfo.endTime = dayjs(props.endTime).valueOf();
});

const startTimeDisabled = (ts: number) => {
  return dayjs(ts).isAfter(timeInfo.endTime);
};

const endTimeDisabled = (ts: number) => {
  return dayjs(ts).isBefore(timeInfo.startTime, "d");
};

const handleUpdateTime = (value: number, type: "start" | "end") => {
  timeInfo[`${type}Time`] = value;
};

const handleTimeFormat = (time: number | string): string => {
  return dayjs(time).format("YYYY-MM-DD");
};

const handleSave = () => {
  emits("change", {
    startTime: handleTimeFormat(timeInfo.startTime),
    endTime: handleTimeFormat(timeInfo.endTime),
  });
};

watchEffect(() => {
  dayjs.extend(updateLocale);
  const isMonday = calendarStore.isStartSunday === StartWeekEnum.MONDAY;
  dayjs.updateLocale("en", {
    weekStart: isMonday ? 1 : 0,
  });
});
</script>
<template>
  <n-popconfirm
    v-if="!disabled"
    :show-icon="false"
    :on-positive-click="handleSave"
    placement="bottom-start"
    :to="false"
    :show-arrow="false"
  >
    <template #trigger>
      <n-button size="small" class="!-ml-2" quaternary :type="timeStatusType">
        <n-icon :size="24" class="mr-2">
          <CalendarIcon />
        </n-icon>

        <template v-if="isSameTime">
          {{ timeDetailText.detailTimeText }}
        </template>
        <span class="mr-2 ml-1">
          {{ selectTimeText }}
        </span>
        <template v-if="!eventId">
          {{ timeDetailText.otherWeekText }}
        </template>
      </n-button>
    </template>

    <section class="flex">
      <n-form label-placement="left" :model="timeInfo" size="small">
        <n-form-item label="开始时间">
          <n-date-picker
            v-model:value="timeInfo.startTime"
            :actions="[]"
            :to="false"
            type="date"
            format="MM月dd日"
            size="small"
            :is-date-disabled="startTimeDisabled"
            :on-update:value="(value: number) => handleUpdateTime(value,'start')"
          />
        </n-form-item>
        <n-form-item label="结束时间" class="end mb-2">
          <n-date-picker
            v-model:value="timeInfo.endTime"
            :actions="[]"
            type="date"
            format="MM月dd日"
            size="small"
            :to="false"
            :is-date-disabled="endTimeDisabled"
            :on-update:value="(value:number) => handleUpdateTime(value,'end')"
          />
        </n-form-item>
      </n-form>
    </section>
  </n-popconfirm>

  <n-el
    v-else
    tag="section"
    class="flex items-center cursor-default"
    style="color: var(--primary-color)"
  >
    <n-icon :size="24" class="mr-2">
      <CalendarIcon />
    </n-icon>

    <template v-if="isSameTime">
      {{ timeDetailText.detailTimeText }}
    </template>
    <span class="mr-2 ml-1">
      {{ selectTimeText }}
    </span>
    <template v-if="!eventId">
      {{ timeDetailText.otherWeekText }}
    </template>
  </n-el>
</template>

<style lang="scss" scoped>
.end {
  &:deep(.n-form-item-feedback-wrapper) {
    display: none;
  }
}
</style>
