import moment from 'moment';
import { FORMAT_DATE_TIME_MILLI, INVALID_DATE } from '../constants/general.constant';

export function formatOrderTime(date: number): string {
    // time
    const dateTime = moment(date).format(FORMAT_DATE_TIME_MILLI);
    if (dateTime !== INVALID_DATE) {
        return dateTime;
    }
    return '';
}

export function calcPendingVolume(volume: string, filledAmount: string) {
    return Number(volume) - Number(filledAmount);
}

// To format volume.
export function formatNumber(item: string): string {
    return new Intl.NumberFormat('en-US').format(Number(item));
}

// To format price --after the dot is 2 decimals.
export function formatCurrency(item: string): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(Number(item)));
}

export function formatIdNumber(item: string) {
    return Number(item.slice(0, 6))
}

export function validateTradingPin(crrTradingPin: string, newTradingPin: string, confirmTradingPin: string) {
    const elTrading: any = document.querySelector('.trading')
    const elNewTrading: any = document.querySelector('.new-trading')
    const elConfirmTrading: any = document.querySelector('.confirm-trading')
    if (crrTradingPin === newTradingPin) {
        elTrading.style.display = 'block'
        elTrading.innerHTML = 'Trading PIN already exist'
    }
    if (crrTradingPin !== newTradingPin) {
        elTrading.style.display = 'none'
    }
    if (newTradingPin.length > 6 || newTradingPin.length < 6) {
        elNewTrading.style.display = 'block'
        elNewTrading.innerHTML = 'Trading PIN must be  a six-digit number'
    }
    if (newTradingPin.length === 6) {
        elNewTrading.style.display = 'none'
    }
    if (newTradingPin !== confirmTradingPin) {
        elConfirmTrading.innerHTML = 'Incorrect confirm trading Pin'
    }
}

export function validationPassword(currentPassword: string, newPassword: string) {
    const elPassword: any = document.querySelector('.password')
    const elNewPw: any = document.querySelector('.new-trading')
    const isUpperCase = newPassword.match(/[A-Z]/g);
    const isNumber = /\d/.test(newPassword);
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const specialCharacter = format.test(newPassword);
    if (currentPassword === newPassword) {
        elPassword.style.display = 'block'
        elPassword.innerHTML = 'Password already exist'
    }
    if (currentPassword !== newPassword) {
        elPassword.style.display = 'none'
    }
    if (newPassword.length < 8 || isUpperCase === null || isNumber === false || specialCharacter === false) {
        elNewPw.style.display = 'block'
        elNewPw.innerHTML = 'Create new password FAIL'
        return false
    }
    else {
        elNewPw.style.display = 'none'
        return true
    }
}