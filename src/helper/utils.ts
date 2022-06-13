import moment from 'moment';
import { isNumber } from 'util';
import { FORMAT_DATE_TIME_MILLIS, INVALID_DATE, KEY_LOCAL_STORAGE, LENGTH_PASSWORD, LIST_PRICE_TYPE, MARKET_DEPTH_LENGTH } from '../constants/general.constant';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { IAskAndBidPrice, IAsksBidsList, ISymbolInfo } from '../interfaces/order.interface';
import * as smpb from '../models/proto/system_model_pb';
import * as tmpb from '../models/proto/trading_model_pb';
import { MESSAGE_ERROR } from '../constants/message.constant';

const systemModel: any = smpb;
const tradingModel: any = tmpb;

export function formatOrderTime(date: number): string {
    // time
    const dateTime = moment(date).format(FORMAT_DATE_TIME_MILLIS);
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
    if (item) {
        if (isNaN(Number(item))) {
            return '0';
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(item));
    }
    return '-';
}

export function formatIdNumber(item: string) {
    return Number(item.slice(0, 6))
}

export function validationPassword(newPassword: string) {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return pattern.test(newPassword);
}

export function convertDatetoTimeStamp(value: string, time: string) {
    const newDate = `${value} ${time}`
    return Date.parse(newDate);
}

export const removeFocusInput = (element: any) => {
    element.forEach(item => {
        item.blur()
    });
}

export const getSymbolCode = (str: string) => {
    const newArr = str.split('-');
    const symbolCode = newArr[0].trim();
    return symbolCode ?? ''
}

export const calcPriceIncrease = (currentPrice: number, tickSize: number, decimalLenght: number) => {
    return Math.round((currentPrice + tickSize) * Math.pow(10, decimalLenght)) / Math.pow(10, decimalLenght)
}

export const calcPriceDecrease = (currentPrice: number, tickSize: number, decimalLenght: number) => {
    return Math.round((currentPrice - tickSize) * Math.pow(10, decimalLenght)) / Math.pow(10, decimalLenght)
}

export const assignListPrice = (prvList, currentList, type: string) => {
    if (currentList) {
        if (currentList.length === 0) {
            return currentList;
        }
        currentList.forEach(item => {
            const element = prvList?.find(o => o?.price === item?.price);
            if (element) {
                const index = prvList.indexOf(element);
                if (index >= 0) {
                    prvList[index] = {
                        numOrders: item.numOrders.toString(),
                        price: item.price ? item.price : "-",
                        tradable: false,
                        volume: item.volume ? item.volume : "-"
                    }
                } else {
                    prvList.push({
                        numOrders: item.numOrders.toString(),
                        price: item.price ? item.price : "-",
                        tradable: false,
                        volume: item.volume ? item.volume : "-"
                    });
                }
            } else {
                if (prvList.length < MARKET_DEPTH_LENGTH) {
                    prvList.push({
                        numOrders: item.numOrders.toString(),
                        price: item.price ? item.price : "-",
                        tradable: false,
                        volume: item.volume ? item.volume : "-"
                    });
                }
            }
        });
    }
    const output = [];
    let sortList = []
    if (type === LIST_PRICE_TYPE.askList) {
        sortList = prvList.sort((a, b) => a?.price.localeCompare(b?.price));
    } else {
        sortList = prvList.sort((b, a) => b?.price.localeCompare(a?.price));
    }
    let counter = 0;
    while (counter < MARKET_DEPTH_LENGTH) {
        output.push(sortList[counter]);
        counter++;
    }
    return output;
}

export const checkValue = (preValue, currentValue) => {
    if (currentValue !== preValue && currentValue.toString() !== '' && currentValue.toString() !== '-') {
        return currentValue;
    }
    return preValue;
}

export const calcChange = (lastPrice: string, open: string) => {
    if (!isNaN(Number(lastPrice)) && !isNaN(Number(open))) {
        return Number(lastPrice) - Number(open);
    } else if (isNaN(Number(lastPrice)) && !isNaN(Number(open))) {
        return 0 - Number(open);
    } else if (!isNaN(Number(lastPrice)) && isNaN(Number(open))) {
        return Number(lastPrice);
    }
    return 0;
}

export const calcPctChange = (lastPrice: string, open: string) => {
    const change = calcChange(lastPrice, open);
    if (!isNaN(Number(open)) && Number(open) !== 0) {
        return change / Number(open) * 100;
    }
    return 0;
}

export const toTimestamp = (strDate: string) => {
    const dt = Date.parse(strDate);
    return dt;
}

// Do dùng chung nên listData là những mảng dữ liệu khác nhau => dùng any
export const renderCurrentList = (currentPage: number, itemPerPage: number, listData: any) => {
    if (listData && listData.length !== 0) {
        const indexOfLastNews = currentPage * itemPerPage;
        const indexOfFirstNews = indexOfLastNews - itemPerPage;
        return listData.slice(indexOfFirstNews, indexOfLastNews);
    }
    return [];
}

export const defindConfigGet = (param: any) => {
    const data = {
        headers: { Authorization: `Bearer ${localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` },
        params: param
    }
    return data;
}

export const defindConfigPost = () => {
    const data = {
        headers: { Authorization: `Bearer ${localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` }
    }
    return data;
}

export const convertNumber = (value: any) => {
    const tmpValue = value?.toString().replaceAll(',', '');
    if (tmpValue && !isNaN(Number(tmpValue))) {
        return Number(tmpValue);
    }
    return 0;
}

export const calcVolumeDESC = (arr: IAskAndBidPrice[], index: number) => {
    let i = index;
    let sum = 0;
    while (i < arr.length) {
        sum += convertNumber(arr[i].volume);
        i++;
    }
    return sum;
}

export const calcVolumeASC = (arr: IAskAndBidPrice[], index: number) => {
    let i = 0;
    let sum = 0;
    while (i <= index) {
        sum += convertNumber(arr[i]?.volume);
        i++;
    }
    return sum;
}

export const getListAsksBids = (asksBidsList: IAskAndBidPrice[], type: string) => {
    let askBidItem: IAskAndBidPrice[] = asksBidsList;
    let arr: IAsksBidsList[] = [];
    let counter = 0;
    while (counter < MARKET_DEPTH_LENGTH) {
        if (askBidItem[counter]) {
            const numOrders = askBidItem[counter].numOrders ? askBidItem[counter].volume.toString() : '-';
            const price = askBidItem[counter].price ? Number(askBidItem[counter].price).toFixed(2) : '-';
            const tradable = askBidItem[counter].tradable ? askBidItem[counter].tradable : false;
            const volume = askBidItem[counter].volume ? askBidItem[counter].volume : '-';
            const isNumOrder = askBidItem[counter] && askBidItem[counter].numOrders;
            let totalNumOrder = '';

            if (type === LIST_PRICE_TYPE.bidList) {
                totalNumOrder = isNumOrder ? (convertNumber(numOrders) + convertNumber(arr[arr.length - 1]?.total)).toString() : numOrders
            } else {
                totalNumOrder = calcVolumeDESC(asksBidsList, counter).toString();
            }

            let total = '';
            if (type === LIST_PRICE_TYPE.askList) {
                total = counter === (MARKET_DEPTH_LENGTH - 1) ? numOrders : totalNumOrder;
            } else {
                total = counter === 0 ? numOrders : totalNumOrder;
            }
            arr.push({
                numOrders,
                price,
                tradable,
                volume,
                total,
            });
        } else {
            if (type === LIST_PRICE_TYPE.askList) {
                arr.unshift({
                    numOrders: '-',
                    price: '-',
                    tradable: false,
                    volume: '-',
                    total: '-',
                });
            } else {
                arr.push({
                    numOrders: '-',
                    price: '-',
                    tradable: false,
                    volume: '-',
                    total: '-',
                });
            }
        }
        counter++;
    }
    return arr
}

export const exportCSV = (csvData, fileName) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
}

export const getRandomNumbers = () => {
    const array = new Uint32Array(10);
    crypto.getRandomValues(array);

    let textContent = "";
    for (let i = 0; i < array.length; i++) {
        textContent += array[i];
    }

    return textContent;
}

export const getClassName = (item: number) => {
    if (item > 0) {
        return 'text-danger';
    }
    if (item < 0) {
        return 'text-success';
    }
    return '';
}

export const handleAllowedInput = (value: string, isAllowed: boolean) => {
    if (isAllowed) { 
        if (value.charAt(0) === '0' || value.charAt(0) === '-') {
            if (value.charAt(1) && value.charAt(1) != '.') {
                return false;
            }
        }
    }
    return true;
}

export const checkMessageError = (msg: string, msgCode: number) => {
    if (msgCode === systemModel.MsgCode.MT_RET_ERR_NOT_ENOUGH_MONEY) {
        return msg;
    }
    const messageDisplay = MESSAGE_ERROR.get(msgCode);
    return messageDisplay || msg;
}

export const renderSideText = (side: number) => {
    switch (side) {
        case tradingModel.Side.BUY: {
            return 'Buy';
        }
        default: {
            return 'Sell';
        }
    }
}