import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, AutoSizer, CellMeasurerCache, CellMeasurer, Column } from 'react-virtualized';

import { wsService } from '../../../../services/websocket-service';

import { formatCurrency, formatNumber, formatOrderTime } from '../../../../helper/utils';
import { IListTradeHistory } from '../../../../interfaces/order.interface';

import './OrderBookTradeHistory.css';

interface IPropTradeOrderBook {
    symbolCode: string;
}
const OrderBookTradeHistory = (props: IPropTradeOrderBook) => {
    const { symbolCode } = props;
    const [tradeUpdate, setTradeUpdate] = useState<IListTradeHistory[]>([]);
    const [tradeEvent, setTradeEvent] = useState([]);
    const tableBodyRef: any = useRef();
    const cache = useRef(new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 30
    }))

    useEffect(() => {
        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            if (res && res.tradeList) {
                const tradeSort = res.tradeList.sort((a: IListTradeHistory, b: IListTradeHistory) => b.executedDatetime.localeCompare(a.executedDatetime));
                setTradeUpdate(tradeSort);
            }
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

    useEffect(() => {
        setTradeUpdate([])
    }, [symbolCode])

    const processTradeEvent = (trades: IListTradeHistory[]) => {
        trades.forEach(item => {
            if (item.tickerCode === symbolCode) {
                setTradeUpdate(prevState => [item, ...prevState])
            }
        });
    }

    const _renderTradeData = () => {
        return <AutoSizer onResize={() => {
            cache.current.clearAll();
        }}>{({ width, height }) => {
            let responseWidth = width
            // Fix responsive when resize, we set default width to able to see full column
            if (width < 322) {
                responseWidth = 322
            }
            return <Table
                width={responseWidth}
                height={height}
                headerHeight={30}
                rowHeight={30}
                rowCount={tradeUpdate.length}
                deferredMeasurementCache={cache.current}
                rowGetter={({ index }) => tradeUpdate[index]}
                rowClassName="trade-data-row"
            >
                <Column
                    dataKey="executedDatetime"
                    minWidth={185}
                    width={185}
                    flexGrow={0.5}
                    headerRenderer={() =>
                        <span className='theme-header'>Datetime</span>
                    }
                    cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                        <CellMeasurer
                            cache={cache.current}
                            columnIndex={0}
                            key={dataKey}
                            parent={parent}
                            rowIndex={rowIndex}>
                            <span>{formatOrderTime(Number(cellData))}</span>

                        </CellMeasurer>
                    }
                />
                <Column
                    dataKey="executedVolume"
                    minWidth={45}
                    width={45}
                    flexGrow={0.3}
                    headerRenderer={() =>
                        <span className='theme-header'>Vol</span>
                    }
                    cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                        <CellMeasurer
                            cache={cache.current}
                            columnIndex={0}
                            key={dataKey}
                            parent={parent}
                            rowIndex={rowIndex}>
                            <span title={formatNumber(cellData)}>{formatNumber(cellData)}</span>
                        </CellMeasurer>
                    }
                />
                <Column
                    dataKey="executedPrice"
                    minWidth={48}
                    width={48}
                    flexGrow={0.3}
                    headerRenderer={() =>
                        <span className='theme-header'>Price</span>
                    }
                    cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                        <CellMeasurer
                            cache={cache.current}
                            columnIndex={0}
                            key={dataKey}
                            parent={parent}
                            rowIndex={rowIndex}>
                            <span title={formatCurrency(cellData)}>{formatCurrency(cellData)}</span>
                        </CellMeasurer>
                    }
                />
            </Table>
        }}</AutoSizer>
    }

    const getRowHeight = useMemo(() => {
        if (tradeUpdate.length === 0) {
            return 30
        } else {
            return 530
        }
    }, [tradeUpdate]);

    // This function check to show scrollbar X if screen is small
    const isMobileScreen = () => {
        const tableBody = tableBodyRef.current
        if (tableBody) {
            return tableBody.offsetWidth < 322
        }
        return false
    }


    return <div className="card card-trade-history">
        <div className="card-header">
            <h6 className="card-title mb-0"><i className="icon bi bi-clock me-1"></i> Trade History</h6>
        </div>
        <div ref={tableBodyRef} className="card-body p-0" style={{ overflow: 'hidden', overflowX: `${getRowHeight === 30 || !isMobileScreen() ? 'hidden' : 'scroll'}` }}>
            <div className='h-100' style={{ minHeight: getRowHeight }}>
                {_renderTradeData()}
            </div>
        </div>
    </div>
}
export default OrderBookTradeHistory;