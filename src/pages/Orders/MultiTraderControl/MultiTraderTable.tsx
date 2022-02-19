import "./MultiTrader.scss"
import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { LIST_TICKER_INFO, OBJ_AUTHEN, SOCKET_CONNECTED } from '../../../constants/general.constant';
import { ITickerDetail } from "../../../interfaces/ticker.interface";

const listSymbolId = ['200001', '200002', '200003', '200004', '200006', '200007', '200008', '200009']

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
        let listTrading: any = []
        let itemData: any = []
        const listId = [...listSymbolId, 'Total Net Position', 'Total Gross Transactions', 'Total Realized P/L']
        listTicker.map((item: any) => {
            itemData = {
                symbolId: item.symbolId,
                accountId: accountId,
                symbolCode: item.ticker
            }
            listTrading.push(itemData)
        })

        return (<div className="div_maintb">
            <table className="table">
                <tbody>
                    {/* <tr>
                        <th rowSpan={2} className=" fz-16 d-flex justify-content-center align-items-center">Ticker</th>

                        <th className=" fz-16">Trading Account Id</th>
                    </tr> */}

                        {/* <th className="text-center">Trading Account ID</th> */}

                    <tr className="tr-id text-center">
                        <th rowSpan={2}> Ticker </th>
                        {listId.map((item: any, index: number) => (
                            <th key={index} className='text-end'>{item}</th>
                            ))}
                    </tr>
                    <tr><td style={{padding:0}}></td></tr>
                    {listTrading.map((item: any, index: number) => (
                        <tr className="tr-maintb" key={index}>
                            <td>{item.symbolCode}</td>
                            <td>{getHoldingvolume(item.symbolCode)}</td>
                            <td>2000</td>
                            <td>10000</td>
                            <td>300</td>
                            <td>100</td>
                            <td>2000</td>
                            <td> 800</td>
                            <td>1545</td>
                            <td>1545</td>
                            <td>1545</td>
                            <td>1545</td>
                        </tr>
                    ))}
                    <tr className='tr-special'>
                        <td className='td-special'>Total Net Position</td>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
                    </tr>
                    <tr className='tr-special'>
                        <td className='td-special'>Total Gross Transactions</td>
                        <td>300</td>
                        <td>100</td>
                        <td>2000</td>
                        <td> 800</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
                    </tr>
                    <tr className='tr-special' >
                        <td className='td-special'>Total Realized P/L</td>
                        <td>300</td>
                        <td>100</td>
                        <td>2000</td>
                        <td> 800</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1545</td>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
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
                {/* <div className="col-xl-3 col-md-3 col-sm-3">
                    <div className="total">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th className="fw-bold">Total Net Position</th>
                                    <th className="fw-bold">Total Gross Transactions</th>
                                    <th className="fw-bold">Total Realized P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div> */}
            </div>
            {/* <div className="row g-0">
                <div className="col-xl-12 col-md-12 col-sm-12 position-relative">

                    <div className="total-row">
                        <table className="table table-hover">
                            <tbody>
                                <tr>
                                    <td className="fw-bold">Total Net Position</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Total Gross Transactions</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Total Realized P/L</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div> */}

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