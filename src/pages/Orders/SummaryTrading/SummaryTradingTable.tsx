import { ILastQuote, IPortfolio, IPortfolioDownLoad, ISymbolInfo } from '../../../interfaces/order.interface'
import { checkValue, convertNumber, exportCSV, formatCurrency, formatNumber, getClassName } from '../../../helper/utils'
import { wsService } from "../../../services/websocket-service";
import { FORMAT_DATE_DOWLOAD, LIST_TICKER_ALL } from '../../../constants/general.constant';
import { useEffect, useState } from 'react';
import * as pspb from '../../../models/proto/pricing_service_pb';
import * as rspb from '../../../models/proto/rpc_pb';
import { IQuoteEvent } from '../../../interfaces/quotes.interface';
import moment from 'moment';

function SummaryTradingTable() {
    const symbolList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const [portfolio, setPortfolio] = useState<IPortfolio[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);

    useEffect(() => {
        const portfolioRes = wsService.getAccountPortfolio().subscribe(res => {
            if (res && res.accountPortfolioList) {
                const portfolioInday = res.accountPortfolioList.filter(o => o.totalVolume !== 0);
                setPortfolio(portfolioInday);
                callLastQuoteReq(res.accountPortfolioList);
                subscribeQuoteEvent(res.accountPortfolioList);
            }
        });

        const getLastQuote = wsService.getDataLastQuotes().subscribe(lastQuotes => {
            if (lastQuotes && lastQuotes.quotesList) {
                setLastQuotes(lastQuotes.quotesList);
            }
        });

        const getQuoteEvent = wsService.getQuoteSubject().subscribe(quoteEvent => {
            if (quoteEvent && quoteEvent.quoteList) {
                setQuoteEvent(quoteEvent.quoteList);
            }
        })

        return () => {
            if (portfolio) {
                unsubscribeQuoteEvent(portfolio);
            }
            portfolioRes.unsubscribe();
            getLastQuote.unsubscribe();
            getQuoteEvent.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processLastQuote(lastQuotes, portfolio);
    }, [lastQuotes]);

    useEffect(() => {
        processQuoteEvent(quoteEvent, portfolio);
    }, [quoteEvent]);

    const processLastQuote = (lastQuotes: ILastQuote[] = [], portfolio: IPortfolio[] = []) => {
        if (portfolio) {
            const temp = [...portfolio];
            lastQuotes.forEach(item => {
                if (item) {
                    const idx = temp?.findIndex(o => o?.symbolCode === item?.symbolCode);
                    if (idx >= 0) {
                        temp[idx] = {
                            ...temp[idx],
                            marketPrice: item?.currentPrice
                        }
                    }
                }
            });
            setPortfolio(temp);
        }
    }

    const processQuoteEvent = (quoteEvent: IQuoteEvent[] = [], portfolio: IPortfolio[] = []) => {
        if (portfolio) {
            const temp = [...portfolio];
            quoteEvent.forEach(item => {
                if (item) {
                    const idx = temp?.findIndex(o => o?.symbolCode === item?.symbolCode);
                    if (idx >= 0) {
                        temp[idx] = {
                            ...temp[idx],
                            marketPrice: checkValue(temp[idx]?.marketPrice, item.currentPrice)
                        }
                    }
                }
            })
            setPortfolio(temp);
        }
    }

    const callLastQuoteReq = (portfolios: IPortfolio[]) => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            portfolios.forEach((item: IPortfolio) => {
                lastQuotesRequest.addSymbolCode(item.symbolCode)
            });
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const subscribeQuoteEvent = (portfolio: IPortfolio[]) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            portfolio.forEach((item: IPortfolio) => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unsubscribeQuoteEvent = (portfolio: IPortfolio[]) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            portfolio.forEach((item: IPortfolio) => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getSymbol = (symbolCode: string) => {
        const symbol = symbolList.find((o: ISymbolInfo) => o?.symbolCode === symbolCode);
        return symbol;
    }

    const totalInvestedValue = (portfolios: IPortfolio[]) => {
        let total = 0;
        if (portfolios) {
            portfolios.forEach(item => {
                if (item) {
                    total += calcInvestedValue(item);
                }
            });
        }
        return total;
    }

    const totalCurrentValue = (portfolios: IPortfolio[]) => {
        let total = 0;
        if (portfolios) {
            portfolios.forEach(item => {
                if (item) {
                    total += calcCurrentValue(item);
                }
            });
        }
        return total;
    }

    const totalUnrealizedPL = (portfolios: IPortfolio[]) => {
        let total = 0;
        if (portfolios) {
            portfolios.forEach(item => {
                if (item) {
                    total += calcUnrealizedPL(item);
                }
            });
        }
        return total;
    }

    const _rederPortfolioInvest = () => (
        <div className="border p-3 mb-3">
            <div className="row">
                <div className="col-md-2 text-center">
                    <div>Total Invested Value:</div>
                    <div className="fs-5 fw-bold">{formatCurrency(totalInvestedValue(portfolio).toFixed(2))}</div>
                </div>
                <div className="col-md-2 text-center">
                    <div>Total Current Value:</div>
                    <div className="fs-5 fw-bold">{formatCurrency(totalCurrentValue(portfolio).toFixed(2))}</div>
                </div>
                <div className="col-md-2 text-center">
                    <div>Total Unrealized PL:</div>
                    <div className={`fs-5 fw-bold ${getClassName(totalUnrealizedPL(portfolio))}`}>{formatCurrency(totalUnrealizedPL(portfolio).toFixed(2))}</div>
                </div>
                <div className="col-md-4 order-0 order-md-4">
                    <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                </div>
            </div>
        </div>
    )
    
    const calcAvgPrice = (item: IPortfolio) => {
        return convertNumber(item.totalBuyVolume) !== 0 && convertNumber(item.ownedVolume) > 0 ? convertNumber(item.totalBuyAmount) / convertNumber(item.totalBuyVolume) : 0;
    }

    const calcInvestedValue = (item: IPortfolio) => {
        return convertNumber(item.ownedVolume) * calcAvgPrice(item);
    }

    const calcCurrentValue = (item: IPortfolio) => {
        return  convertNumber(item.ownedVolume) * convertNumber(formatCurrency(item.marketPrice));
    }

    const calcUnrealizedPL = (item: IPortfolio) => {
        return calcCurrentValue(item) !== 0 ? calcCurrentValue(item) - calcInvestedValue(item) : 0;
    }

    const calcPctUnrealizedPL = (item: IPortfolio) => {
        if (calcInvestedValue(item) === 0) {
            return 0;
        }
        return calcUnrealizedPL(item) / calcInvestedValue(item) * 100;
    }

    const handleDownLoadSummaryTrading = () => {
        const dateTimeCurrent = moment(new Date()).format(FORMAT_DATE_DOWLOAD);
        const data: IPortfolioDownLoad[] = [];        
        portfolio.forEach((item) => {
            if (item) {
                data.push({
                    tickerCode: getSymbol(item.symbolCode)?.symbolCode,
                    ownedVol: convertNumber(item.ownedVolume.toString()),
                    avgPrice: convertNumber(calcAvgPrice(item).toString()),
                    dayNotional: convertNumber(calcInvestedValue(item).toString()),
                    marketPrice: convertNumber(item.marketPrice),
                    currentValue: convertNumber(calcCurrentValue(item).toString()),
                    unrealizedPl: convertNumber(formatCurrency(calcUnrealizedPL(item).toString())),
                    percentUnrealizedPl: calcPctUnrealizedPL(item).toFixed(2) + '%',
                    transactionVol: convertNumber(item.totalVolume.toString()),
                })
            }
        })
        exportCSV(data, `summaryTrading_${dateTimeCurrent}`);
    }

    const _renderDownloadPortfolio = () => (
        <p className="text-end border-top pt-3">
                <a onClick={handleDownLoadSummaryTrading} href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
            </p>
    )

    const _renderPortfolioTableHeader = () => (
        <tr>
            <th className="text-start fz-14 w-s" >Ticker Code</th>
            <th className="text-end fz-14 w-s" >Owned Volume</th>
            <th className="text-end fz-14 w-s" >AVG Price</th>
            <th className="text-end fz-14 w-s" >Day Notional</th>
            <th className="text-end fz-14 w-s" >Market Price</th>
            <th className="text-end fz-14 w-s" >Current Value</th>
            <th className="text-end fz-14 w-s" >Unrealized PL</th>
            <th className="text-end fz-14 w-s" >% Unrealized PL</th>
            <th className="text-end fz-14 w-s" >Transaction Volume</th>
            {portfolio.length > 16 && <th className='w-5'></th>}
        </tr>
    )

    const _renderPortfolioTableBody = () => (
        portfolio?.map((item: IPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-s td" title={getSymbol(item.symbolCode)?.symbolName}>{getSymbol(item.symbolCode)?.symbolCode}</td>
                <td className='text-end w-s td'>{formatNumber(item.ownedVolume.toString())}</td>
                <td className="text-end w-s td" >{formatCurrency(calcAvgPrice(item).toString())}</td>
                <td className="text-end w-s td" >{formatCurrency(calcInvestedValue(item).toString())}</td>
                <td className="text-end w-s td" >{formatCurrency(item.marketPrice)}</td>
                <td className="text-end w-s td"  >{formatCurrency(calcCurrentValue(item).toString())}</td>
                <td className="text-end w-s td fw-600" >
                    <span className={getClassName(calcUnrealizedPL(item))}>{formatCurrency(calcUnrealizedPL(item).toString())}</span>
                </td>
                <td className="text-end w-s td fw-600">
                    <span className={getClassName(calcPctUnrealizedPL(item))}>{calcPctUnrealizedPL(item).toFixed(2) + '%'}</span>
                </td>
                <td className="text-end w-s">{formatNumber(item.totalVolume.toString())}</td>
            </tr>
        ))

    )

    const _renderPortfolioTable = () => (
        <div className="table-responsive mb-3">
            <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                <thead className="thead">
                    {_renderPortfolioTableHeader()}
                </thead>
                <tbody className='scroll tbody'>
                    {_renderPortfolioTableBody()}
                </tbody>
            </table>
        </div>
    )

    return (
        <>
            {_rederPortfolioInvest()}
            {_renderPortfolioTable()}
            {portfolio?.length > 0 && _renderDownloadPortfolio()}
        </>
    )
}

export default SummaryTradingTable