<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  onMounted,
  toRefs,
  onUnmounted,
  watch,
} from "vue";
import { cloneDeep } from "lodash-es";
import { useRoute } from "vue-router";

import TodoBoxSelect from "@/pages/calendar/components/TodoBoxSelect.vue";
import PrioritySelect from "@/pages/calendar/components/PrioritySelect.vue";
import TimeSelect from "./TimeSelect.vue";

import {
  PopoverPosition,
  EventType,
  SourceEventType,
} from "@/types/components/calendar";
import { PriorityEnum } from "@/types/components/popover";

const props = defineProps<{
  timeInfo: PopoverPosition | null;
  clickEventInfo: EventType | null;
  disabledTime?: boolean;
  disabledPriority?: boolean;
  getDateIndex?: (time: string) => number;
  setHoverStatus?: (startIndex: number, endIndex: number) => void;
}>();

const emits = defineEmits<{
  (e: "remove", id: number, showMessage?: boolean): void;
  (e: "save", eventInfo: Omit<SourceEventType, "id"> & { id?: number }): void;
  (e: "show", show: boolean): void;
  (e: "move", folderId: number): void;
}>();

const route = useRoute();

const titleRef = ref<HTMLElement | null>(null);
const descriptionRef = ref<HTMLElement | null>(null);

const eventInfo = reactive({
  startTime: "",
  endTime: "",
  priority: PriorityEnum.UNIMPORTANT_NOTURGENT,
  isDone: false,
  title: "",
  description: "",
  id: -1,
});

const eventId = computed(() => props.clickEventInfo?.id);

onMounted(() => {
  titleRef.value?.focus();
  setEventInfo();
});

onUnmounted(() => {
  const defaultTitle = "(无标题)";
  const { title, description } = toRefs(eventInfo);

  if (title.value || description.value) {
    emits("save", {
      ...eventInfo,
      title: title.value || defaultTitle,
      isDone: Number(eventInfo.isDone),
      id: eventId.value,
    });
  }
});

watch(
  () => props.clickEventInfo,
  (clickEventInfo) => {
    if (clickEventInfo) {
      titleRef.value?.focus();
      const lastInfo = cloneDeep(eventInfo);
      if (lastInfo.id !== -1) {
        const defaultTitle = "(无标题)";
        const { id, title, description, isDone, priority, startTime, endTime } =
          lastInfo;
        emits("save", {
          id,
          startTime,
          endTime,
          title: title || defaultTitle,
          description,
          isDone: Number(isDone),
          priority,
        });
      }
      setEventInfo();
    }
  }
);

watch(
  () => props.clickEventInfo?.priority,
  (priority, lastPriority) => {
    const isQuadrant = route.name === "quadrant";
    if (isQuadrant && priority !== lastPriority) {
      setEventInfo();
      titleRef.value?.focus();
    }
  }
);

const setEventInfo = () => {
  const { start, end } = props.timeInfo ?? {};
  eventInfo.startTime = start?.time ?? "";
  eventInfo.endTime = end ? end.time : eventInfo.startTime;
  if (props.clickEventInfo) {
    const { title, description, isDone, priority, id } = props.clickEventInfo;
    eventInfo.title = title;
    eventInfo.description = description ?? "";
    eventInfo.isDone = Boolean(isDone);
    eventInfo.priority = priority;
    eventInfo.id = id;
  }
};

const handleCheckBox = (value: number) => {
  eventInfo.isDone = Boolean(value);
  emits("show", false);
};

const changeEventTime = ({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) => {
  if (startTime !== eventInfo.startTime || endTime !== eventInfo.endTime) {
    const { getDateIndex, setHoverStatus } = props;
    eventInfo.startTime = startTime;
    eventInfo.endTime = endTime;

    if (getDateIndex && setHoverStatus) {
      const startIndex = getDateIndex(startTime);
      const endIndex = getDateIndex(endTime);
      if (startIndex !== undefined && endIndex !== undefined) {
        const start = startIndex === -1 ? 0 : startIndex;
        const end = endIndex === -1 ? 0 : endIndex;
        setHoverStatus(start, end);
        titleRef.value?.focus();
      }
    }
  }
};

const handleKeyUp = () => {
  descriptionRef.value?.focus();
};

const handleRemove = async () => {
  if (eventId.value) {
    emits("remove", eventId.value);
  }
};

const handleMove = async (folderId: number) => {
  emits("move", folderId);
};
</script>
<template>
  <section class="w-full flex items-center">
    <n-checkbox
      v-if="eventId && eventId > 0"
      size="large"
      :checked="Boolean(Number(eventInfo.isDone))"
      class="mr-3"
      :on-update:checked="handleCheckBox"
    />
    <TimeSelect
      :start-time="eventInfo.startTime"
      :end-time="eventInfo.endTime"
      :event-id="eventId"
      :disabled="disabledTime"
      @change="changeEventTime"
    />

    <PrioritySelect
      v-model:priority="eventInfo.priority"
      :disabled="disabledPriority"
    />
  </section>
  <!-- line -->
  <section class="w-full h-px bg-gray-100 my-2 dark:bg-gray-500"></section>
  <section class="relative input-content">
    <input
      ref="titleRef"
      v-model="eventInfo.title"
      type="text"
      class="w-full font-mono h-6 focus:outline-none text-base caret-gray-600 dark:caret-gray-300 text-gray-600 dark:text-zinc-400 tracking-wider font-normal leading-6 bg-transparent"
      placeholder="准备做点什么"
      maxlength="30"
      @keyup.enter="handleKeyUp"
    />
    <textarea
      ref="descriptionRef"
      v-model="eventInfo.description"
      placeholder="描述"
      class="focus:outline-none w-full h-36 resize-none text-sm m-0 caret-gray-500 dark:caret-gray-200 text-gray-500 dark:text-zinc-400 tracking-wider font-normal leading-6 bg-transparent overflow-x-hidden"
      maxlength="100"
    />

    <section
      v-if="eventId && eventId > 0"
      class="absolute bottom-1 w-full flex justify-end"
    >
      <TodoBoxSelect @move="handleMove" @remove="handleRemove" />
    </section>
  </section>
</template>

<style lang="scss" scoped>
.icon {
  @apply cursor-pointer text-gray-600 hover:text-gray-500 dark:text-gray-500 hover:dark:text-gray-400;
}
.input-content {
  height: 180px;
}
</style>
