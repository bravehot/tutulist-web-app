import { InjectionKey, Ref } from "vue";
import {
  CalendarInfoType,
  EventType,
  PopoverTarget,
  SourceEventType,
} from "./calendar";

export enum PriorityEnum {
  IMPORTANT_URGENT = 4,
  IMPORTANT_NOTURGENT = 3,
  UNIMPORTANT_URGENT = 2,
  UNIMPORTANT_NOTURGENT = 1,
}

export enum TimeStatusEnum {
  TODAY,
  LASTDAY,
  NEXTDAY,
}

export enum DoneEnum {
  UNDONE,
  DONE,
}

type PopoverProvideType = {
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
  handlePopoverAllVisiable: (
    isShow: boolean,
    target: HTMLElement,
    dateInfo: CalendarInfoType
  ) => void;
  saveEventInfo: (
    eventInfo: Omit<SourceEventType, "id"> & { id?: number }
  ) => void;
  setPopoverShow: (show: boolean) => void;
  isPopoverShow: Ref<boolean>;
};

export const PopoverKey: InjectionKey<PopoverProvideType> = Symbol("popover");
