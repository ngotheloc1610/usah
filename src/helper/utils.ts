import moment from 'moment';
import { FORMAT_DATE_TIME_MILLI, INVALID_DATE } from '../constants/general.constant';

export function formatOrderTime(date: number): string {
    // time in miliseconds
    const dateMillisecond = moment(date).millisecond();
    const dateTime = moment(dateMillisecond).format(FORMAT_DATE_TIME_MILLI);
    if (dateTime !== INVALID_DATE) {
        return dateTime;
    }
    return '';
}
export function calcPendingVolume(volume: string, filledAmount: string) {
    return Number(volume) - Number(filledAmount);
}