import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency, formatNumber, formatOrderTime } from '../../../../helper/utils';
import { IListTradeHistory } from '../../../../interfaces/order.interface';
import './OrderBookTradeHistory.css';
import { IStyleBidsAsk } from '../../../../interfaces/order.interface';
import { wsService } from '../../../../services/websocket-service';
interface IPropTradeOrderBook {
    symbolCode: string;
    styleListBidsAsk: IStyleBidsAsk;
}
const OrderBookTradeHistory = (props: IPropTradeOrderBook) => {
    const { symbolCode, styleListBidsAsk } = props;
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
            return tradeUpdate?.map((item, index) => (<tr key={index} className="odd p-10px table-trade-history">
                <td className='w-60'>{formatOrderTime(Number(item?.executedDatetime))}</td>
                <td className="text-end w-20">{formatNumber(item?.executedVolume)}</td>
                <td className="text-end w-20">{formatCurrency(item?.executedPrice)}</td>
            </tr>
        ))}
    }

    const _renderData = useMemo(() => {
        if (symbolCode) {
            return tradeHistory?.map((item, index) => (
                <tr key={index} className="odd p-10px table-trade-history">
                    <td className='w-60'>{formatOrderTime(Number(item?.executedDatetime))}</td>
                    <td className="text-end w-20">{formatNumber(item?.executedVolume)}</td>
                    <td className="text-end w-20">{formatCurrency(item?.executedPrice)}</td>
                    </tr>
            ));
        }
    }, [tradeHistory, symbolCode])

    const getTableMaxHeight = () => {
        const isLayoutColums = styleListBidsAsk.columns || styleListBidsAsk.columnsGap;
        const isLayoutGrid = styleListBidsAsk.grid;
        const isLayoutSpreadSheet = styleListBidsAsk.earmarkSpreadSheet || styleListBidsAsk.spreadsheet;
        if (isLayoutGrid) return '995px'
        if (isLayoutColums) return '964px'
        if (isLayoutSpreadSheet) return '532px'
    }

    return <div className="card card-trade-history">
        <div className="card-header">
            <h6 className="card-title mb-0"><i className="icon bi bi-clock me-1"></i> Trade History</h6>
        </div>
        <div className="card-body p-0">
                <div id="table_trade_history_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="dataTables_scroll">
                                <div className="dataTables_scrollHead"
                                    style={{position: "relative", border: "0px", width: "100%" }}>
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "100%",
                                        }}
                                    >
                                        <table width="100%" className="table table-sm table-borderless table-hover mb-0 dataTable no-footer"

                                            style={{ boxSizing: "content-box" }}>
                                            <thead className='table-trade-history'>
                                                <tr>
                                                    <th className="sorting_disabled w-60">Datetime</th>
                                                    <th className="text-end sorting_disabled w-20">Vol</th>
                                                    <th className="text-end sorting_disabled w-20">
                                                        <span className='pe-3 fs-075rem'>Price</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className='d-block table-trade-history' style={{height: getTableMaxHeight()}}>
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
}
export default React.memo(OrderBookTradeHistory);