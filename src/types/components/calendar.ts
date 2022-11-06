import type { ComputedRef, InjectionKey, Ref } from "vue";
import { DoneEnum, PriorityEnum } from "./popover";

type SelectOptions = "LAST" | "NEXT" | "CURRENT";
type StartWeekOptions = "MONDAY" | "SUNDAY";

type CalendarInfoType = {
  monthCn: string;
  day: number;
  month: number;
  year: number;
  cName: string;
  fullTime: string;
  festivalName: string;
  isAddtionalWorkday: boolean;
  isHoliday: boolean;
  isLast: boolean;
  isNext: boolean;
  eventList?: EventType[];
  dateIndex: number;
  hover?: boolean;
};

// 服务端 event 类型
type SourceEventType = {
  id: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  isDone: DoneEnum;
  priority: PriorityEnum;
};

// 前端处理后的 event 类型
type EventType = {
  id: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  hasLast: boolean;
  hasNext: boolean;
  _index?: number;
  isDone: DoneEnum;
  priority: PriorityEnum;
};

type CreateEvent = {
  dateIndex: number;
  time: string;
};

type CalendarProvideType = {
  handleEventDrag: (id: number, dropTime: string) => void;
  handleEventHover: (id: number, dropTime: string, dateIndex: number) => void;
  handleForwardDrag: (id: number, startTime: string) => void;
  handleForwardHover: (id: number, dropTime: string, dateIndex: number) => void;
  handleBackwardDrag: (id: number, endTime: string) => void;
  handleBackwardHover: (
    id: number,
    dropTime: string,
    dateIndex: number
  ) => void;
  createNewEvent: (start: CreateEvent, end: CreateEvent) => void;
  createNewEventHover: (dragIndex: number, dropIndex: number) => void;
  handlePopoverVisiable: (
    eventInfo: EventType | null,
    isRange: boolean,
    start: PopoverTarget,
    end?: PopoverTarget,
    eventId?: number
  ) => void;
  handleRangePopoverVisiable: (
    eventInfo: EventType,
    dateIndex: number,
    clickTarget: {
      target: HTMLElement;
      type: "start" | "end";
    } | null
  ) => void;
  getDateIndex: (time: string) => number;
  setPopoverShow: (show: boolean) => void;
  setPopoverAllShow: (show: boolean) => void;
  setHoverStatus: (startIndex: number, endIndex: number) => void;
  saveEventInfo: (
    eventInfo: Omit<SourceEventType, "id"> & { id?: number }
  ) => void;

  openPopoverAll: (info: {
    dateIndex: number;
    time: string;
    target: HTMLElement;
    eventList: CalendarEventInfo[];
  }) => void;
  clearHoverStatus: () => void;
  isPopoverShow: Ref<boolean>;
  isPopoverAllShow: ComputedRef<boolean>;
  clickEventId: ComputedRef<number>;
};

type CalendarEventInfo = EventType | null;

type DropResult = {
  dropTime: string;
  dateIndex: number;
};

type DragItemTypes = {
  dragTime: string;
  eventId?: number;
  eventTitle: string;
  dateIndex: number;
};

type PopoverPosition = {
  start: PopoverTarget;
  end: PopoverTarget | null;
  isRange: boolean;
};

type PopoverTarget = {
  time: string;
  dateIndex: number;
  target?: HTMLElement;
};

type Placement =
  | "right-start"
  | "left-start"
  | "right-end"
  | "left-end"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end";

type PopoverPlacement = {
  placement: Placement;
  colNum: number;
  rowNum: number;
};

type PopoverEvent = {
  dateIndex: number;
  time: string;
  target?: HTMLElement;
};

export enum DragEventTypeEnum {
  "NEW" = "NEW",
  "EVENT" = "EVENT",
  "FORWARD" = "FORWARD",
  "BACKWARD" = "BACKWARD",
}
export enum DeleteEnum {
  NOT_DELETE,
  DELELTE,
}

type CalendarProvide = {
  handleEventDrag: (id: number, dropTime: string) => void;
  handleEventHover: (id: number, dropTime: string, dateIndex: number) => void;
  handleForwardDrag: (id: number, startTime: string) => void;
  handleForwardHover: (id: number, dropTime: string, dateIndex: number) => void;
  handleBackwardDrag: (id: number, endTime: string) => void;
  handleBackwardHover: (
    id: number,
    dropTime: string,
    dateIndex: number
  ) => void;
  createNewEvent: (start: CreateEvent, end: CreateEvent) => void;
  createNewEventHover: (dragIndex: number, dropIndex: number) => void;
  clearHoverStatus: () => void;
  setHoverStatus: (startIndex: number, endIndex: number) => void;
  getDateIndex: (time: string) => number;
  handleRemoveEvent: (id: number) => void;
  clickEventId: ComputedRef<number>;
};

export const CalendarKey: InjectionKey<CalendarProvide> = Symbol("calendar");

export type {
  SelectOptions,
  StartWeekOptions,
  CalendarInfoType,
  SourceEventType,
  EventType,
  CalendarProvideType,
  CalendarEventInfo,
  DragItemTypes,
  CreateEvent,
  PopoverPosition,
  DropResult,
  Placement,
  PopoverPlacement,
  PopoverEvent,
  PopoverTarget,
};
