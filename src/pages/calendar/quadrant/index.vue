<script setup lang="ts">
import { computed, onMounted, ref, reactive } from "vue";
import {
  Add20Filled as AddIcon,
  ChevronDown20Filled as ArrowIcon,
} from "@vicons/fluent";
import dayjs from "dayjs";
import { DndProvider } from "vue3-dnd";
import { NPopover } from "naive-ui";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isEqual } from "lodash-es";

import ChangeTheme from "../components/ChangeTheme.vue";
import EventList from "./EventList.vue";
import PopoverAdd from "../home/components/PopoverAdd/index.vue";
import Popover from "../home/components/Popover/index.vue";

import {
  addEventInfo,
  getEventList,
  handleMoveTodoRequest,
  removeEventById,
  updateEventInfo,
} from "@/service/calendar/calendar";

import {
  EventType,
  PopoverPosition,
  SourceEventType,
} from "@/types/components/calendar";
import { PriorityEnum } from "@/types/components/popover";

type QuadrantListType = {
  importantUrgent: SourceEventType[];
  importantNoturgent: SourceEventType[];
  unimportantUrgent: SourceEventType[];
  unimportantNoturgent: SourceEventType[];
};

const TODAY = dayjs().format("YYYY-MM-DD");

const popoverRef = ref<InstanceType<typeof NPopover>>();
const containerRef = ref<HTMLElement | null>(null);

const eventList = ref<QuadrantListType>();
const eventSourceList = ref<SourceEventType[]>([]);
const selectTime = ref(dayjs().format("YYYY-MM-DD"));

const popoverInfo = reactive<{
  isShow: boolean;
  positionInfo: PopoverPosition | null;
  clickEventInfo: SourceEventType | null;
}>({
  isShow: false,
  positionInfo: null,
  clickEventInfo: null,
});
const eventInfo = reactive({
  startTime: "",
  endTime: "",
  priority: PriorityEnum.UNIMPORTANT_NOTURGENT,
  isDone: false,
  title: "",
  description: "",
  id: -1,
});

const formatDateInfo = computed(() => {
  if (dayjs(selectTime.value).year() === dayjs(TODAY).year()) {
    return dayjs(selectTime.value).format("MM月DD日");
  }
  return dayjs(selectTime.value).format("YYYY年MM月DD日");
});

const popoverPlacement = computed(() => {
  const priority = eventInfo.priority;

  const isEdit = eventInfo.id > 0;

  if (!isEdit) {
    return "right-start";
  }

  const isTop = [
    PriorityEnum.IMPORTANT_URGENT,
    PriorityEnum.IMPORTANT_NOTURGENT,
  ];
  if (isTop.includes(priority)) {
    return "right-start";
  }
  return "right-end";
});

onMounted(() => {
  handleEventList();
});

const closePopover = () => {
  popoverInfo.isShow = false;
  popoverInfo.clickEventInfo = null;
  popoverInfo.positionInfo = null;
};

const handleEventList = async () => {
  const { code, data } = await getEventList({
    startTime: selectTime.value,
    endTime: selectTime.value,
  });
  if (code === 200) {
    eventSourceList.value = data;
    eventList.value = handleSortEventList(data);
  }
};

const handleSortEventList = (list: SourceEventType[]) => {
  const eventAllList: QuadrantListType = {
    importantUrgent: [],
    importantNoturgent: [],
    unimportantUrgent: [],
    unimportantNoturgent: [],
  };

  for (const eventItem of list) {
    switch (eventItem.priority) {
      case PriorityEnum.IMPORTANT_URGENT:
        eventAllList.importantUrgent.push(eventItem);
        break;
      case PriorityEnum.IMPORTANT_NOTURGENT:
        eventAllList.importantNoturgent.push(eventItem);
        break;
      case PriorityEnum.UNIMPORTANT_URGENT:
        eventAllList.unimportantUrgent.push(eventItem);
        break;
      case PriorityEnum.UNIMPORTANT_NOTURGENT:
        eventAllList.unimportantNoturgent.push(eventItem);
        break;
      default:
        break;
    }
  }
  return eventAllList;
};

const handleUpdate = (value: number) => {
  selectTime.value = dayjs(value).format("YYYY-MM-DD");
  popoverRef.value?.setShow(false);
  handleEventList();
};

const setEventInfo = (eventItem: SourceEventType, target: HTMLElement) => {
  popoverInfo.isShow = true;
  popoverInfo.clickEventInfo = eventItem;
  popoverInfo.positionInfo = {
    start: {
      time: eventItem.startTime,
      dateIndex: 0,
      target,
    },
    end: {
      time: eventItem.endTime,
      dateIndex: 0,
    },
    isRange: false,
  };
  handleEventInfo(eventItem);
};

const handleCreateEvent = (event: MouseEvent, priority: PriorityEnum) => {
  event.stopPropagation();
  setInitialEventInfo();
  popoverInfo.clickEventInfo = null;
  eventInfo.priority = priority;
  eventInfo.id = -1;
  let target = null;
  switch (priority) {
    case PriorityEnum.IMPORTANT_URGENT:
      target = document.getElementById("importantUrgent");
      break;
    case PriorityEnum.IMPORTANT_NOTURGENT:
      target = document.getElementById("importantNoturgent");
      break;
    case PriorityEnum.UNIMPORTANT_URGENT:
      target = document.getElementById("unimportantUrgent");
      break;
    case PriorityEnum.UNIMPORTANT_NOTURGENT:
      target = document.getElementById("unimportantNoturgent");
      break;
    default:
      break;
  }

  if (target) {
    popoverInfo.clickEventInfo = eventInfo as unknown as SourceEventType;
    popoverInfo.isShow = true;
    popoverInfo.positionInfo = {
      start: {
        time: selectTime.value,
        dateIndex: 0,
        target,
      },
      end: null,
      isRange: false,
    };
  }
};

const handleEventInfo = (eventItem: SourceEventType) => {
  const { startTime, endTime, id, title, description, priority, isDone } =
    eventItem;
  eventInfo.startTime = startTime;
  eventInfo.endTime = endTime;
  eventInfo.title = title;
  eventInfo.description = description ?? "";
  eventInfo.isDone = Boolean(isDone);
  eventInfo.priority = priority;
  eventInfo.id = id;
};

const handleSave = async (
  eventInfo: Omit<SourceEventType, "id"> & { id?: number }
) => {
  const eventId = eventInfo.id ?? 0;
  const findEvent = eventSourceList.value?.find(
    (item) => item.id === eventInfo.id
  );
  if (findEvent && !isSameInfo(findEvent, eventInfo)) {
    const { code } = await updateEventInfo(eventInfo as SourceEventType);
    if (code === 200) {
      findEvent.title = eventInfo.title;
      findEvent.description = eventInfo.description;
      findEvent.startTime = eventInfo.startTime;
      findEvent.endTime = eventInfo.endTime;
      findEvent.priority = eventInfo.priority;
      findEvent.isDone = eventInfo.isDone;
      window.$message.success("更新成功");
    }
  }
  if (eventId === -1) {
    delete eventInfo.id;
    const { code, data } = await addEventInfo(eventInfo);
    if (code === 200) {
      eventSourceList.value.push(data);
      eventList.value = handleSortEventList(eventSourceList.value);
      window.$message.success("添加成功");
    }
  }
};

const isSameInfo = (value: any, other: any) => {
  const {
    startTime: firstStartTime,
    endTime: firstEndTime,
    ...firstOtherInfo
  } = value;
  const { startTime, endTime, ...secondOtherInfo } = other;

  return isEqual(firstOtherInfo, secondOtherInfo);
};

const hanldeMove = async (
  priority: PriorityEnum,
  eventInfo: SourceEventType
) => {
  if (priority !== eventInfo.priority) {
    eventInfo.priority = priority;
    const { code } = await updateEventInfo(eventInfo);
    if (code === 200) {
      eventList.value = handleSortEventList(eventSourceList.value);
      window.$message.success("更新成功");
    }
  }
};

const handleRemove = async (eventId: number) => {
  const { code } = await removeEventById(eventId);
  if (code === 200) {
    removeEventList(eventId);
    closePopover();
    window.$message.success("删除成功");
  }
};

const removeEventList = (eventId: number) => {
  const findIndex = eventSourceList.value.findIndex(
    (eventItem) => eventItem.id === eventId
  );
  if (findIndex !== -1) {
    eventSourceList.value.splice(findIndex, 1);
    eventList.value = handleSortEventList(eventSourceList.value);
  }
};

const setInitialEventInfo = () => {
  eventInfo.startTime = "";
  eventInfo.endTime = "";
  eventInfo.priority = PriorityEnum.UNIMPORTANT_NOTURGENT;
  eventInfo.isDone = false;
  eventInfo.title = "";
  eventInfo.description = "";
  eventInfo.id = -1;
};

const handleMoveTodo = async (folderId: number) => {
  const eventId = eventInfo.id;
  const { code } = await handleMoveTodoRequest({
    eventId,
    folderId,
  });
  if (code === 200) {
    removeEventList(eventId);
    window.$message.success("移动成功");
    closePopover();
  }
};

const handleClickTitle = () => {
  window.open(
    "https://baike.baidu.com/item/%E6%97%B6%E9%97%B4%E2%80%9C%E5%9B%9B%E8%B1%A1%E9%99%90%E2%80%9D%E6%B3%95/6556550"
  );
};
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <section class="h-14 flex justify-end px-2">
        <ChangeTheme />
      </section>
    </n-layout-header>
    <n-layout-content class="h-full">
      <section class="w-full px-10 pt-5 pb-0 container">
        <header class="h-10">
          <section class="flex items-center mb-4">
            <h2
              class="text-xl mr-3 text-neutral-700 dark:text-neutral-300 tracking-wider cursor-pointer"
              @click="handleClickTitle"
            >
              时间四象限
            </h2>
            <n-popover
              ref="popoverRef"
              trigger="click"
              placement="bottom-start"
              :style="{
                padding: '0 5px 0',
              }"
            >
              <template #trigger>
                <n-button
                  text
                  type="primary"
                  class="flex flex-row-reverse self-end"
                >
                  {{ TODAY === selectTime ? "今天" : formatDateInfo }}
                  <template #icon>
                    <n-icon><ArrowIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              <n-date-picker
                :value="dayjs(selectTime).valueOf()"
                panel
                type="date"
                :on-update:value="handleUpdate"
              />
            </n-popover>
          </section>
        </header>
        <DndProvider :backend="HTML5Backend">
          <section
            ref="containerRef"
            class="grid gap-4 grid-cols-2 grid-rows-2 content"
          >
            <n-card
              :content-style="{
                padding: '0 20px',
                overflowY: 'auto',
              }"
            >
              <template #header>
                <n-button
                  id="importantUrgent"
                  text
                  type="error"
                  size="large"
                  class="!h-7"
                >
                  重要且紧急
                </n-button>
              </template>

              <template #header-extra>
                <n-button
                  secondary
                  circle
                  size="small"
                  @click="
                    handleCreateEvent($event, PriorityEnum.IMPORTANT_URGENT)
                  "
                >
                  <template #icon>
                    <n-icon>
                      <AddIcon />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <EventList
                :event-list="eventList?.importantUrgent ?? null"
                :priority="PriorityEnum.IMPORTANT_URGENT"
                @set-event="setEventInfo"
                @move="hanldeMove"
              />
            </n-card>

            <n-card
              :content-style="{
                padding: '0 20px',
                overflowY: 'auto',
              }"
            >
              <template #header>
                <n-button
                  id="importantNoturgent"
                  text
                  type="warning"
                  size="large"
                  >重要不紧急</n-button
                >
              </template>
              <template #header-extra>
                <n-button
                  secondary
                  circle
                  size="small"
                  @click="
                    handleCreateEvent($event, PriorityEnum.IMPORTANT_NOTURGENT)
                  "
                >
                  <template #icon>
                    <n-icon>
                      <AddIcon />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <EventList
                :event-list="eventList?.importantNoturgent ?? null"
                :priority="PriorityEnum.IMPORTANT_NOTURGENT"
                @set-event="setEventInfo"
                @move="hanldeMove"
              />
            </n-card>

            <n-card
              :content-style="{
                padding: '0 20px',
                overflowY: 'auto',
              }"
            >
              <template #header>
                <n-button id="unimportantUrgent" text type="info" size="large"
                  >不重要但紧急
                </n-button>
              </template>
              <template #header-extra>
                <n-button
                  secondary
                  circle
                  size="small"
                  @click="
                    handleCreateEvent($event, PriorityEnum.UNIMPORTANT_URGENT)
                  "
                >
                  <template #icon>
                    <n-icon>
                      <AddIcon />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <EventList
                :event-list="eventList?.unimportantUrgent ?? null"
                :priority="PriorityEnum.UNIMPORTANT_URGENT"
                @set-event="setEventInfo"
                @move="hanldeMove"
              />
            </n-card>

            <n-card
              :content-style="{
                padding: '0 20px',
                overflowY: 'auto',
              }"
            >
              <template #header>
                <n-button
                  id="unimportantNoturgent"
                  text
                  type="primary"
                  size="large"
                >
                  不重要不紧急
                </n-button>
              </template>
              <template #header-extra>
                <n-button
                  secondary
                  circle
                  size="small"
                  @click="
                    handleCreateEvent(
                      $event,
                      PriorityEnum.UNIMPORTANT_NOTURGENT
                    )
                  "
                >
                  <template #icon>
                    <n-icon>
                      <AddIcon />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <EventList
                :event-list="eventList?.unimportantNoturgent ?? null"
                :priority="PriorityEnum.UNIMPORTANT_NOTURGENT"
                @set-event="setEventInfo"
                @move="hanldeMove"
              />
            </n-card>
          </section>
        </DndProvider>
      </section>
      <Popover
        :show="popoverInfo.isShow"
        :drop-style="{
          width: eventInfo.id > 0 ? 120 : 100,
          height: 50,
        }"
        :position-info="popoverInfo.positionInfo"
        :placement="popoverPlacement"
        raw
        @close="closePopover"
      >
        <PopoverAdd
          :time-info="popoverInfo.positionInfo"
          :click-event-info="(popoverInfo.clickEventInfo as EventType)"
          disabled-priority
          disabled-time
          @save="handleSave"
          @remove="handleRemove"
          @move="handleMoveTodo"
        />
      </Popover>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.container {
  max-width: none;
  height: calc(100vh - 57px);
  .content {
    height: calc(100% - 48px);
  }
}
</style>
