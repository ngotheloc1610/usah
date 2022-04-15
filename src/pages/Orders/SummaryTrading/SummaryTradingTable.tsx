import { ILastQuote, IPortfolio, ISymbolInfo } from '../../../interfaces/order.interface'
import { checkValue, convertNumber, formatCurrency, formatNumber } from '../../../helper/utils'
import { wsService } from "../../../services/websocket-service";
import { LIST_TICKER_ALL } from '../../../constants/general.constant';
import { useEffect, useState } from 'react';
import * as pspb from '../../../models/proto/pricing_service_pb';
import * as rspb from '../../../models/proto/rpc_pb';
import { IQuoteEvent } from '../../../interfaces/quotes.interface';

function SummaryTradingTable() {
    const symbolList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const [portfolio, setPortfolio] = useState<IPortfolio[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);

    useEffect(() => {
        const portfolioRes = wsService.getAccountPortfolio().subscribe(res => {
            if (res && res.accountPortfolioList) {
                const portfolioList = res.accountPortfolioList.filter(item => item.totalBuyVolume - item.totalSellVolume !== 0)
                setPortfolio(portfolioList);
                callLastQuoteReq(portfolioList);
                subscribeQuoteEvent(portfolioList);
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
                    {totalUnrealizedPL(portfolio) > 0 && <div className='fs-5 fw-bold text-success'>{formatCurrency(totalUnrealizedPL(portfolio).toFixed(2))}</div>}
                    {totalUnrealizedPL(portfolio) < 0 && <div className='fs-5 fw-bold text-danger'>{formatCurrency(totalUnrealizedPL(portfolio).toFixed(2))}</div>}
                    {totalUnrealizedPL(portfolio) === 0 && <div className='fs-5 fw-bold'>{formatCurrency(totalUnrealizedPL(portfolio).toFixed(2))}</div>}
                </div>
                <div className="col-md-4 order-0 order-md-4">
                    <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                </div>
            </div>
        </div>
    )

    const calcTransactionVolume = (item: IPortfolio) => {
        const buyVolume = item.totalBuyVolume ? item.totalBuyVolume : 0;
        const sellVolume = item.totalSellVolume ? item.totalSellVolume : 0;
        return buyVolume + sellVolume;
    }

    const calcOwnedVolume = (item: IPortfolio) => {
        const buyVolume = item.totalBuyVolume ? item.totalBuyVolume : 0;
        const sellVolume = item.totalSellVolume ? item.totalSellVolume : 0;
        return buyVolume < sellVolume ? 0 : buyVolume - sellVolume;
    }

    const calcInvestedValue = (item: IPortfolio) => {
        return calcOwnedVolume(item) * Number(convertNumber(item.avgBuyPrice).toFixed(2));
    }

    const calcCurrentValue = (item: IPortfolio) => {
        return calcOwnedVolume(item) * convertNumber(item.marketPrice);
    }

    const calcUnrealizedPL = (item: IPortfolio) => {
        return calcCurrentValue(item) - calcInvestedValue(item);
    }

    const calcPctUnrealizedPL = (item: IPortfolio) => {
        if (calcInvestedValue(item) === 0) {
            return 0;
        }
        return calcUnrealizedPL(item) / calcInvestedValue(item) * 100;
    }

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
            {portfolio.length > 16 && <th className='w-17'></th>}
        </tr>
    )

    const _renderPortfolioTableBody = () => (
        portfolio?.map((item: IPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-s td" title={getSymbol(item.symbolCode)?.symbolName}>{getSymbol(item.symbolCode)?.symbolCode}</td>
                <td className='text-end w-s td'>{formatNumber(calcOwnedVolume(item).toString())}</td>
                <td className="text-end w-s td" >{(item.totalBuyVolume - item.totalSellVolume > 0) ? formatCurrency(item.avgBuyPrice) : 0}</td>
                <td className="text-end w-s td" >{formatCurrency(calcInvestedValue(item).toString())}</td>
                <td className="text-end w-s td" >{formatCurrency(item.marketPrice)}</td>
                <td className="text-end w-s td"  >{formatCurrency(calcCurrentValue(item).toString())}</td>
                <td className="text-end w-s td fw-600" >
                    {calcUnrealizedPL(item) > 0 && <span className='text-success'>{formatCurrency(calcUnrealizedPL(item).toString())}</span>}
                    {calcUnrealizedPL(item) < 0 && <span className='text-danger'>{formatCurrency(calcUnrealizedPL(item).toString())}</span>}
                    {calcUnrealizedPL(item) === 0 && <span>{formatCurrency(calcUnrealizedPL(item).toString())}</span>}
                </td>
                <td className="text-end w-s td fw-600">
                    {calcPctUnrealizedPL(item) > 0 && <span className='text-success'>{calcPctUnrealizedPL(item).toFixed(2) + '%'}</span>}
                    {calcPctUnrealizedPL(item) < 0 && <span className='text-danger'>{calcPctUnrealizedPL(item).toFixed(2) + '%'}</span>}
                    {calcPctUnrealizedPL(item) === 0 && <span>{calcPctUnrealizedPL(item).toFixed(2) + '%'}</span>}
                </td>
                <td className="text-end w-s">{formatNumber(calcTransactionVolume(item).toString())}</td>
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
        </>
    )
}

export default SummaryTradingTable