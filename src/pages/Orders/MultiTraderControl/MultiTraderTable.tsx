import "./MultiTrader.scss"
import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { FROM_DATE_TIME, LIST_TICKER_INFO, OBJ_AUTHEN, SOCKET_CONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { ITickerDetail } from "../../../interfaces/ticker.interface";
import { MOCDATA_LIST_ID } from "../../../mocks";
import { convertDatetoTimeStamp, formatCurrency } from "../../../helper/utils";
import { IListPortfolio, IPortfolioAccountId, ITotalGrossFollowAccountId, ITotalNetFollowAccountId, ITotalPLFollowAccountId, ITradingAccountVertical } from "../../../interfaces/order.interface";

const MultiTraderTable = () => {
    const [dataTradeHistory, setDataTradeHistory] = useState<any>([]);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [accountId, setAccountId] = useState('');
    const [listTicker, setListTicker] = useState<ITickerDetail[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || "[{}]"));
    const [listTrading, setListTrading] = useState([]);
    const [fakeData, setFakeData] = useState<ITradingAccountVertical[]>([]);
    const [totalNetFollowAccountId, setTotalNetFollowAccountId] = useState<ITotalNetFollowAccountId[]>([]);
    const [totalGrossFollowAccountId, setTotalGrossFollowAccountId] = useState<ITotalGrossFollowAccountId[]>([]);
    const [totalPlFollowAccountId, setTotalPlFollowAccountId] = useState<ITotalPLFollowAccountId[]>([]);
    const listId = [...MOCDATA_LIST_ID, 'Total Net Position', 'Total Gross Transactions', 'Total Realized PL'];
    const [totalAccountPortfolio, setTotalAccountPortfolio] = useState<IListPortfolio[][]>([]);
    const [allTotalNet, setAllTotalNet] = useState('');
    const [allTotalGross, setAllTotalGross] = useState('');
    const [allTotalPL, setAllTotalPL] = useState('');

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                MOCDATA_LIST_ID.forEach(item => {
                    sendMessageMultiTrader(item)
                })
                sendTradeHistoryReq();
            }
        });

        const isExist = (arr, itemNeedCheck) => arr.indexOf(itemNeedCheck) > -1;

        const totalAccountPortfolio: IListPortfolio[][] = []

        const renderDataToScreen = wsService.getAccountPortfolio().subscribe(res => {
            if (!isExist(totalAccountPortfolio, JSON.stringify(res.accountPortfolioList))) {
                totalAccountPortfolio.push(res.accountPortfolioList)
            };
            setTotalAccountPortfolio(totalAccountPortfolio)
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
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(res => {
            if (res) {
                const obj = JSON.parse(res);
                accountId = obj.account_id;
                buildMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                buildMessage(accountId);
                return;
            }
        });
    }


    const sendMessageMultiTrader = (accountId: string) => {
        setAccountId(accountId)
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            accountPortfolioRequest.setAccountId(Number(accountId));
            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_PORTFOLIO_REQ);
            rpcMsg.setPayloadData(accountPortfolioRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const _rederMultiTraderInvest = () => {

        return (
            <div className="border p-3 mb-3">
                <div className="row">
                    <div className="col-md-2 text-center">
                        <div>Total Accounts</div>
                        <div className="fs-5 fw-bold">{MOCDATA_LIST_ID.length}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Net Position</div>
                        <div className="fs-5 fw-bold">{allTotalNet}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Gross Transactions</div>
                        <div className="fs-5 fw-bold">{allTotalGross}</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Realized PL</div>
                        <div className="fs-5 fw-bold text-success">{allTotalPL}</div>
                    </div>
                    <div className="col-md-4 order-0 order-md-4">
                        <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                    </div>
                </div>
            </div>
        )
    }

    const getHoldingvolume = (accountId: number, symbolCode: string) => {
        const symbolId = listTicker.find(item => item.ticker === symbolCode)?.symbolId.toString()
        for (var i = 0; i < listId.length; i++) {
            if (accountId.toString() === listId[i]) {
                if (totalAccountPortfolio[i] !== undefined) {
                    return totalAccountPortfolio[i].find(item => item.symbolCode === symbolId && item.accountId === accountId)?.ownedVolume
                }
                return ''
            }
        }
    }

    const getTotalNetFollowSymbolCode = (ticker: string) => {
        const symbolId = listTicker.find(item => item.ticker === ticker)?.symbolId
        return totalAccountPortfolio.reduce((acc, crr) => {
            const avgPrice = crr.find(item => Number(item.symbolCode) === symbolId)?.avgPrice ?? 0
            const ownedVolume = crr.find(item => Number(item.symbolCode) === symbolId)?.ownedVolume ?? 0
            return acc + Number(avgPrice) * Number(ownedVolume)
        }, 0)
    }

    const getTotalGrossFollowSymbolCode = (ticker: string) => {
        const symbolId = listTicker.find(item => item.ticker === ticker)?.symbolId
        const tradeHistoryFilter = dataTradeHistory.filter(item => Number(item.tickerCode) === symbolId)
        return tradeHistoryFilter.reduce((acc, crr) => {
            return acc + Number(crr.matchedValue)
        }, 0);
    }

    useEffect(() => {
        _renderRowTradingAccount();
        _renderColumnTradingAccount()
    }, [dataTradeHistory])

    const _renderRowTradingAccount = () => {
        const listDataFollowSymbolCode: ITradingAccountVertical[] = []
        listTicker.map(item => {
            const ownVolumeAccountId = MOCDATA_LIST_ID.map(accountId => {
                return getHoldingvolume(Number(accountId), item.ticker)
            })
            const dataItem: ITradingAccountVertical = {
                ticker: item.ticker,
                ownVolumeAccountId,
                totalNetPosition: formatCurrency(getTotalNetFollowSymbolCode(item.ticker).toFixed(0)),
                totalGrossTransactions: formatCurrency(getTotalGrossFollowSymbolCode(item.ticker).toString()),
                totalPl: 0
            }
            if (dataItem.ownVolumeAccountId.some(item => item !== undefined)) {
                listDataFollowSymbolCode.push(dataItem)
            }
        })
        setFakeData(listDataFollowSymbolCode)
    }

    const getTotalNetFollowAccountId = (accountId: number) => {
        for (var i = 0; i < totalAccountPortfolio.length; i++) {
            const account = totalAccountPortfolio.find((item, index) => (index + 1) === accountId)
            return account && account.reduce((acc, crr) => (acc + Number(crr.avgPrice) * Number(crr.ownedVolume)), 0)?.toString()
        }
    }

    const getAllTotalNet = () => {
        return Number(getTotalNetFollowAccountId(1)) + Number(getTotalNetFollowAccountId(2)) + Number(getTotalNetFollowAccountId(3)) + Number(getTotalNetFollowAccountId(4))
            + Number(getTotalNetFollowAccountId(5)) + Number(getTotalNetFollowAccountId(6)) + Number(getTotalNetFollowAccountId(7)) + Number(getTotalNetFollowAccountId(8))
    }

    const getTotalGross = (accountId: number): number => {
        return dataTradeHistory.reduce((acc, crr) => acc + Number(crr.matchedValue), 0)
    }

    const getAlltotalGross = () => {
        return getTotalGross(200001)
    }

    const _renderColumnTradingAccount = () => {
        const totalNetPosition: ITotalNetFollowAccountId[] = [];
        const totalNetFollowAccountId = MOCDATA_LIST_ID.map((accountId, index) => {
            return formatCurrency(getTotalNetFollowAccountId(index + 1) || '0');
        });
        const dataItemTotalNet = {
            title: 'Total Net Position',
            totalNetFollowAccountId,
            totalNetRow: formatCurrency(getAllTotalNet().toString())
        };
        setAllTotalNet(dataItemTotalNet.totalNetRow)
        totalNetPosition.push(dataItemTotalNet);
        setTotalNetFollowAccountId(totalNetPosition);

        const totalGrossTransactions: ITotalGrossFollowAccountId[] = [];
        const totalGrossFollowAccountId = MOCDATA_LIST_ID.map((accountId, index) => {
            return formatCurrency(getTotalGross(Number(accountId)).toString());
        });
        const dataItemTotalGross = {
            title: 'Total Gross Transactions',
            totalGrossFollowAccountId,
            totalGrossRow: formatCurrency(getAlltotalGross().toString())
        }
        setAllTotalGross(dataItemTotalGross.totalGrossRow)
        totalGrossTransactions.push(dataItemTotalGross)
        setTotalGrossFollowAccountId(totalGrossTransactions)

        const totalRealizedPl: ITotalPLFollowAccountId[] = [];
        const totalPlFollowAccountId = MOCDATA_LIST_ID.map((accountId, index) => {
            return formatCurrency('0');
        });
        const dataItemTotalPl = {
            title: 'Total Realized PL',
            totalPlFollowAccountId,
            totalPlRow: formatCurrency('0')
        }
        setAllTotalPL(dataItemTotalPl.totalPlRow)
        totalRealizedPl.push(dataItemTotalPl)
        setTotalPlFollowAccountId(totalRealizedPl)
    }

    const _renderTradingAccountId = () => {

        return (<div className="div_maintb">
            <div>
                <div className="ticker"> Ticker </div>
                <div className="trading-account"> Trading Account ID </div>
            </div>
            <table className="table">
                <tbody>
                    <tr className="tr-id text-center">
                        <td>&nbsp;</td>
                        {listId.map((item: string, index: number) => (
                            <th key={index} className='text-end id-posstion align-middle'>{item}</th>
                        ))}
                    </tr>
                    <tr><td style={{ padding: 0 }}></td></tr>
                    {fakeData.map((item, index) => (
                        <tr className="tr-maintb" key={index}>
                            <td>{item.ticker}</td>

                            {item.ownVolumeAccountId.map((ownVolumeItem, index) => <td key={index}>{ownVolumeItem}</td>)}

                            <td>{item.totalNetPosition}</td>
                            <td>{item.totalGrossTransactions}</td>
                            <td>{item.totalPl}</td>
                        </tr>
                    ))}

                    {totalNetFollowAccountId.map((item: ITotalNetFollowAccountId, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>

                            {item.totalNetFollowAccountId.map((totalNetItem, index) =>
                                <td className="center" key={index}>{totalNetItem}</td>)
                            }

                            <td className="center">{item.totalNetRow}</td>
                            <td className="center"></td>
                            <td className="center"></td>
                        </tr>
                    ))}

                    {totalGrossFollowAccountId.map((item: ITotalGrossFollowAccountId, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>

                            {item.totalGrossFollowAccountId.map((totalGrossItem, index) =>
                                <td className="center" key={index}>{totalGrossItem}</td>)
                            }

                            <td className="center"></td>
                            <td className="center">{item.totalGrossRow}</td>
                            <td className="center"></td>
                        </tr>
                    ))}

                    {totalPlFollowAccountId.map((item: ITotalPLFollowAccountId, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>

                            {item.totalPlFollowAccountId.map((totalPlItem, index) => <td className="center" key={index}>{totalPlItem}</td>)}

                            <td className="center"></td>
                            <td className="center"></td>
                            <td className="center">{item.totalPlRow}</td>
                        </tr>
                    ))}
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