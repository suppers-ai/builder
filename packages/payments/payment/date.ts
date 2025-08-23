// Date time without timezone i.e. YYYY-MM-DDTHH:MM:SS e.g. 2024-01-15T14:30:00
export type ISODateTimeLocal = string;

// Just the date
export type ISODate = string; // 2024-01-15

export type ISOTime = string; // HH:MM:SS

export interface ITimeSlot {
  startTime: ISOTime;
  endTime: ISOTime;
}

export enum DayType {
  weekday = "weekday",
  weekend = "weekend",
}

export enum DayOfWeek {
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
  sunday = "sunday",
}

export type Milliseconds = number;
export type Seconds = number;
export type Minutes = number;
export type Hours = number;
export type Days = number;
export type Months = number;
export type Years = number;
