import moment from 'moment';
import { FORMAT_DATE_TIME, INVALID_DATE } from '../constants/general.constant';

export function formatOrderTime(date: number): string {
    // time in miliseconds
    const dateTime = moment(date).format(FORMAT_DATE_TIME);
    if (dateTime !== INVALID_DATE) {
        return dateTime;
    }
    return '';
}
export function calcPendingVolume(volume: string, filledAmount: string) {
    return Number(volume) - Number(filledAmount);
}
export function formatNumber(item: string): string {
    return new Intl.NumberFormat('en-US').format(Number(Number(item)));
}
export function formatCurrency(item: string): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(Number(item).toFixed(2)));
}