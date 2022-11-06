<script setup lang="ts">
import { computed } from "vue";
import { useDrop } from "vue3-dnd";

import EventItem from "./EventItem.vue";

import { SourceEventType } from "@/types/components/calendar";
import { PriorityEnum } from "@/types/components/popover";
import { DragEventTypeEnum } from "@/types/pages/home";

const props = defineProps<{
  eventList: SourceEventType[] | null;
  priority: PriorityEnum;
}>();

const emits = defineEmits<{
  (e: "set-event", value: SourceEventType, target: HTMLElement): void;
  (e: "move", priority: PriorityEnum, eventInfo: SourceEventType): void;
}>();

const [, drop] = useDrop({
  accept: [DragEventTypeEnum.EVENT],
  drop: () => ({
    priority: props.priority,
  }),
});

const sortEventList = computed(() => {
  const { eventList } = props;
  return eventList?.sort((a, b) => a.isDone - b.isDone);
});

const handleClick = (event: MouseEvent, eventInfo: SourceEventType) => {
  event.stopPropagation();
  emits("set-event", eventInfo, event.target as HTMLElement);
};

const handleMove = (priority: PriorityEnum, eventInfo: SourceEventType) => {
  emits("move", priority, eventInfo);
};
</script>

<template>
  <section :ref="drop" class="h-full">
    <template v-if="sortEventList && sortEventList.length">
      <template v-for="eventItem in sortEventList" :key="eventItem.id">
        <EventItem
          :event-info="eventItem"
          @click="handleClick($event, eventItem)"
          @move="handleMove"
        />
      </template>
    </template>

    <section v-else class="h-full flex items-center justify-center">
      <n-empty description="没有任务" size="large" />
    </section>
  </section>
</template>
