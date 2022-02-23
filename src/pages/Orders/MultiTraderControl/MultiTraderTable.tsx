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
import { MOCDATA_LIST_ID, PORTFOLIO_ACCOUNT_ID_201, PORTFOLIO_ACCOUNT_ID_202, PORTFOLIO_ACCOUNT_ID_203, PORTFOLIO_ACCOUNT_ID_204, PORTFOLIO_ACCOUNT_ID_205, PORTFOLIO_ACCOUNT_ID_206, PORTFOLIO_ACCOUNT_ID_207, PORTFOLIO_ACCOUNT_ID_208 } from "../../../mocks";
import { convertDatetoTimeStamp, formatCurrency } from "../../../helper/utils";
import { IPortfolioAccountId, ITotalGrossFollowAccountId, ITotalNetFollowAccountId, ITotalPLFollowAccountId, ITradingAccountVertical } from "../../../interfaces/order.interface";

const MultiTraderTable = () => {
    const [accountPortfolio, setAccountPortfolio] = useState([]);
    const [dataTradeHistory, setDataTradeHistory] = useState<any>([]);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([])
    const [accountId, setAccountId] = useState('')
    const [listTicker, setListTicker] = useState<ITickerDetail[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || "[{}]"))
    const [listTrading, setListTrading] = useState([])
    const [fakeData, setFakeData] = useState<ITradingAccountVertical[]>([])
    const [fakeColumnTotalNet, setFakeColumnTotalNet] = useState<ITotalNetFollowAccountId[]>([])
    const [fakeColumnTotalGross, setFakeColumnTotalGross] = useState<ITotalGrossFollowAccountId[]>([])
    const [fakeColumnTotalPl, setFakeColumnTotalPl] = useState<ITotalPLFollowAccountId[]>([])
    const listId = [...MOCDATA_LIST_ID, 'Total Net Position', 'Total Gross Transactions', 'Total Realized P/L']
    const totalAcount = [PORTFOLIO_ACCOUNT_ID_201, PORTFOLIO_ACCOUNT_ID_202, PORTFOLIO_ACCOUNT_ID_203, PORTFOLIO_ACCOUNT_ID_204, PORTFOLIO_ACCOUNT_ID_205, PORTFOLIO_ACCOUNT_ID_206, PORTFOLIO_ACCOUNT_ID_207, PORTFOLIO_ACCOUNT_ID_208,]

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendAccountPortfolio();
                sendTradeHistoryReq();
            }
        });

        const renderDataToScreen = wsService.getAccountPortfolio().subscribe(res => {
            setAccountPortfolio(res.accountPortfolioList)
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

    const sendAccountPortfolio = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessageMultiTrader(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessageMultiTrader(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                buildMessageMultiTrader(accountId);
                return;
            }
        });
    }

    const buildMessageMultiTrader = (accountId: string) => {
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
                        <div className="fs-5 fw-bold">8</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Net Position</div>
                        <div className="fs-5 fw-bold">1206,584.00</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Gross Transactions</div>
                        <div className="fs-5 fw-bold">1,946,227.00</div>
                    </div>
                    <div className="col-md-2 text-center">
                        <div>Total Realized P/L</div>
                        <div className="fs-5 fw-bold text-success">66,848.00</div>
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
                return totalAcount[i].find(item => item.symbolCode === symbolId && item.accountId === accountId)?.ownedVolume
            }
        }
    }

    const getTotalNetFollowSymbolCode = (ticker: string) => {
        const symbolId = listTicker.find(item => item.ticker === ticker)?.symbolId
        return totalAcount.reduce((acc, crr) => {
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
        const fakeListData: ITradingAccountVertical[] = []
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
            fakeListData.push(dataItem)
        })
        setFakeData(fakeListData)
    }

    const getTotalNetFollowAccountId = (accountId: number) => {
        for (var i = 0; i < totalAcount.length; i++) {
            const account = totalAcount.find((item, index) => (index + 1) === accountId)
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
        const fakeColumnTotalNet: ITotalNetFollowAccountId[] = [];
        const totalNetFollowAccountId = MOCDATA_LIST_ID.map((accountId, index) => {
            return formatCurrency(getTotalNetFollowAccountId(index + 1) || '0');
        });
        const dataItemTotalNet = {
            title: 'Total Net Position',
            totalNetFollowAccountId,
            totalNetRow: formatCurrency(getAllTotalNet().toString())
        };
        fakeColumnTotalNet.push(dataItemTotalNet);
        setFakeColumnTotalNet(fakeColumnTotalNet);

        const fakeColumnTotalGross: ITotalGrossFollowAccountId[] = [];
        const totalGrossFollowAccountId = MOCDATA_LIST_ID.map((accountId, index) => {
            return formatCurrency(getTotalGross(Number(accountId)).toString());
        });
        const dataItemTotalGross = {
            title: 'Total Gross Transactions',
            totalGrossFollowAccountId,
            totalGrossRow: formatCurrency(getAlltotalGross().toString())
        }
        fakeColumnTotalGross.push(dataItemTotalGross)
        setFakeColumnTotalGross(fakeColumnTotalGross)

        const fakeColumnTotalPl: ITotalPLFollowAccountId[] = [];
        const totalPl = MOCDATA_LIST_ID.map((accountId, index) => {
            return '0';
        });
        const dataItemTotalPl = {
            title: 'Total Realized P/L',
            totalPl,
        }
        fakeColumnTotalPl.push(dataItemTotalPl)
        setFakeColumnTotalPl(fakeColumnTotalPl)
    }

    const _renderTradingAccountId = () => {

        return (<div className="div_maintb">
            <div>
                <div className="ticker"> Ticker </div>
                <div className="trading-account"> Trading Account Id </div>
            </div>
            <table className="table">
                <tbody>
                    <tr className="tr-id text-center">
                        <td>&nbsp;</td>
                        {listId.map((item: string, index: number) => (
                            <th key={index} className='text-end id-posstion'>{item}</th>
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

                    {fakeColumnTotalNet.map((item: ITotalNetFollowAccountId, index: number) => (
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

                    {fakeColumnTotalGross.map((item: ITotalGrossFollowAccountId, index: number) => (
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

                    {fakeColumnTotalPl.map((item: ITotalPLFollowAccountId, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>

                            {item.totalPl.map((totalPlItem, index) => <td className="center" key={index}>{totalPlItem}</td>)}

                            <td className="center"></td>
                            <td className="center"></td>
                            <td className="center">{item.totalPl}</td>
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