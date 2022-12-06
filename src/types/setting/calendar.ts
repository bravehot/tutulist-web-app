import { ThemeEnum } from "../enum";

export enum StartWeekEnum {
  SUNDAY = "sunday",
  MONDAY = "monday",
}

export enum WeekNameEnum {
  STAR_WEEK = "starWeek",
  WEEK = "week",
}

export type Setting = {
  startWeek: StartWeekEnum;
  weekName: WeekNameEnum;
  theme: ThemeEnum;
};
