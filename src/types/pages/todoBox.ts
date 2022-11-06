import { PriorityEnum } from "../components/popover";

export enum MonthEnum {
  ONE_MONTH = 1,
  THREE_MONTH = 3,
  HALF_YEAR = 6,
  ONE_YEAR = 12,
  MORE = 0,
}

export type TodoSortList = {
  time: string;
  list: TodoType[];
};

export type TodoType = {
  id: number;
  time: string;
  title: string;
  priority: PriorityEnum;
  description: string;
  startTime?: string;
  endTime?: string;
};

export type TodoFolder = {
  id: number;
  name: string;
  sortIndex: number;
  todoList?: TodoType[];
};

export type SortFolderType = {
  id: number;
  moveIndex: number;
  sourceIndex: number;
};
