import "./MultiTrader.scss"
import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import { useEffect, useRef, useState } from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, LIST_TICKER_INFO, SOCKET_CONNECTED, SUB_ACCOUNTS, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp, convertNumber, formatCurrency, formatNumber } from "../../../helper/utils";
import { IListPortfolio, ISymbolInfo, ITradingAccountVertical } from "../../../interfaces/order.interface";

const MultiTraderTable = () => {
    const [dataTradeHistory, setDataTradeHistory] = useState<any>([]);
    const [accountId, setAccountId] = useState('');
    const [listTicker, setListTicker] = useState<ISymbolInfo[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || "[]"));
    const [dataTotalAccount, setDataTotalAccount] = useState<ITradingAccountVertical[]>([]);
    const [dataHasOwnedVolume, setDataHasOwnedVolume] = useState<ITradingAccountVertical[]>([]);
    const [totalNetFollowAccountId, setTotalNetFollowAccountId] = useState<string[]>([]);
    const [totalGrossFollowAccountId, setTotalGrossFollowAccountId] = useState<string[]>([]);
    const [totalPlFollowAccountId, setTotalPlFollowAccountId] = useState<string[]>([]);
    const lstId = JSON.parse(localStorage.getItem(SUB_ACCOUNTS) || '[]');
    const listHeaderName = [...lstId, 'Total Net Position', 'Total Gross Transactions', 'Total Realized PL'];
    const [totalAccountPortfolio, setTotalAccountPortfolio] = useState<IListPortfolio[]>([]);
    const [allTotalNet, setAllTotalNet] = useState(0);
    const [allTotalGross, setAllTotalGross] = useState(0);
    const [allTotalPL, setAllTotalPL] = useState(0);
    const [elWidth, setElWidth] = useState(0);
    const [elHeight, setElHeight] = useState(0);
    const clientWidth: any = useRef();
    const clientHeight: any = useRef();

    useEffect(() => {
        if (clientWidth.current) {
            const width = clientWidth.current.clientWidth
            setElWidth(width)
        }
        if (clientHeight.current) {
            const height = clientHeight.current.clientHeight;
            setElHeight(height)
        }
    },[lstId])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageMultiTrader(lstId)
                sendTradeHistoryReq();
            }
        });

        const renderDataToScreen = wsService.getAccountPortfolio().subscribe(res => {
            if (res && res.accountPortfolioList) {
                setTotalAccountPortfolio(res.accountPortfolioList);
            }
        });


        const getTradeHistory = wsService.getTradeHistory().subscribe(res => {
            setDataTradeHistory(res.tradeList)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
            getTradeHistory.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processPortfolio(totalAccountPortfolio)
    }, [totalAccountPortfolio])

    const processPortfolio = (totalAccountPortfolio: IListPortfolio[]) => {
        const tmp: ITradingAccountVertical[] = [];
        const tempTotalNetPositions: string[] = [];
        const tempTotalGross: string[] = [];
        const tempTotalPL: string[] = [];
        let totalNet = 0;
        let totalGross = 0;
        let totalAllPL = 0;
        listTicker.forEach(item => {
            const tempData: any[] = [];
            let netPosition = 0;
            let totalSell = 0;
            let totalPL = 0;
            lstId.forEach((ele: string) => {
                if (ele) {
                    const idx = totalAccountPortfolio.findIndex(o => o?.symbolCode === item?.symbolCode && o?.accountId.toString() === ele);
                    if (idx >= 0) {
                        const buyVolume = convertNumber(totalAccountPortfolio[idx]?.totalBuyVolume.toString());
                        const sellVolume = convertNumber(totalAccountPortfolio[idx]?.totalSellVolume.toString());
                        const avgBuyPrice = convertNumber(totalAccountPortfolio[idx]?.avgBuyPrice);
                        const avgSellPrice = convertNumber(totalAccountPortfolio[idx]?.avgSellPrice);
                        const ownedVolume = buyVolume + sellVolume;
                        tempData.push(
                            {
                                accountId: ele,
                                ownedVolume: ownedVolume.toString()
                            }
                        );
                        netPosition += (avgBuyPrice * buyVolume);
                        totalSell += (avgSellPrice * sellVolume);
                        totalPL += (avgSellPrice - avgBuyPrice) * sellVolume;
                    } else {
                        tempData.push('0');
                    }
                }
            });
            totalNet += netPosition;
            totalGross += (netPosition + totalSell);
            totalAllPL += totalPL;
            const obj: ITradingAccountVertical = {
                holdingVolume: tempData,
                ticker: item?.symbolCode,
                totalGrossTransactions: (netPosition + totalSell).toString(),
                totalNetPosition: netPosition.toString(),
                totalPl: totalPL
            };
            tmp.push(obj)
        });
        setDataTotalAccount(tmp);
        setAllTotalNet(totalNet);
        setAllTotalGross(totalGross);
        setAllTotalPL(totalAllPL);
        const listDataHasOwnedVolume = tmp.filter(el => el?.holdingVolume?.some(item => Number(item) !== 0));
        setDataHasOwnedVolume(listDataHasOwnedVolume);

        lstId.forEach(item => {
            if (item) {
                let total = 0;
                let totalGross = 0;
                let totalPL = 0;
                const objs = totalAccountPortfolio.filter(o => o?.accountId.toString() === item.toString());
                if (objs && objs.length > 0) {
                    objs.forEach(item => {
                        if (item) {
                            total += (convertNumber(item.avgBuyPrice) * item.totalBuyVolume);
                            const totalSell = convertNumber(item.avgSellPrice) * item.totalSellVolume;
                            totalGross += (totalSell + convertNumber(item.avgBuyPrice) * item.totalBuyVolume)
                            totalPL += (convertNumber(item.avgSellPrice) - convertNumber(item.avgBuyPrice)) * item.totalSellVolume;
                        }
                    })
                }

                tempTotalNetPositions.push(total.toString());
                tempTotalGross.push(totalGross.toString());
                tempTotalPL.push(totalPL.toString());
            }
        });
        setTotalNetFollowAccountId(tempTotalNetPositions);
        setTotalGrossFollowAccountId(tempTotalGross);
        setTotalPlFollowAccountId(tempTotalPL)
    }

    const buildMessage = (accountId: string) => {
        const today = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            tradeHistoryRequest.setFromDatetime(convertDatetoTimeStamp(today, FROM_DATE_TIME))
            tradeHistoryRequest.setToDatetime(convertDatetoTimeStamp(today, TO_DATE_TIME))
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendTradeHistoryReq = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);
    }


    const sendMessageMultiTrader = (lstAccountIds: string[]) => {
        setAccountId(accountId)
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            lstAccountIds.forEach(item => {
                if (item) {
                    accountPortfolioRequest.addAccountId(Number(item));
                }
            })
            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_PORTFOLIO_REQ);
            rpcMsg.setPayloadData(accountPortfolioRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getNameClass = (item: number) => {
        if (item > 0) {
            return "text-success"
        }
        if (item < 0) {
            return "text-danger"
        } else {
            return ""
        }
    }

    const _rederMultiTraderInvest = () => {

        return (
            <div className="border p-3 mb-3">
                <div className="row">
                    <div className="col-md-2 text-center">
                        <div>Total Accounts</div>
                        <div className="fs-5 fw-bold">{lstId.length}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Net Position</div>
                        <div className="fs-5 fw-bold">{formatCurrency(allTotalNet.toString())}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Gross Transactions</div>
                        <div className="fs-5 fw-bold">{formatCurrency(allTotalGross.toString())}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Realized PL</div>
                        <div className={`fs-5 fw-bold ${getNameClass(allTotalPL)}`}>{formatCurrency(allTotalPL.toString())}</div>
                    </div>
                    <div className="col-md-4 order-0 order-md-4">
                        <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                    </div>
                </div>
            </div>
        )
    }

    const _renderTradingAccountId = () => {
        return (<div className="div_maintb">
            <div>
                <div className="ticker d-flex align-items-center justify-content-center" style={{width: elWidth , height: elHeight}}><span>Ticker</span></div>
                <div className="trading-account"> Trading Account ID </div>
            </div>
            <table className="table">
                <tbody>
                    <tr className="tr-id text-center">
                        <td ref={clientHeight}>&nbsp;</td>
                        {listHeaderName.map((item: any, index: number) => (
                            <th key={index} className='text-end id-posstion align-middle'>{item}</th>
                        ))}
                    </tr>
                    <tr><td style={{ padding: 0 }}></td></tr>
                   {totalAccountPortfolio.length === 0 && <tr className="tr-maintb">
                        <td></td>
                        {dataTotalAccount[0]?.holdingVolume.map((o, idx) => (<td key={idx}>{formatNumber(convertNumber(o?.ownedVolume).toString())}</td>))}
                        <td>{formatCurrency('0')}</td>
                        <td>{formatCurrency('0')}</td>
                        <td>{formatCurrency('0')}</td>
                    </tr>}
                    
                    {totalAccountPortfolio.length > 0 && dataHasOwnedVolume.map((item, index) => (
                        <tr className="tr-maintb" key={index}>
                            <td>{item.ticker}</td>

                            {item.holdingVolume.map((o: any, idx) => (<td key={idx}>{formatNumber(convertNumber(o?.ownedVolume).toString())}</td>))}

                            <td>{formatCurrency(item.totalNetPosition)}</td>
                            <td>{formatCurrency(item.totalGrossTransactions)}</td>
                            <td>{formatCurrency(item.totalPl.toString())}</td>
                        </tr>
                    ))}

                    <tr className='tr-special'>
                        <td className='td-special' ref={clientWidth}>Total Net Position</td>

                        {totalNetFollowAccountId.map((totalNetItem, index) =>
                            <td className="center" key={index}>{formatCurrency(totalNetItem)}</td>)
                        }

                        <td className="center">{formatCurrency(allTotalNet.toString())}</td>
                        <td className="center"></td>
                        <td className="center"></td>
                    </tr>

                    <tr className='tr-special'>
                        <td className='td-special'>Total Gross Transactions</td>

                        {totalGrossFollowAccountId.map((totalGrossItem, index) =>
                            <td className="center" key={index}>{formatCurrency(totalGrossItem)}</td>)
                        }

                        <td className="center"></td>
                        <td className="center">{formatCurrency(allTotalGross.toString())}</td>
                        <td className="center"></td>
                    </tr>

                    <tr className='tr-special'>
                        <td className='td-special'>Total Realized PL</td>

                        {totalPlFollowAccountId.map((totalPlItem, index) => <td className="center" key={index}>{formatCurrency(totalPlItem)}</td>)}

                        <td className="center"></td>
                        <td className="center"></td>
                        <td className="center">{formatCurrency(allTotalPL.toString())}</td>
                    </tr>
                </tbody>
            </table>
        </div>)
    }

    const _renderMainTable = () => (
        <>
            <div className="row g-0">
                <div className="col-xl-12 col-md-12 col-sm-12 position-relative">
                    {_renderTradingAccountId()}
                </div>
            </div>
        </>
    )

    return (
        <>
            {_rederMultiTraderInvest()}
            {_renderMainTable()}
        </>
    )
}

export default MultiTraderTable