import { ITickerInfo, IOrderHistory, IOrderTradeHistory, ITickerPortfolio, IHistorySearchStatus, ILastQuote } from "../interfaces/order.interface";
import { IReportList } from "../interfaces/report.interface"
import { INewsNav, INotificationList, INotificationDetail, } from "../interfaces/news.interface"
import * as tdpb from '../models/proto/trading_model_pb';

export const TradingModel: any = tdpb;

export const defaultTickerSearch: ILastQuote = {
    asksList: [],
    bidsList: [],
    close: '',
    currentPrice: '',
    high: '',
    low: '',
    netChange: '',
    open: '',
    pctChange: '',
    quoteTime: 0,
    scale: 0,
    symbolCode: '',
    symbolId: 0,
    tickPerDay: 0,
    volumePerDay: '',
    volume: ''
}

export const LIST_TICKER_INFOR_MOCK_DATA: ITickerInfo[] = [
    {
        symbolId: 1,
        tickerName: 'Apple Inc.',
        ticker: 'AAPL',
        stockPrice: '142.83',
        previousClose: '152.93',
        open: '152.98',
        high: '160.58',
        low: '145.28',
        lastPrice: '153.18',
        volume: '34100',
        change: '0.20',
        changePrecent: '0.13',
    },
    {
        symbolId: 2,
        tickerName: 'Adobe Inc.',
        ticker: 'ADBE',
        stockPrice: '577.70',
        previousClose: '606.54',
        open: '606.59',
        high: '636.87',
        low: '576.21',
        lastPrice: '584.98',
        volume: '45600',
        change: '-21.6',
        changePrecent: '-3.56',
    },
    {
        symbolId: 3,
        tickerName: 'Advanced Micro Devices, Inc.',
        ticker: 'AMD',
        stockPrice: '100.35',
        previousClose: '105.32',
        open: '105.37',
        high: '110.59',
        low: '100.05',
        lastPrice: '107.89',
        volume: '8000',
        change: '2.52',
        changePrecent: '2.39',
    },
    {
        symbolId: 4,
        tickerName: 'Alibaba Gr. Ho. Ltd.',
        ticker: 'BABA',
        stockPrice: '151.19',
        previousClose: '158.70',
        open: '158.75',
        high: '166.64',
        low: '150.77',
        lastPrice: '159.09',
        volume: '7000',
        change: '0.34',
        changePrecent: '0.21',
    },
    {
        symbolId: 5,
        tickerName: 'Amazon.com, Inc.',
        ticker: 'AMZN',
        stockPrice: '3301.12',
        previousClose: '3466.13',
        open: '3466.18',
        high: '3639.44',
        low: '3292.82',
        lastPrice: '3460.23',
        volume: '300',
        change: '-5.95',
        changePrecent: '0.17',
    },
    {
        symbolId: 6,
        tickerName: 'The Boeing Company',
        ticker: 'BA',
        stockPrice: '225.36',
        previousClose: '236.58',
        open: '236.63',
        high: '248.41',
        low: '224.75',
        lastPrice: '238.45',
        volume: '1900',
        change: '1.82',
        changePrecent: '0.77',
    },
    {
        symbolId: 7,
        tickerName: 'salesforce.com, inc.',
        ticker: 'CRM',
        stockPrice: '270.50',
        previousClose: '283.98',
        open: '284.03',
        high: '298.18',
        low: '269.78',
        lastPrice: '289.39',
        volume: '34900',
        change: '5.36',
        changePrecent: '1.89',
    },
    {
        symbolId: 8,
        tickerName: 'The Walt Disney Company',
        ticker: 'DIS',
        stockPrice: '172.68',
        previousClose: '181.26',
        open: '181.31',
        high: '190.32',
        low: '172.20',
        lastPrice: '184.78',
        volume: '15300',
        change: '3.47',
        changePrecent: '1.91',
    },
    {
        symbolId: 9,
        tickerName: 'Meta Platforms, Inc.',
        ticker: 'FB',
        stockPrice: '339.61',
        previousClose: '356.54',
        open: '356.59',
        high: '374.37',
        low: '338.71',
        lastPrice: '360.99',
        volume: '17800',
        change: '4.40',
        changePrecent: '1.23',
    },
    {
        symbolId: 10,
        tickerName: 'Alphabet Inc.',
        ticker: 'GOOGL',
        stockPrice: '2,687.07',
        previousClose: '2,821.37',
        open: '2,821.42',
        high: '2,962.44',
        low: '2,680.30',
        lastPrice: '2,814.67',
        volume: '17000',
        change: '-6.75',
        changePrecent: '-0.24',
    },
    {
        symbolId: 11,
        tickerName: 'Intel Corporation',
        ticker: 'INTC',
        stockPrice: '53.49',
        previousClose: '56.11',
        open: '56.16',
        high: '58.92',
        low: '53.30',
        lastPrice: '57.09',
        volume: '42400',
        change: '0.93',
        changePrecent: '1.66',
    },
    {
        symbolId: 12,
        tickerName: 'Johnson & Johnson',
        ticker: 'JNJ',
        stockPrice: '164.02',
        previousClose: '172.17',
        open: '172.22',
        high: '180.78',
        low: '163.56',
        lastPrice: '170.34',
        volume: '1100',
        change: '-1.88',
        changePrecent: '-1.09',
    },
    {
        symbolId: 13,
        tickerName: 'JPMorgan Chase & Co.',
        ticker: 'JPM',
        stockPrice: '165.95',
        previousClose: '174.20',
        open: '174.25',
        high: '182.91',
        low: '165.49',
        lastPrice: '178.46',
        volume: '4700',
        change: '4.21',
        changePrecent: '2.42',
    },
    {
        symbolId: 14,
        tickerName: 'The Coca-Cola Company',
        ticker: 'KO',
        stockPrice: '52.96',
        previousClose: '55.63',
        open: '55.61',
        high: '58.41',
        low: '52.85',
        lastPrice: '57.77',
        volume: '8100',
        change: '2.16',
        changePrecent: '3.88',
    },
    {
        symbolId: 15,
        tickerName: 'Moderna, Inc.',
        ticker: 'MRNA',
        stockPrice: '378.90',
        previousClose: '397.87',
        open: '397.85',
        high: '417.76',
        low: '377.98',
        lastPrice: '402.99',
        volume: '1800',
        change: '5.14',
        changePrecent: '1.29',
    },
    {
        symbolId: 16,
        tickerName: 'Microsoft Corporation',
        ticker: 'MSFT',
        stockPrice: '284.00',
        previousClose: '298.22',
        open: '298.20',
        high: '313.13',
        low: '283.31',
        lastPrice: '301.23',
        volume: '1400',
        change: '3.03',
        changePrecent: '1.02',
    },
    {
        symbolId: 17,
        tickerName: 'Netflix, Inc.',
        ticker: 'NFLX',
        stockPrice: '599.06',
        previousClose: '629.03',
        open: '629.01',
        high: '660.48',
        low: '597.58',
        lastPrice: '515.15',
        volume: '4500',
        change: '-13.86',
        changePrecent: '-2.20',
    },
    {
        symbolId: 18,
        tickerName: 'NVIDIA Corporation',
        ticker: 'NVDA',
        stockPrice: '205.17',
        previousClose: '215.45',
        open: '215.43',
        high: '226.22',
        low: '204.68',
        lastPrice: '219.99',
        volume: '4400',
        change: '4.56',
        changePrecent: '2.12',
    },
    {
        symbolId: 19,
        tickerName: 'Pfizer Inc.',
        ticker: 'PFE',
        stockPrice: '43.53',
        previousClose: '45.73',
        open: '45.71',
        high: '48.02',
        low: '43.44',
        lastPrice: '43.48',
        volume: '10900',
        change: '-2.23',
        changePrecent: '-4.88',
    },
    {
        symbolId: 20,
        tickerName: 'The Procter & Gamble Company',
        ticker: 'PG',
        stockPrice: '142.02',
        previousClose: '294.58',
        open: '294.56',
        high: '309.31',
        low: '279.85',
        lastPrice: '300.01',
        volume: '11200',
        change: '5.45',
        changePrecent: '1.85',
    },
    {
        symbolId: 21,
        tickerName: 'PayPal Holdings, Inc.',
        ticker: 'PYPL',
        stockPrice: '259.00',
        previousClose: '158.16',
        open: '158.14',
        high: '166.07',
        low: '150.25',
        lastPrice: '156.78',
        volume: '9000',
        change: '-1.27',
        changePrecent: '-0.80',
    },
    {
        symbolId: 22,
        tickerName: 'QUALCOMM Incorporated',
        ticker: 'QCOM',
        stockPrice: '129.28',
        previousClose: '132.13',
        open: '132.11',
        high: '138.74',
        low: '125.52',
        lastPrice: '132.05',
        volume: '60000',
        change: '-0.06',
        changePrecent: '-0.05',
    },
    {
        symbolId: 23,
        tickerName: 'Invesco QQQ Trust (ETF)',
        ticker: 'QQQ',
        stockPrice: '359.28',
        previousClose: '387.17',
        open: '387.15',
        high: '406.53',
        low: '367.81',
        lastPrice: '401.89',
        volume: '3400',
        change: '14.74',
        changePrecent: '3.81',
    },
    {
        symbolId: 24,
        tickerName: 'SPDR S&P 500 ETF Trust (ETF)',
        ticker: 'SPY',
        stockPrice: '434.45',
        previousClose: '433.47',
        open: '433.45',
        high: '455.14',
        low: '411.80',
        lastPrice: '435.23',
        volume: '70000',
        change: '1.78',
        changePrecent: '0.41',
    },
    {
        symbolId: 25,
        tickerName: 'Square, Inc.',
        ticker: 'SQ',
        stockPrice: '236.04',
        previousClose: '234.97',
        open: '235.00',
        high: '246.72',
        low: '223.22',
        lastPrice: '236.02',
        volume: '120000',
        change: '1.02',
        changePrecent: '0.43',
    },
    {
        symbolId: 26,
        tickerName: 'AT&T Inc.',
        ticker: 'T',
        stockPrice: '27.40',
        previousClose: '25.67',
        open: '25.70',
        high: '26.95',
        low: '24.39',
        lastPrice: '25.30',
        volume: '40000',
        change: '-0.40',
        changePrecent: '-1.56',
    },
    {
        symbolId: 27,
        tickerName: 'Tesla, Inc.',
        ticker: 'TSLA',
        stockPrice: '781.31',
        previousClose: '782.27',
        open: '782.30',
        high: '821.38',
        low: '743.16',
        lastPrice: '798.68',
        volume: '320000',
        change: '16.38',
        changePrecent: '2.09',
    },
    {
        symbolId: 28,
        tickerName: 'Visa Inc.',
        ticker: 'V',
        stockPrice: '226.68',
        previousClose: '225.86',
        open: '225.89',
        high: '237.15',
        low: '214.57',
        lastPrice: '226.32',
        volume: '2000',
        change: '0.43',
        changePrecent: '0.19',
    },
    {
        symbolId: 29,
        tickerName: 'Verizon Communications Inc.',
        ticker: 'VZ',
        stockPrice: '54.38',
        previousClose: '54.29',
        open: '54.32',
        high: '57.00',
        low: '51.58',
        lastPrice: '54.67',
        volume: '23000',
        change: '0.35',
        changePrecent: '0.64',
    },
    {
        symbolId: 30,
        tickerName: 'Walmart Inc.',
        ticker: 'WMT',
        stockPrice: '140.44',
        previousClose: '140.19',
        open: '140.22',
        high: '147.20',
        low: '133.18',
        lastPrice: '141.22',
        volume: '9000',
        change: '1.00',
        changePrecent: '0.71',
    },
    {
        symbolId: 31,
        tickerName: 'Exxon',
        ticker: 'XOM',
        stockPrice: '59.88',
        previousClose: '58.85',
        open: '58.88',
        high: '61.79',
        low: '55.91',
        lastPrice: '58.52',
        volume: '10000',
        change: '-0.36',
        changePrecent: '-0.61',
    },
    {
        symbolId: 32,
        tickerName: 'Baidu,Inc.',
        ticker: 'BIDU',
        stockPrice: '171.27',
        previousClose: '171.31',
        open: '171.34',
        high: '179.88',
        low: '162.74',
        lastPrice: '171.55',
        volume: '220000',
        change: '0.21',
        changePrecent: '0.12',
    },
    {
        symbolId: 33,
        tickerName: 'JD.com.Inc.',
        ticker: 'JD',
        stockPrice: '85.73',
        previousClose: '85.32',
        open: '85.35',
        high: '89.59',
        low: '81.05',
        lastPrice: '84.01',
        volume: '3000',
        change: '-1.34',
        changePrecent: '-1.57',
    }
]

export const LIST_DATA_ORDER = [
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
    {
        ticker: 'ADBE',
        sideName: 'Buy',
        typeName: 'Limit',
        price: 145.6,
        volume: 1478.1,
        pending: 210.145,
        date: 'Dec 13, 2021  10:50:21'
    },
]
export const LIST_DATA_TICKERS = [
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 22,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    },
    {
        tickerName: 'ADBE',
        volume3Order: '2,000',
        number3Order: 24,
        price3Order: 145.46,
        volume2Order: 21600,
        number2Order: 4,
        price2Order: 145.6,
        volume1Order: 13800,
        number1Order: 6,
        price1Order: 145.44,
        bid1Price: 145.43,
        bid1Volume: 2400,
        bid1Number: 38,
        bid2Price: 145.2,
        bid2Volume: 2200,
        bid2Number: 5,
        bid3Price: 154.41,
        bid3Volume: 5000,
        bid3Number: 6,
    }
];

export const DATA_ASK_VOLUME = [
    {
        askVol: '2,400',
        price: '145.60',
        bidPrice: ''
    },
    {
        askVol: '1,500',
        price: '145.59',
        bidPrice: ''
    },
    {
        askVol: '900',
        price: '145.58',
        bidPrice: ''
    },
];

export const DATA_BID_PRICE = [
    {
        askVol: '',
        price: '145.56',
        bidPrice: '2,400'
    },
    {
        askVol: '',
        price: '145.55',
        bidPrice: '1,700'
    },
    {
        askVol: '',
        price: '145.54',
        bidPrice: '800'
    },
];

export const ORDER_BOOK_HEADER = ['ask price', 'price', 'bid price'];

export const ORDER_HISTORY: IOrderHistory[] = [
    {
        orderId: '00133',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Sell',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '300',
        remainVolume: '0',
        executedVolume: '300',
        orderPrice: '158.35',
        lastPrice: '158.35',
        orderDatetime: 'Dec 2 2021 10:01:25',
        excutedDatetime: 'Dec 2 2021 10:02:10'
    },
    {
        orderId: '00233',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Buy',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '1,000',
        remainVolume: '0',
        executedVolume: '1,000',
        orderPrice: '158.40',
        lastPrice: '158.40',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:17:55'
    },
    {
        orderId: '00333',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Sell',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '700',
        remainVolume: '0',
        executedVolume: '700',
        orderPrice: '158.35',
        lastPrice: '158.35',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:02:43'
    },
    {
        orderId: '00433',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Buy',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '1,500',
        remainVolume: '1,500',
        executedVolume: '0',
        orderPrice: '104.06',
        lastPrice: '104.06',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:17:55'
    },
    {
        orderId: '00533',
        ticker: 'AMD',
        companyName: 'Advanced Micro Devices, Inc.',
        side: 'Buy',
        orderStatus: 'Rejected',
        orderType: 'Limit',
        orderVolume: '3,110',
        remainVolume: '3,110',
        executedVolume: '0',
        orderPrice: '52.95',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 11:11:24',
        excutedDatetime: 'Dec 2 2021 11:11:24'
    },
    {
        orderId: '00633',
        ticker: 'AMZN',
        companyName: 'Amazon.com, Inc.',
        side: 'Buy',
        orderStatus: 'Canceled',
        orderType: 'Limit',
        orderVolume: '2,000',
        remainVolume: '2,000',
        executedVolume: '0',
        orderPrice: '166.54',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 13:42:10',
        excutedDatetime: 'Dec 2 2021 13:43:10'
    },
    {
        orderId: '00733',
        ticker: 'ABE',
        companyName: 'Adobe Inc.',
        side: 'Buy',
        orderStatus: 'Working',
        orderType: 'Limit',
        orderVolume: '1,500',
        remainVolume: '1,500',
        executedVolume: '0',
        orderPrice: '103.00',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 13:45:32',
        excutedDatetime: ''
    },
    {
        orderId: '00133',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Sell',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '300',
        remainVolume: '0',
        executedVolume: '300',
        orderPrice: '158.35',
        lastPrice: '158.35',
        orderDatetime: 'Dec 2 2021 10:01:25',
        excutedDatetime: 'Dec 2 2021 10:02:10'
    },
    {
        orderId: '00233',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Buy',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '1,000',
        remainVolume: '0',
        executedVolume: '1,000',
        orderPrice: '158.40',
        lastPrice: '158.40',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:17:55'
    },
    {
        orderId: '00333',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Sell',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '700',
        remainVolume: '0',
        executedVolume: '700',
        orderPrice: '158.35',
        lastPrice: '158.35',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:02:43'
    },
    {
        orderId: '00433',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        side: 'Buy',
        orderStatus: 'Filled',
        orderType: 'Limit',
        orderVolume: '1,500',
        remainVolume: '0',
        executedVolume: '1,500',
        orderPrice: '104.06',
        lastPrice: '104.06',
        orderDatetime: 'Dec 2 2021 10:01:50',
        excutedDatetime: 'Dec 2 2021 10:17:55'
    },
    {
        orderId: '00533',
        ticker: 'AMD',
        companyName: 'Advanced Micro Devices, Inc.',
        side: 'Buy',
        orderStatus: 'Rejected',
        orderType: 'Limit',
        orderVolume: '3,110',
        remainVolume: '3,110',
        executedVolume: '0',
        orderPrice: '52.95',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 11:11:24',
        excutedDatetime: 'Dec 2 2021 11:11:24'
    },
    {
        orderId: '00633',
        ticker: 'AMZN',
        companyName: 'Amazon.com, Inc.',
        side: 'Buy',
        orderStatus: 'Canceled',
        orderType: 'Limit',
        orderVolume: '2,000',
        remainVolume: '2,000',
        executedVolume: '0',
        orderPrice: '166.54',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 13:42:10',
        excutedDatetime: 'Dec 2 2021 13:43:10'
    },
    {
        orderId: '00733',
        ticker: 'ABE',
        companyName: 'Adobe Inc.',
        side: 'Buy',
        orderStatus: 'Working',
        orderType: 'Limit',
        orderVolume: '1,500',
        remainVolume: '1,500',
        executedVolume: '0',
        orderPrice: '103.00',
        lastPrice: '',
        orderDatetime: 'Dec 2 2021 13:45:32',
        excutedDatetime: ''
    },
]

export const ORDER_HISTORY_SEARCH_STATUS: IHistorySearchStatus[] = [
    {
        code: TradingModel.OrderState.ORDER_STATE_NONE,
        name: "All"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_PLACED,
        name: "Working"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_CANCELED,
        name: "Canceled"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_PARTIAL,
        name: "Partial"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_FILLED,
        name: "Filled"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_REJECTED,
        name: "Rejected"
    },
]

export const ORDER_TRADE_HISTORY: IOrderTradeHistory[] = [
    {
        oderId: '001333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Sell',
        orderType: 'Limit',
        orderVolume: '30,000',
        orderPrice: '158.35',
        executedVolume: '30,000',
        executedPrice: '158.35',
        matchedValue: '4,750,500',
        excutedDatetime: 'Dec 2 2021 10:01:25'
    },
    {
        oderId: '002333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Buy',
        orderType: 'Limit',
        orderVolume: '10,000',
        orderPrice: '158.45',
        executedVolume: '10,000',
        executedPrice: '158.45',
        matchedValue: '1,584,500',
        excutedDatetime: 'Dec 2 2021 10:01:50'
    },
    {
        oderId: '001333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Sell',
        orderType: 'Limit',
        orderVolume: '30,000',
        orderPrice: '158.35',
        executedVolume: '30,000',
        executedPrice: '158.35',
        matchedValue: '4,750,500',
        excutedDatetime: 'Dec 2 2021 10:01:25'
    },
    {
        oderId: '002333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Buy',
        orderType: 'Limit',
        orderVolume: '10,000',
        orderPrice: '158.45',
        executedVolume: '10,000',
        executedPrice: '158.45',
        matchedValue: '1,584,500',
        excutedDatetime: 'Dec 2 2021 10:01:50'
    },
    {
        oderId: '001333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Sell',
        orderType: 'Limit',
        orderVolume: '30,000',
        orderPrice: '158.35',
        executedVolume: '30,000',
        executedPrice: '158.35',
        matchedValue: '4,750,500',
        excutedDatetime: 'Dec 2 2021 10:01:25'
    },
    {
        oderId: '002333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Buy',
        orderType: 'Limit',
        orderVolume: '10,000',
        orderPrice: '158.45',
        executedVolume: '10,000',
        executedPrice: '158.45',
        matchedValue: '1,584,500',
        excutedDatetime: 'Dec 2 2021 10:01:50'
    },
    {
        oderId: '001333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Sell',
        orderType: 'Limit',
        orderVolume: '30,000',
        orderPrice: '158.35',
        executedVolume: '30,000',
        executedPrice: '158.35',
        matchedValue: '4,750,500',
        excutedDatetime: 'Dec 2 2021 10:01:25'
    },
    {
        oderId: '002333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Buy',
        orderType: 'Limit',
        orderVolume: '10,000',
        orderPrice: '158.45',
        executedVolume: '10,000',
        executedPrice: '158.45',
        matchedValue: '1,584,500',
        excutedDatetime: 'Dec 2 2021 10:01:50'
    },
    {
        oderId: '001333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Sell',
        orderType: 'Limit',
        orderVolume: '30,000',
        orderPrice: '158.35',
        executedVolume: '30,000',
        executedPrice: '158.35',
        matchedValue: '4,750,500',
        excutedDatetime: 'Dec 2 2021 10:01:25'
    },
    {
        oderId: '002333',
        tickerCode: 'ADBE',
        tickerName: 'Adobe Inc.',
        side: 'Buy',
        orderType: 'Limit',
        orderVolume: '10,000',
        orderPrice: '158.45',
        executedVolume: '10,000',
        executedPrice: '158.45',
        matchedValue: '1,584,500',
        excutedDatetime: 'Dec 2 2021 10:01:50'
    },
]

export const ORDER_PORTFOLIO: ITickerPortfolio[] = [
    {
        companyName: 'Apple inc',
        ticker: 'AAPL',
        ownedVolume: '300',
        orderPendingVolume: 0,
        avgPrice: '142.80',
        investedValue: '42,840.00',
        marketPrice: '152.60',
        curentValue: '45,780.00',
        pl: '2940.00',
        plPercent: 6.86
    },
    {
        companyName: 'Visa Inc',
        ticker: 'V',
        ownedVolume: '2,000',
        orderPendingVolume: 0,
        avgPrice: '226.65',
        investedValue: '453,340.00',
        marketPrice: '230.75',
        curentValue: '461,500.00',
        pl: '8200.00',
        plPercent: 1.81
    },
    {
        companyName: 'Exxon',
        ticker: 'XOM',
        ownedVolume: '1,000',
        orderPendingVolume: 0,
        avgPrice: '56.30',
        investedValue: '56,300.00',
        marketPrice: '53.20',
        curentValue: '53,200.00',
        pl: '-3100.00',
        plPercent: -5.86
    },
    {
        companyName: 'Tesla Inc	',
        ticker: 'TSLA',
        ownedVolume: '0',
        orderPendingVolume: 200,
        avgPrice: '760.50',
        investedValue: '578,360.25',
        marketPrice: '781.20',
        curentValue: '594,102.60',
        pl: '15742.35',
        plPercent: 2.72
    },
    {
        companyName: 'Netflix Inc',
        ticker: 'NFLX',
        ownedVolume: '0',
        orderPendingVolume: 400,
        avgPrice: '568.10',
        investedValue: '322,737.61',
        marketPrice: '575.00',
        curentValue: '326,657.50',
        pl: '3919.89',
        plPercent: 1.21
    },
    {
        companyName: 'Exxon',
        ticker: 'XOM',
        ownedVolume: '1,000',
        orderPendingVolume: 0,
        avgPrice: '56.30',
        investedValue: '56,300.00',
        marketPrice: '53.20',
        curentValue: '53,200.00',
        pl: '-3100.00',
        plPercent: -5.86
    },
    {
        companyName: 'Tesla Inc',
        ticker: 'TSLA',
        ownedVolume: '0',
        orderPendingVolume: 200,
        avgPrice: '760.50',
        investedValue: '578,360.25',
        marketPrice: '781.20',
        curentValue: '594,102.60',
        pl: '15742.35',
        plPercent: 2.72
    },
    {
        companyName: 'Netflix Inc',
        ticker: 'NFLX',
        ownedVolume: '0',
        orderPendingVolume: 400,
        avgPrice: '568.10',
        investedValue: '322,737.61',
        marketPrice: '575.00',
        curentValue: '326,657.50',
        pl: '3919.89',
        plPercent: 1.21
    },

]

export const REPORT_LIST: IReportList[] = [
    {
        name: 'Monthly_Report_20211201',
        type: 'Monthly',
        date: 'Dec 01 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211202',
        type: 'Daily',
        date: 'Dec 02 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211203',
        type: 'Daily',
        date: 'Dec 03 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211204',
        type: 'Daily',
        date: 'Dec 04 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211205',
        type: 'Daily',
        date: 'Dec 05 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211206',
        type: 'Daily',
        date: 'Dec 06 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211207',
        type: 'Daily',
        date: 'Dec 07 2021',
        status: 'Not Yet'
    }

]

export const LIST_NEWS_NAV: INewsNav[] = [
    {
        title: 'Admin News',
        unRead: '02',
        active: true
    },
    {
        title: 'Trading Results',
        unRead: '0',
        active: false
    },
]

export const NOTIFICATION_LIST: INotificationList[] = [
    {
        unRead: true,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8:00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: true,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X would like to send you guideline for the system'
    },
    {
        unRead: false,
        state: true,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X would like to send you new password in email'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Welcome customer, sign in successful'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    },
    {
        unRead: false,
        state: false,
        title: 'PI-X News',
        content: 'Dear valued Customer, PI-X will update the system during 8::00 - 10:00 on Dec 25 2021'
    }
]

export const NOTIFICATION_DETAIL: INotificationDetail[] = [
    {
        title: 'PIX News',
        date: 'Dec 25 2021  12:40:22',
        content: ' Inceptos suspendisse fringilla ultricies ut nam orci dictum commodo sociosqu netus efficitur facilisi aptent, platea lacus mus aliquam potenti ad eu turpis vitae quisque gravida eleifend.'
    }
]

export const Mock_Bids_Ask = [
    {
        totalBids: 19,
        numberBids: 19,
        bidPrice: 157.67,
        askPrice: 157.68,
        numberAsk: 23,
        totalAsk: 23,
    },
    {
        totalBids: 42,
        numberBids: 23,
        bidPrice: 157.66,
        askPrice: 157.69,
        numberAsk: 18,
        totalAsk: 41,
    },
    {
        totalBids: 74,
        numberBids: 32,
        bidPrice: 157.65,
        askPrice: 157.70,
        numberAsk: 42,
        totalAsk: 83,
    },
    {
        totalBids: 19,
        numberBids: 19,
        bidPrice: 157.67,
        askPrice: 157.68,
        numberAsk: 23,
        totalAsk: 23,
    },
    {
        totalBids: 19,
        numberBids: 19,
        bidPrice: 157.67,
        askPrice: 157.68,
        numberAsk: 23,
        totalAsk: 23,
    }
]

export const MOCKDATA_TRADE_HISTORY = [
    {
        dateTime: '10:26:30',
        volume: '1,200',
        price: '157.54'
    },
    {
        dateTime: '10:26:30',
        volume: '1,200',
        price: '157.54'
    },
    {
        dateTime: '10:26:30',
        volume: '1,200',
        price: '157.54'
    },
    {
        dateTime: '10:26:30',
        volume: '1,200',
        price: '157.54'
    },
    {
        dateTime: '10:26:30',
        volume: '1,200',
        price: '157.54'
    }
]

export const MOCKDATA_ORDER_BOOK_DETAIL = {

    tickerName: 'AAPL',
    lastPrice: '157.67',
    open: '158.67',
    high: '159.63',
    low: '160.67',
    change: '4.56',
    changePercent: '3.89',
    dailyTradingVol: '1,452,798',
    averageTradingVol: '3,283,932',
    vwap: '156.38',
    lotSize: '100',
    floor: '162.87',
    ceiling: '151.72',
}

export const DEFAULT_CURRENT_TICKER: ITickerInfo = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
    side: '',
}