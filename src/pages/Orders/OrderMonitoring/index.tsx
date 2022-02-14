import "./orderMonitoring.css";
import { useEffect, useState } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import OrderForm from "../../../components/Order/OrderForm";
import { wsService } from "../../../services/websocket-service";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import { IAskAndBidPrice, ITickerInfo } from "../../../interfaces/order.interface";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import { SOCKET_CONNECTED } from "../../../constants/general.constant";
const defaultCurrentTicker: ITickerInfo | any = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
    side: '',
}

const OrderMonitoring = () => {
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])
    const [currentTicker, setCurrentTicker] = useState(defaultCurrentTicker);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolName, setSymbolName] = useState<string[]>([])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
            const listSymbolName: string[] = []
            res.symbolList.forEach((item: ISymbolList) => {
                listSymbolName.push(`${item.symbolName} (${item.symbolCode})`);
            });
            setSymbolName(listSymbolName)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    const handleTicker = (itemTicker: IAskAndBidPrice, curentPrice: string) => {

        const tickerData = symbolList.find((itemData: ISymbolList) => itemData.symbolId === Number(itemTicker.symbolCode));
        const assignItemTicker = {
            tickerName: tickerData?.symbolName,
            ticker: tickerData?.symbolCode,
            lastPrice: itemTicker.price === '-' ? '0' : itemTicker.price,
            volume: itemTicker.volume === '-' ? '0' : itemTicker.volume,
            side: itemTicker.side,
            symbolId: itemTicker.symbolCode
        }
        setCurrentTicker(assignItemTicker);
    }
    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }

    return (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="row align-items-stretch g-2 mb-3">
                        <div className="col-lg-9">
                            <ListTicker getTicerLastQuote={handleTicker} msgSuccess={msgSuccess} symbolName={symbolName}/>
                            {/* <ListTicker getTicerLastQuote={handleTicker} /> */}
                        </div>
                        <div className="col-lg-3 d-flex">
                            <div className="me-2 h-100 d-flex align-items-center">
                                <button className="btn btn-sm btn-outline-secondary px-1 py-3">
                                    <i className="bi bi-chevron-double-right" />
                                </button>
                            </div>
                            <div className="card flex-grow-1 card-order-form mb-2">
                                <div className="card-header">
                                    <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                </div>
                                <div className="card-body">
                                    <OrderForm currentTicker={currentTicker} messageSuccess={messageSuccess} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ListOrder msgSuccess={msgSuccess} />
                </div>
            </div>
        </div>
    )
}


export default OrderMonitoring