import { format, isToday, isThisWeek } from "date-fns";

export const formatDisplayDate = (
  messageTime: number,
  is24HourClock: boolean = true
): string | null => {
  if (!messageTime) {
    return null;
  }

  const date = new Date(messageTime);

  if (isToday(date)) {
    return format(date, is24HourClock ? "HH:mm" : "hh:mm a");
  }

  if (isThisWeek(date)) {
    return format(date, "EEEE");
  }

  return format(date, "dd.MM.yyyy");
};

export const truncateText = (text: string, maxLength: number = 20): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
