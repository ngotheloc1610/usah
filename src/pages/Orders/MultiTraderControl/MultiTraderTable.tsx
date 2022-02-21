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

    const getTotalNetPositionRow = (ticker: string) => {
        const symbolId = listTicker.find(item => item.ticker === ticker)?.symbolId
        return totalAcount.reduce((acc, crr) => {
            const avgPrice = crr.find(item => Number(item.symbolCode) === symbolId)?.avgPrice ?? 0
            const ownedVolume = crr.find(item => Number(item.symbolCode) === symbolId)?.ownedVolume ?? 0
            return acc + Number(avgPrice) * Number(ownedVolume)
        }, 0)
    }

    const getTotalGrossTransactionsRow = (ticker: string) => {
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
            const dataItem: ITradingAccountVertical = {
                ticker: item.ticker,
                ownVolumeId1: getHoldingvolume(200001, item.ticker),
                ownVolumeId2: getHoldingvolume(200002, item.ticker),
                ownVolumeId3: getHoldingvolume(200003, item.ticker),
                ownVolumeId4: getHoldingvolume(200004, item.ticker),
                ownVolumeId5: getHoldingvolume(200005, item.ticker),
                ownVolumeId6: getHoldingvolume(200006, item.ticker),
                ownVolumeId7: getHoldingvolume(200007, item.ticker),
                ownVolumeId8: getHoldingvolume(200008, item.ticker),
                totalNetPosition: formatCurrency(getTotalNetPositionRow(item.ticker).toFixed(0)),
                totalGrossTransactions: formatCurrency(getTotalGrossTransactionsRow(item.ticker).toString()),
                totalPl: 0
            }
            fakeListData.push(dataItem)
        })
        setFakeData(fakeListData)
    }

    const getTotalNetColumn = (accountId: number) => {
        for (var i = 0; i < totalAcount.length; i++) {
            const account = totalAcount.find((item, index) => (index + 1) === accountId)
            return account && account.reduce((acc, crr) => (acc + Number(crr.avgPrice) * Number(crr.ownedVolume)), 0)?.toString()
        }
    }

    const getAllTotalNet = () => {
        return Number(getTotalNetColumn(1)) + Number(getTotalNetColumn(2)) + Number(getTotalNetColumn(3)) + Number(getTotalNetColumn(4))
            + Number(getTotalNetColumn(5)) + Number(getTotalNetColumn(6)) + Number(getTotalNetColumn(7)) + Number(getTotalNetColumn(8))
    }

    const getTotalGross = (accountId: number): number => {
        return dataTradeHistory.reduce((acc, crr) => acc + Number(crr.matchedValue), 0)
    }

    const getAlltotalGross = () => {
        return getTotalGross(200001) * 8
    }

    const _renderColumnTradingAccount = () => {
        const fakeColumnTotalNet: ITotalNetFollowAccountId[] = [];
        const dataItemTotalNet = {
            title: 'Total Net Position',
            totalNet1: formatCurrency(getTotalNetColumn(1) || '0'),
            totalNet2: formatCurrency(getTotalNetColumn(2) || '0'),
            totalNet3: formatCurrency(getTotalNetColumn(3) || '0'),
            totalNet4: formatCurrency(getTotalNetColumn(4) || '0'),
            totalNet5: formatCurrency(getTotalNetColumn(5) || '0'),
            totalNet6: formatCurrency(getTotalNetColumn(6) || '0'),
            totalNet7: formatCurrency(getTotalNetColumn(7) || '0'),
            totalNet8: formatCurrency(getTotalNetColumn(8) || '0'),
            totalNetRow: formatCurrency(getAllTotalNet().toString())
        }

        fakeColumnTotalNet.push(dataItemTotalNet);
        setFakeColumnTotalNet(fakeColumnTotalNet);

        const fakeColumnTotalGross: ITotalGrossFollowAccountId[] = [];
        const dataItemTotalGross = {
            title: 'Total Gross Transactions',
            totalGross1: formatCurrency(getTotalGross(200001).toString()),
            totalGross2: formatCurrency(getTotalGross(200001).toString()),
            totalGross3: formatCurrency(getTotalGross(200001).toString()),
            totalGross4: formatCurrency(getTotalGross(200001).toString()),
            totalGross5: formatCurrency(getTotalGross(200001).toString()),
            totalGross6: formatCurrency(getTotalGross(200001).toString()),
            totalGross7: formatCurrency(getTotalGross(200001).toString()),
            totalGross8: formatCurrency(getTotalGross(200001).toString()),
            totalGrossRow: formatCurrency(getAlltotalGross().toString())
        }
        fakeColumnTotalGross.push(dataItemTotalGross)
        setFakeColumnTotalGross(fakeColumnTotalGross)

        const fakeColumnTotalPl: ITotalPLFollowAccountId[] = [];
        const dataItemTotalPl = {
            title: 'Total Realized P/L',
            totalPl: '0',
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
                    {fakeData.map((item: ITradingAccountVertical, index: number) => (
                        <tr className="tr-maintb" key={index}>
                            <td>{item.ticker}</td>
                            <td>{item.ownVolumeId1}</td>
                            <td>{item.ownVolumeId2}</td>
                            <td>{item.ownVolumeId3}</td>
                            <td>{item.ownVolumeId4}</td>
                            <td>{item.ownVolumeId5}</td>
                            <td>{item.ownVolumeId6}</td>
                            <td>{item.ownVolumeId7}</td>
                            <td>{item.ownVolumeId8}</td>
                            <td>{item.totalNetPosition}</td>
                            <td>{item.totalGrossTransactions}</td>
                            <td>{item.totalPl}</td>
                        </tr>
                    ))}

                    {fakeColumnTotalNet.map((item: any, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>
                            <td className="center">{item.totalNet1}</td>
                            <td className="center">{item.totalNet2}</td>
                            <td className="center">{item.totalNet3}</td>
                            <td className="center">{item.totalNet4}</td>
                            <td className="center">{item.totalNet5}</td>
                            <td className="center">{item.totalNet6}</td>
                            <td className="center">{item.totalNet7}</td>
                            <td className="center">{item.totalNet8}</td>
                            <td className="center">{item.totalNetRow}</td>
                            <td className="center"></td>
                            <td className="center"></td>
                        </tr>
                    ))}
                    {fakeColumnTotalGross.map((item: any, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>
                            <td className="center">{item.totalGross1}</td>
                            <td className="center">{item.totalGross2}</td>
                            <td className="center">{item.totalGross3}</td>
                            <td className="center">{item.totalGross4}</td>
                            <td className="center">{item.totalGross5}</td>
                            <td className="center">{item.totalGross6}</td>
                            <td className="center">{item.totalGross7}</td>
                            <td className="center">{item.totalGross8}</td>
                            <td className="center"></td>
                            <td className="center">{item.totalGrossRow}</td>
                            <td className="center"></td>
                        </tr>
                    ))}
                    {fakeColumnTotalPl.map((item: any, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
                            <td className="center">{item.totalPl}</td>
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