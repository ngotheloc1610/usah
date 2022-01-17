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
    return new Intl.NumberFormat('en-US').format(Number(item))
}

export function formatPrice(item: string) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(item))
}

export function formatIdNumber(item: string) {
    return Number(item.slice(0, 6))
}