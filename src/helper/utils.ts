import moment from 'moment';
import { isNumber } from 'util';
import { FORMAT_DATE_TIME_MILLI, INVALID_DATE, KEY_LOCAL_STORAGE, LENGTH_PASSWORD, LIST_PRICE_TYPE, MARKET_DEPTH_LENGTH } from '../constants/general.constant';
import { IAskAndBidPrice, IListAks, IListBid, ISymbolInfo } from '../interfaces/order.interface';

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
    const isUpperCase = newPassword.match(/[A-Z]/g);
    const isNumber = /\d/.test(newPassword);
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const specialCharacter = format.test(newPassword);
    if (newPassword.length < LENGTH_PASSWORD || isUpperCase === null || isNumber === false || specialCharacter === false) {
        return false
    } else {
        return true
    }
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
export const calcCurrentList = (currentPage: number, itemPerPage: number, listData: any) => {
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
export const formatDate = (datetime) =>{
    if(datetime !== null && datetime !== ""){
        let date = new Date(datetime);
        let mDateStr = moment(date).format("MMMM DD, YYYY");
        return mDateStr;
    } return null;
}

export const convertNumber = (value: string) => {
    if (!isNaN(Number(value))) {
        return Number(value);
    }
    return 0;
}

export const getAsksList = (asksList: IAskAndBidPrice[]) => {
    let askItems: IAskAndBidPrice[] = asksList;
    let arr: IListAks[] = [];
    let counter = MARKET_DEPTH_LENGTH - 1;
    while (counter >= 0) {
        if (askItems[counter]) {
            const numberAsks = askItems[counter].numOrders ? askItems[counter].volume.toString() : '-';
            const askPrice = askItems[counter].price ? Number(askItems[counter].price).toFixed(2) : '-';
            const tradableAsk = askItems[counter].tradable ? askItems[counter].tradable : false;
            const volumeAsk = askItems[counter].volume ? askItems[counter].volume : '-';
            const isAskNumOrder = askItems[counter] && askItems[counter].numOrders;
            arr.push({
                numberAsks: numberAsks,
                askPrice: askPrice,
                tradableAsk: tradableAsk,
                volumeAsk: volumeAsk,
                totalAsks: counter === (MARKET_DEPTH_LENGTH - 1) ? numberAsks : isAskNumOrder ? (convertNumber(numberAsks) + convertNumber(arr[arr.length - 1]?.totalAsks)).toString() : numberAsks,
            });
        } else {
            arr.push({
                numberAsks: '-',
                askPrice: '-',
                tradableAsk: false,
                volumeAsk: '-',
                totalAsks: '-',
            });
        }
        counter--;
    }
    return arr
}

export const getBidsList = (bidsList: IAskAndBidPrice[]) => {
    let bidItems: IAskAndBidPrice[] = bidsList;
    let arr: IListBid[] = [];
    let counter = 0;
    while (counter < MARKET_DEPTH_LENGTH) {
        if (bidItems[counter]) {
            const numberBids = bidItems[counter].numOrders ? bidItems[counter].volume.toString() : '-';
            const bidPrice = bidItems[counter].price ? Number(bidItems[counter].price).toFixed(2) : '-';
            const tradableBid = bidItems[counter].tradable ? bidItems[counter].tradable : false;
            const volumeBid = bidItems[counter].volume ? bidItems[counter].volume : '-';
            const isBidNumOrder = bidItems[counter] && bidItems[counter].numOrders;;
            arr.push({
                numberBids: numberBids,
                bidPrice: bidPrice,
                tradableBid: tradableBid,
                volumeBid: volumeBid,
                totalBids: counter === 0 ? numberBids : isBidNumOrder ? (convertNumber(numberBids) + convertNumber(arr[0]?.totalBids)).toString() : numberBids,
            });
        } else {
            arr.push({
                numberBids: '-',
                bidPrice: '-',
                tradableBid: false,
                volumeBid: '-',
                totalBids: '-',
            });
        }
        counter++;
    }
    return arr
}