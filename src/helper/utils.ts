import moment from 'moment';
import { FORMAT_DATE_TIME_MILLI, INVALID_DATE } from '../constants/general.constant';

export function formatOrderTime(date: number): string {
    // time in miliseconds
    const dateTime = moment(date).format(FORMAT_DATE_TIME_MILLI);
    if (dateTime !== INVALID_DATE) {
        return dateTime;
    }
    return '';
}
export function calcPendingVolume(volume: string, filledAmount: string) {
    return Number(volume) - Number(filledAmount);
}
export function formatNumber(item: string) {
    const a = Number(item).toLocaleString("en-IN");
    if (a.includes(".")) {
      const position = item[item.indexOf(".", 0) + 2];
      if (position === "0" || position === undefined) {
        return a.slice(0, a.length) + "0";
      } else {
        return a;
      }
    } else {
      return a.slice(0, a.length) + ".00";
    }
}
export function formatIdNumber(item: string) {
    return Number(item.slice(0,6))
}