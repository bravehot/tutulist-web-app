<script setup lang="ts">
import {
  provide,
  ref,
  onMounted,
  onUnmounted,
  reactive,
  computed,
  shallowRef,
  readonly,
  watch,
  watchEffect,
} from "vue";
import { DndProvider } from "vue3-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { throttle, lte, isEqual } from "lodash-es";

import CustomDragLayer from "./CustomDragLayer.vue";
import Day from "./Day.vue";
import Popover from "../Popover/index.vue";
import PopoverAdd from "../PopoverAdd/index.vue";
import PopoverAll from "../PopoverAll/index.vue";

import {
  addEventInfo,
  getEventList,
  handleMoveTodoRequest,
  removeEventById,
  updateEventInfo as updateEventInfoRequest,
} from "@/service/calendar/calendar";

import useCalendarStore from "@/stores/calendar";
import { getDateTimeList, getRenderEventList } from "../../utils";

import {
  CalendarEventInfo,
  CalendarInfoType,
  CalendarKey,
  CreateEvent,
  EventType,
  PopoverPosition,
  PopoverTarget,
  SourceEventType,
} from "@/types/components/calendar";
import { PopoverKey } from "@/types/components/popover";

const props = defineProps<{
  currentTime: number;
}>();

const calendarStore = useCalendarStore();

const containerRef = ref<HTMLElement | null>(null);

const lastDrogTime = ref<string>();
const isPopoverShow = ref<boolean>(false);
const clickEventInfo = ref<EventType | null>(null);

const folderId = ref<number>(-1);

const popoverAllInfo = reactive<{
  isShow: boolean;
  dateInfo: { dateIndex: number; fullTime: string } | null;
  eventList: CalendarEventInfo[] | null;
  positionInfo: PopoverPosition | null;
}>({
  isShow: false,
  dateInfo: null,
  eventList: null,
  positionInfo: null,
});

const lastClickInfo = reactive({
  id: -1,
  dateIndex: -1,
});
const popoverInfo = reactive<{
  positionInfo: PopoverPosition | null;
  isRange: boolean;
}>({
  positionInfo: null,
  isRange: false,
});
const resizeStyleInfo = reactive<{
  width: number;
  height: number;
}>({
  width: 0,
  height: 0,
});

const eventList = ref<SourceEventType[]>([]);
const calendarInfo = ref<CalendarInfoType[]>([]);
const renderEventList = shallowRef<CalendarEventInfo[][]>([]);
const showMaxCount = ref(0);

const startEndTimeByMonth = computed(() => {
  if (calendarInfo.value) {
    return {
      start: calendarInfo.value[0].fullTime,
      end: calendarInfo.value[calendarInfo.value.length - 1].fullTime,
    };
  }
  return {
    start: "",
    end: "",
  };
});

onMounted(() => {
  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);
  window.addEventListener("resize", handleResize);
  handleResizeStyle();
  getCurrentEventList();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

watchEffect(async () => {
  const { renderList } = getRenderEventList(
    calendarInfo.value,
    eventList.value
  );
  renderEventList.value = renderList;
});

watch([() => props.currentTime, () => calendarStore.isStartSunday], () => {
  getCurrentEventList();
});

watch(
  () => isPopoverShow.value,
  (isShow) => {
    if (!isShow) {
      setInitialPopoverStatus();
    }
  }
);

const getDOMList = () => {
  const container = containerRef.value?.children;
  if (container) {
    return Array.from(container) as HTMLElement[];
  }
  return null;
};

const getCurrentEventList = async () => {
  const [year, month] = dayjs(props.currentTime).format("YYYY-MM").split("-");

  calendarInfo.value = getDateTimeList(
    Number(year),
    Number(month),
    calendarStore.isStartSunday
  );

  const start = calendarInfo.value[0].fullTime;
  const end = calendarInfo.value[calendarInfo.value.length - 1].fullTime;
  const { code, data } = await getEventList({
    startTime: start,
    endTime: end,
  });
  if (code === 200) {
    const { renderList } = getRenderEventList(calendarInfo.value, data);
    eventList.value = data;
    renderEventList.value = renderList;
  }
};

const setRenderEventList = (eventList: SourceEventType[]) => {
  const { renderList } = getRenderEventList(calendarInfo.value, eventList);
  renderEventList.value = renderList;
};

const handleResizeStyle = () => {
  const TIME_HEADER_HEIGHT = 28;
  const EVENT_HEIGHT = 24;
  const MORE_SELECT_HEIGHT = 20;

  const offsetWidth = containerRef.value?.offsetWidth;
  const offsetHeight = containerRef.value?.offsetHeight;
  resizeStyleInfo.width = offsetWidth ? Math.round(offsetWidth / 7) : 0;
  resizeStyleInfo.height = offsetHeight ? Math.round(offsetHeight / 6) : 0;

  // 求最多能展示的事件个数
  const eventContainerHeight =
    resizeStyleInfo.height - TIME_HEADER_HEIGHT - MORE_SELECT_HEIGHT;
  showMaxCount.value = Math.floor(
    Math.round(eventContainerHeight) / EVENT_HEIGHT
  );
};

const handleResize = throttle(handleResizeStyle, 500);

// 事件拖动的 hover 样式
const handleEventHover = (id: number, dropTime: string, dateIndex: number) => {
  // 避免重复执行
  if (lastDrogTime.value !== dropTime) {
    lastDrogTime.value = dropTime;
    const dragEvent = getEventById(id);
    const dropTimeIndex = dateIndex;

    if (dragEvent && dropTimeIndex !== -1) {
      const { startTime, endTime } = dragEvent;
      const eventDiffDays = dayjs(endTime).diff(startTime, "d");

      const currentRenderCount = dropTimeIndex + eventDiffDays;
      const maxCount = calendarInfo.value.length - 1;

      clearHoverStatus();
      // 判断是否有未来事件延伸到下一个月
      if (currentRenderCount > maxCount) {
        const needRenderCount = eventDiffDays - (currentRenderCount - maxCount);
        for (
          let index = maxCount;
          index >= maxCount - needRenderCount;
          index--
        ) {
          calendarInfo.value[index].hover = true;
        }
      } else {
        // 事件只在本月拖拽
        setHoverStatus(dropTimeIndex, dropTimeIndex + eventDiffDays);
      }
    }
  }
};

// 处理事件拖拽
const handleEventDrag = async (id: number, dropTime: string) => {
  const dragEvent = getEventById(id);
  if (dragEvent) {
    const { startTime, endTime } = dragEvent;
    const eventDiffDays = dayjs(endTime).diff(startTime, "d");
    // 开始时间设置为 dropTime，结束时间设置为 dropTime + 事件的开始和结束时间差
    dragEvent.startTime = dropTime;
    dragEvent.endTime = dayjs(dragEvent.startTime)
      .add(eventDiffDays, "d")
      .format("YYYY-MM-DD");

    lastDrogTime.value = "";
    const { code } = await updateEventInfo(dragEvent);
    clearHoverStatus();
    // popoverAll 是打开的，更新 popoverAll 中的 event
    if (code === 200 && popoverAllInfo.isShow && popoverAllInfo.dateInfo) {
      const { dateIndex } = popoverAllInfo.dateInfo;
      popoverAllInfo.eventList = renderEventList.value[dateIndex];
    }
  }
};

// 清除日历中的 hover 状态
const clearHoverStatus = () => {
  calendarInfo.value.forEach((calendarInfo) => {
    calendarInfo.hover = false;
  });
};

const getEventById = (eventId: number): SourceEventType | undefined => {
  return eventList.value.find((eventItem) => +eventItem.id === +eventId);
};

const handleForwardDrag = (id: number, startTime: string) => {
  const dragEvent = getEventById(id);
  if (dragEvent) {
    if (dragEvent?.startTime === startTime) {
      lastDrogTime.value = "";
    }
    updateEventInfo(dragEvent);
    clearHoverStatus();
  }
};

const handleForwardHover = (
  id: number,
  dropTime: string,
  dateIndex: number
) => {
  if (lastDrogTime.value !== dropTime) {
    lastDrogTime.value = dropTime;
    const dragEvent = getEventById(id);
    if (dragEvent) {
      const { endTime } = dragEvent;
      const endTimeIndex = calendarInfo.value.findIndex(
        (calendar) => calendar.fullTime === endTime
      );
      const isCanDrag = dayjs(dropTime).isSameOrBefore(endTime);

      if (isCanDrag) {
        clearHoverStatus();
        const end =
          endTimeIndex === -1 ? calendarInfo.value.length - 1 : endTimeIndex;
        dragEvent.startTime = dropTime;
        setHoverStatus(dateIndex, end);
      }
    }
  }
};

const handleBackwardDrag = (id: number, endTime: string) => {
  const dragEvent = getEventById(id);
  if (dragEvent) {
    if (dragEvent.endTime === endTime) {
      lastDrogTime.value = "";
    }
    clearHoverStatus();
    updateEventInfo(dragEvent);
  }
};

const handleBackwardHover = (
  id: number,
  dropTime: string,
  dateIndex: number
) => {
  if (lastDrogTime.value !== dropTime) {
    lastDrogTime.value = dropTime;
    const dragEvent = getEventById(id);
    if (dragEvent) {
      const { startTime } = dragEvent;
      const startIndex = calendarInfo.value.findIndex(
        (calendar) => calendar.fullTime === startTime
      );
      const isCanDrag = dayjs(dropTime).isSameOrAfter(startTime);
      if (isCanDrag) {
        clearHoverStatus();
        dragEvent.endTime = dropTime;
        const start = startIndex === -1 ? 0 : startIndex;
        setHoverStatus(start, dateIndex);
      }
    }
  }
};

const createNewEvent = (start: CreateEvent, end: CreateEvent) => {
  const domList = getDOMList();
  if (domList) {
    const list = domList;
    const drag = list[start.dateIndex];
    const drop = list[end.dateIndex];
    isPopoverShow.value = true;
    popoverInfo.positionInfo = {
      start: {
        ...start,
        target: drag,
      },
      end: {
        ...end,
        target: drop,
      },
      isRange: true,
    };
  }
};

const createNewEventHover = (dragIndex: number, dropIndex: number) => {
  const isIte = lte(dragIndex, dropIndex);
  let startIndex = dragIndex;
  let endIndex = dropIndex;
  // 从前往后，或者从后往前，两种可能
  if (!isIte) {
    startIndex = dropIndex;
    endIndex = dragIndex;
  }
  clearHoverStatus();
  setHoverStatus(startIndex, endIndex);
};

const setHoverStatus = (startIndex: number, endIndex: number) => {
  for (let index = startIndex; index <= endIndex; index++) {
    calendarInfo.value[index].hover = true;
  }
};

const createEventByTime = (time: string) => {
  const dateIndex = getDateIndex(time);
  const domList = getDOMList();
  if (dateIndex !== -1 && domList) {
    const target = domList[dateIndex];
    handlePopoverVisiable(null, false, {
      time,
      dateIndex,
      target,
    });
  }
};

const handlePopoverVisiable = (
  eventInfo: EventType | null,
  isRange: boolean,
  start: PopoverTarget,
  end?: PopoverTarget,
  eventId?: number
) => {
  const { dateIndex } = start;
  clearHoverStatus();
  if (
    popoverAllInfo.isShow &&
    start.dateIndex !== popoverAllInfo.dateInfo?.dateIndex
  ) {
    setPopoverAllClose();
    return;
  }
  // 点击的是事件
  if (eventId) {
    if (eventId === lastClickInfo.id) {
      isPopoverShow.value = false;
      return;
    }
    lastClickInfo.id = eventId;
    clickEventInfo.value = eventInfo;
  } else {
    if (dateIndex === lastClickInfo.dateIndex || isPopoverShow.value) {
      isPopoverShow.value = false;
      return;
    }
    lastClickInfo.dateIndex = dateIndex;
    calendarInfo.value[dateIndex].hover = true;
  }
  isPopoverShow.value = true;
  popoverInfo.positionInfo = {
    start,
    end: end ?? null,
    isRange,
  };
};

// 处理连贯事件
const handleRangePopoverVisiable = (
  eventInfo: EventType,
  dateIndex: number,
  clickTarget: {
    target: HTMLElement;
    type: "start" | "end";
  } | null
) => {
  clearHoverStatus();
  if (popoverAllInfo.isShow) {
    setPopoverAllClose();
  }
  const { id, startTime, endTime } = eventInfo;
  const { start, end } = startEndTimeByMonth.value;
  clickEventInfo.value = eventInfo;
  if (id === lastClickInfo.id) {
    isPopoverShow.value = false;
    return;
  }
  const isBefore = dayjs(startTime).isBefore(start);
  const isAfter = dayjs(endTime).isAfter(end);

  const domList = getDOMList();
  if (domList) {
    // 点击的事件跨月，那么取该事件在本月的第一天为弹出位置
    if (isBefore || isAfter) {
      const currentDateIndex = isBefore ? 0 : getDateIndex(startTime);
      handlePopoverVisiable(
        eventInfo,
        false,
        {
          time: startTime,
          dateIndex: currentDateIndex,
          target: getEventTarget(currentDateIndex, id, domList),
        },
        {
          time: endTime,
          dateIndex: getDateIndex(endTime),
        },
        id
      );
    } else {
      lastClickInfo.id = id;
      clickEventInfo.value = eventInfo;

      const startTarget: PopoverTarget = {
        time: startTime,
        dateIndex: -1,
      };
      const endTarget: PopoverTarget = {
        time: endTime,
        dateIndex: -1,
      };
      if (clickTarget) {
        const { target, type } = clickTarget;
        if (type === "start") {
          startTarget.target = target;
          startTarget.dateIndex = dateIndex;
        } else {
          endTarget.target = target;
          endTarget.dateIndex = dateIndex;
        }
      }
      const domList = getDOMList();
      if (domList) {
        if (!startTarget.target) {
          const dateIndex = getDateIndex(startTarget.time);
          startTarget.dateIndex = dateIndex;
          startTarget.target = getEventTarget(dateIndex, id, domList);
        }
        if (!endTarget.target) {
          const dateIndex = getDateIndex(endTarget.time);
          endTarget.dateIndex = dateIndex;
          endTarget.target = getEventTarget(dateIndex, id, domList);
        }

        isPopoverShow.value = true;
        popoverInfo.positionInfo = {
          start: startTarget,
          end: endTarget,
          isRange: true,
        };
      }
    }
  }
};

const setInitialPopoverStatus = () => {
  isPopoverShow.value = false;
  popoverInfo.positionInfo = null;
  lastClickInfo.dateIndex = -1;
  lastClickInfo.id = -1;
  clickEventInfo.value = null;
  clearHoverStatus();
};

const setPopoverShow = (show: boolean) => {
  isPopoverShow.value = show;
};

const getDateIndex = (time: string): number => {
  return calendarInfo.value.findIndex((calendar) => {
    return calendar.fullTime === time;
  });
};

const getEventTarget = (
  dateIndex: number,
  id: number,
  domList: HTMLElement[]
): HTMLElement => {
  const eventContainer = Array.from(
    domList[dateIndex].getElementsByClassName("event-container")
  )[0].children;
  const currentEventIndex = renderEventList.value[dateIndex].findIndex(
    (eventItem) => eventItem?.id === id
  );
  return eventContainer[currentEventIndex] as HTMLElement;
};

const saveEventInfo = async (
  eventInfo: Omit<SourceEventType, "id"> & { id?: number }
) => {
  const eventId = eventInfo.id ?? 0;
  if (eventId > 0) {
    const findEvent = getEventById(eventId);
    const isSame = isEqual(findEvent, eventInfo);

    if (!isSame && findEvent) {
      const { code } = await updateEventInfo(eventInfo as SourceEventType);
      if (code === 200) {
        findEvent.title = eventInfo.title;
        findEvent.description = eventInfo.description;
        findEvent.isDone = eventInfo.isDone;
        findEvent.priority = eventInfo.priority;
        findEvent.startTime = eventInfo.startTime;
        findEvent.endTime = eventInfo.endTime;
      }
    }
  } else {
    // 新增时默认的 id 为 -1
    delete eventInfo.id;
    const { code, data } = await addEventInfo(eventInfo);
    if (code === 200) {
      eventList.value.push(data);
      window.$message.success("添加成功");
      setRenderEventList(eventList.value);
    }
  }
};

const updateEventInfo = async (
  eventInfo: SourceEventType
): Promise<{ code: number }> => {
  const { code } = await updateEventInfoRequest(eventInfo);
  if (code === 200) {
    window.$message.success("更新成功");
  }
  return { code };
};

defineExpose({
  createEventByTime,
});

const handleRemoveEvent = async (id: number) => {
  const { code } = await removeEventById(id);
  if (code === 200) {
    const findIndex = eventList.value.findIndex(
      (eventInfo) => eventInfo.id === id
    );
    if (findIndex !== -1) {
      eventList.value.splice(findIndex, 1);
    }
    setPopoverShow(false);
    window.$message.success("删除成功");
  }
};

const handlePopoverAllVisiable = (
  isShow: boolean,
  target: HTMLElement,
  dateInfo: CalendarInfoType
) => {
  if (isShow) {
    if (isPopoverShow.value) {
      isPopoverShow.value = false;
    }
    const { dateIndex, fullTime } = dateInfo;
    popoverAllInfo.isShow = isShow;
    popoverAllInfo.dateInfo = dateInfo;
    popoverAllInfo.eventList = renderEventList.value[dateIndex];
    popoverAllInfo.positionInfo = {
      start: {
        dateIndex,
        time: fullTime,
        target,
      },
      end: null,
      isRange: false,
    };
  }
};

const setPopoverAllClose = () => {
  if (isPopoverShow.value) {
    isPopoverShow.value = false;
  }
  popoverAllInfo.isShow = false;
  popoverAllInfo.dateInfo = null;
  popoverAllInfo.eventList = null;
  popoverAllInfo.positionInfo = null;
};

const handleMoveTodo = async (folderId: number) => {
  if (clickEventInfo.value) {
    const eventId = clickEventInfo.value.id;
    const { code } = await handleMoveTodoRequest({
      eventId,
      folderId,
    });
    if (code == 200) {
      const findIndex = eventList.value.findIndex(
        (eventInfo) => eventInfo.id === eventId
      );
      if (findIndex !== -1) {
        eventList.value.splice(findIndex, 1);
      }
      window.$message.success("移动成功");
      setPopoverShow(false);
    }
  }
};

provide(CalendarKey, {
  handleEventDrag,
  handleEventHover,
  handleForwardDrag,
  handleForwardHover,
  handleBackwardDrag,
  handleBackwardHover,
  createNewEvent,
  createNewEventHover,
  clearHoverStatus,
  setHoverStatus,
  getDateIndex,
  handleRemoveEvent,
  clickEventId: computed(() => clickEventInfo.value?.id ?? -1),
});

provide(PopoverKey, {
  handlePopoverVisiable,
  handlePopoverAllVisiable,
  handleRangePopoverVisiable,
  setPopoverShow,
  saveEventInfo,
  isPopoverShow: readonly(isPopoverShow),
});
</script>
<template>
  <DndProvider :backend="HTML5Backend">
    <section
      ref="containerRef"
      class="date-container grid overflow-hidden grid-cols-7 grid-rows-6"
    >
      <Day
        v-for="(dateInfo, index) in calendarInfo"
        :key="dateInfo.fullTime"
        :date-info="dateInfo"
        :event-list="renderEventList[index]"
        :drop-style="resizeStyleInfo"
        :show-max-count="showMaxCount"
      />
      <!-- 新增、编辑、查看的 popover -->
      <Popover
        :show="isPopoverShow"
        :position-info="popoverInfo.positionInfo"
        :drop-style="resizeStyleInfo"
        :event-id="clickEventInfo?.id"
        raw
        @close="setInitialPopoverStatus"
      >
        <PopoverAdd
          :time-info="popoverInfo.positionInfo"
          :click-event-info="clickEventInfo"
          :get-date-index="getDateIndex"
          :set-hover-status="setHoverStatus"
          @remove="handleRemoveEvent"
          @save="saveEventInfo"
          @show="setPopoverShow"
          @move="handleMoveTodo"
        />
      </Popover>
    </section>
    <!-- 
      自定义拖动层
      @doc: https://hcg1023.github.io/vue3-dnd/example/drag-around/custom-drag-layer.html
    -->
    <CustomDragLayer :drag-width="resizeStyleInfo.width" />

    <!-- 点击更多项的 popover -->
    <Popover
      :show="popoverAllInfo.isShow"
      :drop-style="resizeStyleInfo"
      :position-info="popoverAllInfo.positionInfo"
      :overlap="true"
      :popover-style="{
        width: resizeStyleInfo.width * 1.1,
        height: 'auto',
      }"
      @close="setPopoverAllClose"
    >
      <PopoverAll
        :date-info="popoverAllInfo.dateInfo"
        :event-list="popoverAllInfo.eventList"
        @close="setPopoverAllClose"
      />
    </Popover>
  </DndProvider>
</template>

<style scoped lang="css">
.date-container {
  /* 77 = 56(日期选择器的高度) + 21(周信息的高度 ) */
  height: calc(100vh - 77px);
}
</style>
