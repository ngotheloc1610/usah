import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency, formatNumber, formatOrderTime } from '../../../../helper/utils';
import { IListTradeHistory } from '../../../../interfaces/order.interface';
import './OrderBookTradeHistory.css';
import { wsService } from '../../../../services/websocket-service';
interface IPropTradeOrderBook {
    symbolCode: string;
}
const OrderBookTradeHistory = (props: IPropTradeOrderBook) => {
    const { symbolCode } = props;
    const [tradeHistory, setTradeHistory] = useState<IListTradeHistory[]>([]);
    const [tradeUpdate, setTradeUpdate] = useState<IListTradeHistory[]>([]);
    const [tradeEvent, setTradeEvent] = useState([]);

    useEffect(() => {
        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setTradeHistory(res.tradeList);
        });

        const trade = wsService.getTradeEvent().subscribe(trades => {
            if (trades && trades.tradeList) {
                setTradeEvent(trades.tradeList)
            }
        })

        return () => {
            renderDataToScreen.unsubscribe();
            trade.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processTradeEvent(tradeEvent);
    }, [tradeEvent])

    const processTradeEvent = (trades: IListTradeHistory[]) => {
        trades.forEach(item => {
            if (item.tickerCode === symbolCode) {
                setTradeUpdate(prevState => [item, ...prevState])
            }
        });
    }

    const _renderUpdateData = () => {
        if (symbolCode) {
            return tradeUpdate?.map((item, index) => (<tr key={index} className="odd">
                <td>{formatOrderTime(Number(item?.executedDatetime))}</td>
                <td className="text-end">{formatNumber(item?.executedVolume)}</td>
                <td className="text-end">{formatCurrency(item?.executedPrice)}</td>
            </tr>
            ));
        }
    }

    const _renderData = useMemo(() => {
        if (symbolCode) {
            return tradeHistory?.map((item, index) => (
                <tr key={index} className="odd">
                    <td>{formatOrderTime(Number(item?.executedDatetime))}</td>
                    <td className="text-end">{formatNumber(item?.executedVolume)}</td>
                    <td className="text-end">{formatCurrency(item?.executedPrice)}</td>
                </tr>
            ));
        }
    }, [tradeHistory, symbolCode])

    return <div className="card card-trade-history">
        <div className="card-header">
            <h6 className="card-title mb-0"><i className="icon bi bi-clock me-1"></i> Trade History</h6>
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <div id="table_trade_history_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="dataTables_scroll">
                                <div className="dataTables_scrollHead"
                                    style={{ overflow: "hidden", position: "relative", border: "0px", width: "100%" }}>
                                    <div className="dataTables_scrollHeadInner"
                                        style={{
                                            position: "relative",
                                            overflow: "auto",
                                            width: "100%",
                                            maxHeight: "449.812px"
                                        }}>
                                        <table width="100%" className="table table-sm table-borderless table-hover mb-0 dataTable no-footer"

                                            style={{ boxSizing: "content-box" }}>
                                            <thead>
                                                <tr>
                                                    <th className="sorting_disabled">Datetime</th>
                                                    <th className="text-end sorting_disabled">Vol</th>
                                                    <th className="text-end sorting_disabled">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {_renderUpdateData()}
                                                {_renderData}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-5">
                        </div>
                        <div className="col-sm-12 col-md-7">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
export default React.memo(OrderBookTradeHistory);