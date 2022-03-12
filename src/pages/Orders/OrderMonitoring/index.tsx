import "./orderMonitoring.css";
import { useEffect, useState } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import OrderForm from "../../../components/Order/OrderForm";
import { wsService } from "../../../services/websocket-service";
import { IAskAndBidPrice, ITickerInfo } from "../../../interfaces/order.interface";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import { SOCKET_CONNECTED } from "../../../constants/general.constant";
import { DEFAULT_CURRENT_TICKER } from "../../../mocks";

const OrderMonitoring = () => {
    const [currentTicker, setCurrentTicker] = useState<ITickerInfo | any>(DEFAULT_CURRENT_TICKER);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolName, setSymbolName] = useState<string[]>([]);
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>();
    const [symbolCode, setSymbolCode] = useState('');
    const [side, setSide] = useState(0);

    // useEffect(() => {
    //     const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
    //         setSymbolList(res.symbolList)
    //         const listSymbolName: string[] = []
    //         res.symbolList.forEach((item: ISymbolList) => {
    //             listSymbolName.push(`${item.symbolName} (${item.symbolCode})`);
    //         });
    //         setSymbolName(listSymbolName)
    //     });

    //     return () => {
    //         renderDataSymbolList.unsubscribe();
    //     }
    // }, [])

    const handleTicker = (itemTicker: IAskAndBidPrice) => {
        console.log(35, itemTicker)
        setQuoteInfo(itemTicker);
        if (itemTicker?.symbolCode) {
            setSymbolCode(itemTicker.symbolCode);
        }
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess('');
        setMsgSuccess(item);
    }

    const getSide = (value: number) => {
        setSide(value);
    }

    return (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="row align-items-stretch g-2 mb-3">
                        <div className="col-lg-9">
                            <ListTicker getTicerLastQuote={handleTicker} msgSuccess={msgSuccess} handleSide={getSide} />
                        </div>
                        <div className="col-lg-3 d-flex">
                            <div className="card flex-grow-1 card-order-form mb-2">
                                <div className="card-header">
                                    <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                </div>
                                <div className="card-body">
                                    <OrderForm symbolCode={symbolCode}
                                            side={side}
                                            isDashboard={false}
                                            messageSuccess={messageSuccess}
                                            quoteInfo={quoteInfo}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ListOrder getMsgSuccess={msgSuccess} setMessageSuccess={messageSuccess} />
                </div>
            </div>
        </div>
    )
}


export default OrderMonitoring