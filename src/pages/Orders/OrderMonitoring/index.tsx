import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { wsService } from "../../../services/websocket-service";
import { IAskAndBidPrice } from "../../../interfaces/order.interface";
import { setWarningMessage } from "../../../redux/actions/App";

import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import OrderForm from "../../../components/Order/OrderForm";
import "./orderMonitoring.css";

const OrderMonitoring = () => {
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>();
    const [symbolCode, setSymbolCode] = useState('');
    const [side, setSide] = useState(0);

    const dispatch = useDispatch();
    const { warningMessage, enableFlag } = useSelector((state: any) => state.app);

    const handleTicker = (itemTicker: IAskAndBidPrice) => {
        setQuoteInfo(itemTicker);
        if (itemTicker?.symbolCode) {
            setSymbolCode(itemTicker.symbolCode);
        }
    }

    const handleSymbolCodeRemove = (symbolRemove: string) => {
        symbolCode && symbolCode === symbolRemove && setSymbolCode('');
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess('');
        setMsgSuccess(item);
    }

    const getSide = (value: number) => {
        setSide(value);
    }

    useEffect(() => {
        const warningMessage = wsService.getWarningMessage().subscribe(res => {
            if (res) {
                dispatch(setWarningMessage({
                    warningMessage: res.content,
                    enableFlag: res.enableFlg
                }));
            }
        })

        return () => {
            warningMessage.unsubscribe();
        }
    }, []);

    return (
        <div className={`site-main ${enableFlag && "pt-2"}`}>
            <div className="container">
                {enableFlag && <p className="text-danger fz-14 mb-2">{warningMessage}</p>}
                <div className="row align-items-stretch g-2 mb-3">
                    <div className="col-lg-9">
                        <ListTicker getTicerLastQuote={handleTicker} msgSuccess={msgSuccess} handleSide={getSide} getSymbolCodeRemove={handleSymbolCodeRemove} />
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
                                    isMonitoring={true}
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
    )
}


export default OrderMonitoring