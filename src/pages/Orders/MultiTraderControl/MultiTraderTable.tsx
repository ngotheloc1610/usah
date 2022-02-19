import "./MultiTrader.scss"
import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { LIST_TICKER_INFO, OBJ_AUTHEN, SOCKET_CONNECTED } from '../../../constants/general.constant';
import { ITickerDetail } from "../../../interfaces/ticker.interface";
import { MOCDATA_LIST_ID, MOCKDATA_FOLLOW_TRADING_ACCOUNT_ID, MOCKDATA_MULTITRADER } from "../../../mocks";

const MultiTraderTable = () => {
    const [accountPortfolio, setAccountPortfolio] = useState<any>([]);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([])
    const [accountId, setAccountId] = useState('')
    const [listTicker, setListTicker] = useState<ITickerDetail[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || "[{}]"))
    const [listTrading, setListTrading] = useState([])


    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendAccountPortfolio();
            }
        });

        const renderDataToScreen = wsService.getAccountPortfolio().subscribe(res => {
            console.log(21, res.accountPortfolioList);

            setAccountPortfolio(res.accountPortfolioList)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
        }
    }, [])

    const sendAccountPortfolio = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
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

    const buildMessage = (accountId: string) => {
        setAccountId(accountId)
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            accountPortfolioRequest.setAccountId(Number(accountId));
            const rpcModel: any = rspb;
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

    const getHoldingvolume = (symbolCode: string) => {
        const id: any = listTicker.find((item: any) => item.ticker === symbolCode)?.symbolId
        return accountPortfolio.find((item: any) => item.symbolCode === id.toString())?.ownedVolume
    }

    const _renderTradingAccountId = () => {
        const listId = [...MOCDATA_LIST_ID, 'Total Net Position', 'Total Gross Transactions', 'Total Realized P/L']
        
        return (<div className="div_maintb">
            <div>
                <div className="ticker"> Ticker </div>
                <div className="trading-account"> Trading Account Id </div>

            </div>
            <table className="table">
                <tbody>
                    <tr className="tr-id text-center">
                        <td>&nbsp;</td>
                        {listId.map((item, index: number) => (
                            <th key={index} className='text-end id-posstion'>{item}</th>
                        ))}
                    </tr>
                    <tr><td style={{ padding: 0 }}></td></tr>
                    {MOCKDATA_MULTITRADER.map((item: any, index: number) => (
                        <tr className="tr-maintb" key={index}>
                            <td>{item.ticker}</td>
                            <td>{item.id1}</td>
                            <td>{item.id2}</td>
                            <td>{item.id3}</td>
                            <td>{item.id4}</td>
                            <td>{item.id5}</td>
                            <td>{item.id6}</td>
                            <td>{item.id7}</td>
                            <td>{item.id8}</td>
                            <td>{item.totalNet}</td>
                            <td>{item.totalGross}</td>
                            <td>{item.totalPl}</td>
                        </tr>
                    ))}

                    {MOCKDATA_FOLLOW_TRADING_ACCOUNT_ID.map((item: any, index: number) => (
                        <tr className='tr-special' key={index}>
                            <td className='td-special'>{item.title}</td>
                            <td className="center">{item.id1}</td>
                            <td className="center">{item.id2}</td>
                            <td className="center">{item.id3}</td>
                            <td className="center">{item.id4}</td>
                            <td className="center">{item.id5}</td>
                            <td className="center">{item.id6}</td>
                            <td className="center">{item.id7}</td>
                            <td className="center">{item.id8}</td>
                            <td className="center">{item.id9}</td>
                            <td className="center">{item.id10}</td>
                            <td className="center">{item.id11}</td>
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