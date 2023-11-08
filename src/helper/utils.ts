import moment from 'moment';
import { FORMAT_DATE_TIME_MILLIS, INVALID_DATE, KEY_LOCAL_STORAGE, LENGTH_PASSWORD, LIST_PRICE_TYPE, MARKET_DEPTH_LENGTH, MARKET_DEPTH_LENGTH_ORDER_BOOK_DEFAULT, LIST_TICKER_INFO } from '../constants/general.constant';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { IAskAndBidPrice, IAsksBidsList, IListOrderMonitoring } from '../interfaces/order.interface';
import * as smpb from '../models/proto/system_model_pb';
import * as tmpb from '../models/proto/trading_model_pb';
import { MESSAGE_ERROR } from '../constants/message.constant';
import Decimal from 'decimal.js';
import { INSUFFICIENT_LIQUIDITY_FOR_THIS_TRADE } from '../constants/order.constant';

const systemModel: any = smpb;
const tradingModel: any = tmpb;

const numberFormat = new Intl.NumberFormat('en-US');
const numberFormatCustom = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    return numberFormat.format(Number(item));
}

// To format price --after the dot is 2 decimals.
export function formatCurrency(item: string): string {
    if (item) {
        const newItem = item?.replaceAll(',', '');
        if (isNaN(Number(newItem))) {
            return '0.00';
        }
        return numberFormatCustom.format(Number(newItem));
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
    const newArr = str.split(' - ');
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
    if (currentValue !== preValue && currentValue?.toString() !== '' && currentValue?.toString() !== '-') {
        return currentValue;
    }
    return preValue;
}

export const calcChange = (lastPrice: string, prevClosePrice: string) => {
    if (prevClosePrice && lastPrice && lastPrice !== '-') {
        const _newLastPrice = lastPrice?.replaceAll(',', '');
        const _newPrevClosePrice = prevClosePrice?.replaceAll(',', '');
        const lastPriceValue = new Decimal(_newLastPrice);
        return lastPriceValue.minus(_newPrevClosePrice).toFixed(2);
    }
    return '';
}

export const calcPctChange = (lastPrice: string, prevClosePrice: string) => {
    if (calcChange(lastPrice, prevClosePrice)) {
        const change = new Decimal(calcChange(lastPrice, prevClosePrice));
        const _newPrevClosePrice = prevClosePrice?.replaceAll(',', '');
        if (convertNumber(_newPrevClosePrice) !== 0) {
            return change.div(_newPrevClosePrice).mul(100).toFixed(2);
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
        headers: { Authorization: `Bearer ${sessionStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` },
        params: param
    }
    return data;
}

export const defindConfigPost = () => {
    const data = {
        headers: { Authorization: `Bearer ${sessionStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` }
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

export const roundingNumber = (value: string) => {
    if (value && !isNaN(Number(value)) ) {
        return Number(value).toFixed(2);
    }
    return "0.00";
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
    const marketDepthLength = window.globalThis.marketDepthLenghtOrderBook || MARKET_DEPTH_LENGTH_ORDER_BOOK_DEFAULT
    while (counter < marketDepthLength) {
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
                total = counter === (marketDepthLength - 1) ? numOrders : totalNumOrder;
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
    if (msgCode === systemModel.MsgCode.MT_RET_ERR_NOT_ENOUGH_MONEY || msgCode === systemModel.MsgCode.MT_RET_FORWARD_EXT_SYSTEM) {
        return msg;
    }
    if (msgCode === systemModel.MsgCode.MT_RET_REQUEST_INVALID_VOLUME) {
        return INSUFFICIENT_LIQUIDITY_FOR_THIS_TRADE;
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
    if (lotSize && convertNumber(lotSize) !== 0 && placeVol?.toString()?.trim() !== '') {
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
    if (convertNumber(placePrice) === 0 && convertNumber(tickSize) === 0) return true;
    if (tickSize && convertNumber(tickSize) !== 0 && placePrice?.toString()?.trim() !== '') {
        const tempPlacePrice = new Decimal(placePrice?.toFixed(2));
        return tempPlacePrice.modulo(tickSize?.toFixed(2)).equals('0');
    }
    return false;
}

export const stripHtmlTagsFromString = (content: string) => {
    if (content) {
        return content.replace(/<\/?[^>]+(>|$)/g, "");
    }
    return "";
}

export const formatDate = (datetime) => {
    if (datetime !== null && datetime !== "") {
        let mDateStr = moment(datetime).format("MMM DD YYYY HH:mm:ss");
        return mDateStr;
    } return null;
}

export const getExtensionFile = (fileName: string) => {
    if (fileName) {
        const ext = fileName?.split('.').pop();
        if (ext === fileName) return '';
        return `.${ext}`;
    }
    return '';
}

export const hasDuplicates = (strArr: string[]) => {
    return strArr.some(function(item) {
        return strArr.indexOf(item) !== strArr.lastIndexOf(item);
    })
}

export const calcDecreaseCommon = (lostSize: number, newVolume: number)=>{
    if(lostSize){
        const temp = new Decimal(newVolume);
            return temp.dividedBy(lostSize).ceil().mul(lostSize).toString();
    }
    return '0';
}

export const calcIncreaseCommon = (lostSize: number, newVolume: number)=>{
    if(lostSize){
        const temp = new Decimal(newVolume);
            return temp.dividedBy(lostSize).floor().mul(lostSize).toString();
    }
    return '0';
}

export const convertValueIncreaseTickSize = (newValue: number, tickSize: number)=>{
    if (!checkPriceTickSize(newValue, tickSize)) {
        // Eg: TickSize: 0.03, CurrentPrice: 186.02 => NewPrice: '186.00'
        const value = convertNumber(tickSize) === 0 ? '0' : calcIncreaseCommon(tickSize, newValue);
        return convertNumber(value);
    }
    return newValue;
}

export const convertValueDecreaseTickSize = (newValue: number, tickSize: number)=>{
    if (!checkPriceTickSize(newValue, tickSize)) {
        // Eg: TickSize: 0.03, CurrentPrice: 186.02 => NewPrice: '186.00'
        const value = convertNumber(tickSize) === 0 ? '0' : calcDecreaseCommon(tickSize, newValue);
        return convertNumber(value);
    }
    return newValue;
}

export const convertValueIncreaseLostSize = (newValue: number, lostSize: number)=>{
    if (!checkVolumeLotSize(newValue, lostSize)) {
        // Eg: LotSize: 3, CurrentVolume: 611 => NewVolume: '612'
        const value = convertNumber(lostSize) === 0 ? '0' : calcIncreaseCommon(lostSize, newValue);
        return convertNumber(value);
    }
    return newValue;
}

export const convertValueDecreaseLostSize = (newValue: number, lostSize: number)=>{
    if (!checkVolumeLotSize(newValue, lostSize)) {
        // Eg: LotSize: 3, CurrentVolume: 611 => NewVolume: '609'
        const value = convertNumber(lostSize) === 0 ? '0' : calcDecreaseCommon(lostSize, newValue);
        return convertNumber(value);
    }
    return newValue;
}

export const calcOwnedVolAccountId = (totalBuy: number, totalSell: number) => {
    const ownedVolume = totalBuy - totalSell;
    return ownedVolume > 0 ? ownedVolume : 0;
}

export const sortDateTime = (listData: IListOrderMonitoring[], isAsc: boolean) => {
    if(listData) {
        if(isAsc) {
            listData.sort((a, b) => a?.time?.toString().localeCompare(b?.time?.toString()))
            return listData
        }
        listData.sort((a, b) => b?.time?.toString().localeCompare(a?.time?.toString()))
        return listData
    }
    return []
}

export const sortPrice = (listData: IListOrderMonitoring[], isAsc: boolean) => {
    if(listData) {
        if(isAsc) {
            listData.sort((a, b) => convertNumber(a?.price) - convertNumber(b?.price));
            return listData
        }
        listData.sort((a, b) => convertNumber(b?.price) - convertNumber(a?.price));
        return listData
    }
    return []
}

export const sortSide = (listData: IListOrderMonitoring[], isAsc: boolean) => {
    if(listData) {
        if(isAsc) {
            listData.sort((a, b) => a?.side - b?.side);
            return listData
        }
        listData.sort((a, b) => b?.side - a?.side);
        return listData
    }
    return []
}

export const sortTicker = (listData: IListOrderMonitoring[], isAsc: boolean) => {
    if(listData) {
        if(isAsc) {
            listData.sort((a, b) => a?.symbolCode.localeCompare(b?.symbolCode))
            return listData
        }
        listData.sort((a, b) => b?.symbolCode.localeCompare(a?.symbolCode))
        return listData
    }
    return []
}

export const calcFloorPrice = (lastPrice: number, tickSize: number, rate: number) => {
    const floorPriceRaw = lastPrice - (lastPrice * rate)
    const floorPrice = Math.ceil(floorPriceRaw / tickSize) * tickSize
    return floorPrice
}

export const calcCeilingPrice = (lastPrice: number, tickSize: number, rate: number) => {
    const ceilingPriceRaw = lastPrice + (lastPrice * rate)
    const ceilingPrice = Math.floor(ceilingPriceRaw / tickSize) * tickSize
    return ceilingPrice
}

export const calcCeilFloorPrice = (lastPrice: number, symbol: any) => {
    const rs = {
        ceilingPrice: 0,
        floorPrice: 0
    }
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const ticker = symbolsList.find(e => e?.symbolCode === symbol?.symbolCode)
    if(ticker) {
        const rate = (convertNumber(ticker.limitRate) / 100)
        const tickerSize = convertNumber(ticker.tickSize)
        rs.ceilingPrice = lastPrice === 0 ? convertNumber(symbol.ceiling) : calcCeilingPrice(lastPrice, tickerSize, rate)
        rs.floorPrice = lastPrice === 0 ? convertNumber(symbol.floor) : calcFloorPrice(lastPrice, tickerSize, rate)
    }
    return rs
}

export const filterActiveListWatching = (listKey, listActive) => {
    const newWatchList: any[] = [];
    const watchList = JSON.parse(localStorage.getItem(listKey) || '[]');
    watchList.forEach(item => {
        const idx = listActive.findIndex(o => o?.symbolCode === item?.symbolCode);
        if (idx >= 0) {
            newWatchList.push(item);
        }
    });
    localStorage.setItem(listKey, JSON.stringify(newWatchList));
}

export const isCurrentTimeInRange = (timeRangeString: string) => {
    const now = convertToSingaporeTime(new Date());
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes; // Convert time to minute
  
    let ranges = timeRangeString.split(','); // Split time periods with commas
    if(ranges.length === 0) {
        ranges = [timeRangeString];
    }

    for (const range of ranges) {
        const [startStr, endStr] = range.split('~'); // Split the time period into start and end times
        const [startHours, startMinutes] = startStr.split(':').map(Number);
        const [endHours, endMinutes] = endStr.split(':').map(Number);
    
        const startTime = startHours * 60 + startMinutes;
        let endTime = endHours * 60 + endMinutes;

        if(endTime < startTime) {
            endTime = endTime + (24* 60);
        }
  
        if ((currentTime >= startTime && currentTime <= endTime) && currentTime !== endTime) {
            return true;
        }
    }
  
    return false;
}

export const getCurrentDayAbbreviation = () => {
    const days = ['0', '1', '2', '3', '4', '5', '6'];
    const currentDate = convertToSingaporeTime(new Date());
    const currentDayIndex = currentDate.getDay();
    const currentDayAbbreviation = days[currentDayIndex];
    return currentDayAbbreviation;
} 

export const getEndTimeTrading = (timeRangeString: string) => {
    if(!timeRangeString) {
        return "";
    }

    const now = convertToSingaporeTime(new Date());
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes; // Convert time to minute

    let ranges = timeRangeString.split(','); // Split time periods with commas
    if(ranges.length === 0) {
        ranges = [timeRangeString];
    }

    //get end time each ranges [10:00~15:00,15:00~21:00]
    for (const range of ranges) {
        const [startStr, endStr] = range.split('~'); // Split the time period into start and end times
        const [startHours, startMinutes] = startStr.split(':').map(Number);
        const [endHours, endMinutes] = endStr.split(':').map(Number);
    
        const startTime = startHours * 60 + startMinutes;
        let endTime = endHours * 60 + endMinutes;
        if(endTime < startTime) {
            endTime = endTime + (24 * 60);
        }
    
        if ((currentTime >= startTime && currentTime <= endTime) && currentTime !== endTime) {
            return endStr;
        }
    }

    return ""
}

export const setTimeFromTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
  
    const time = convertToSingaporeTime(new Date());
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0);
    time.setMilliseconds(0);
  
    return time;
}

export const convertToSingaporeTime = (date: any) => {
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const singaporeOffset = 8 * 60 * 60000; // Singapore UTC offset in milliseconds
    return new Date(utcTime + singaporeOffset);
}