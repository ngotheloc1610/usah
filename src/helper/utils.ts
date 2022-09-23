import moment from 'moment';
import { isNumber } from 'util';
import { FORMAT_DATE_TIME_MILLIS, INVALID_DATE, KEY_LOCAL_STORAGE, LENGTH_PASSWORD, LIST_PRICE_TYPE, MARKET_DEPTH_LENGTH } from '../constants/general.constant';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { IAskAndBidPrice, IAsksBidsList, ISymbolInfo } from '../interfaces/order.interface';
import * as smpb from '../models/proto/system_model_pb';
import * as tmpb from '../models/proto/trading_model_pb';
import { MESSAGE_ERROR } from '../constants/message.constant';
import Decimal from 'decimal.js';

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
    if (newPassword.length < LENGTH_PASSWORD) {
        return false;
    }
    if (!/[a-z]/.test(newPassword)) {
        return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
        return false;
    }
    if (!/[0-9]/.test(newPassword)) {
        return false;
    }
    return true;
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

export const calcChange = (lastPrice: string, prevClosePrice: string) => {
    if (prevClosePrice) {
        const lastPriceValue = new Decimal(lastPrice);
        return lastPriceValue.minus(prevClosePrice).toFixed(2);
    }
    return '';
}

export const calcPctChange = (lastPrice: string, prevClosePrice: string) => {
    if (calcChange(lastPrice, prevClosePrice)) {
        const change = new Decimal(calcChange(lastPrice, prevClosePrice));
        if (convertNumber(prevClosePrice) !== 0) {
            return change.div(prevClosePrice).mul(100).toFixed(2);
        }
    }
    return '';
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

//NOTE: Check invalid LotSize. VolumePlace must be divisible by LotSize
// Eg: checkVolumeLotSize(100, 5) => true
//     checkVolumeLotSize(101, 5) => false
export const checkVolumeLotSize = (placeVol: any, lotSize: any) => {
    // NOTE: use convertNumber function to avoid lotSize is empty.
    // When lotSize is empty, new Decimal(lotSize) is exception
    if (lotSize && convertNumber(lotSize) !== 0) {
        const tempVol = new Decimal(placeVol);
        return tempVol.modulo(lotSize).equals('0');
    }
    return false;
}

// NOTE: calc default volume input
// Eg: calcDefaultVolumeInput(101, 5) => '105'
//     calcDefaultVolumeInput(100, 5) => '100'
export const calcDefaultVolumeInput = (minLot: any, lotSize: any) => {
    // NOTE: use convertNumber function to avoid lotSize is empty.
    // When lotSize is empty, new Decimal(lotSize) is exception
    if (lotSize && convertNumber(lotSize) !== 0) {
        const tempMinLot = new Decimal(minLot);
        return tempMinLot.dividedBy(lotSize).ceil().mul(lotSize).toString();
    }
    return '0';
}

// NOTE: check invalid TickSize. PricePlace must be divisible by TickSize
// Eg: checkPriceTickSize(182.31, 0.03) => true
//     checkPriceTickSize(182.32, 0.03) => false
export const checkPriceTickSize = (placePrice: any, tickSize: any) => {
    if (tickSize && convertNumber(tickSize) !== 0) {
        const tempPlacePrice = new Decimal(placePrice?.toFixed(2));
        return tempPlacePrice.modulo(tickSize?.toFixed(2)).equals('0');
    }
    return false;
}