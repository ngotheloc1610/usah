import { useEffect, useRef, useState } from "react";
import { ACCOUNT_ID, MESSAGE_TOAST, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SOCKET_RECONNECTED } from "../../../constants/general.constant";
import { calcPendingVolume, checkMessageError, formatCurrency, formatOrderTime } from "../../../helper/utils";
import { IListOrderMonitoring, IParamOrder, IParamOrderModifyCancel } from "../../../interfaces/order.interface";
import * as tspb from '../../../models/proto/trading_model_pb';
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import './ListOrder.scss';
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { formatNumber } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import PopUpConfirm from "../../Modal/PopUpConfirm";
import { TYPE_ORDER_RES } from "../../../constants/order.constant";
interface IPropsListOrder {
    getMsgSuccess: string;
    setMessageSuccess: (item: string) => void;
}


const paramModifiCancelDefault: IParamOrder = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: '',
    price: 0,
    side: '',
    confirmationConfig: false,
    tickerId: ''
}

const defaultDataModiFyCancel: IParamOrderModifyCancel = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: '',
    price: 0,
    side: 0,
    confirmationConfig: false,
    tickerId: ''
}

const ListOrder = (props: IPropsListOrder) => {
    const { getMsgSuccess, setMessageSuccess } = props;
    const tradingModelPb: any = tspb;
    const [dataOrder, setDataOrder] = useState<IListOrderMonitoring[]>([]);
    const [isShowFullData, setShowFullData] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isModify, setIsModify] = useState(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(defaultDataModiFyCancel);
    const [statusOrder, setStatusOrder] = useState(0);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrderMonitoring[]>([]);

    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);

    const [position, setPosition] = useState({
        x: 0,
        y: 0
    })
    // dùng useRef để lấy element nên biến myRef sẽ khai báo any
    const myRef: any = useRef()

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendListOrder();
            }
        });

        const listOrder = wsService.getListOrder().subscribe(response => {
            const listOrderSortDate: IListOrderMonitoring[] = response.orderList.sort((a, b) => b.time - a.time);
            setDataOrder(listOrderSortDate);
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(resp => {
            if (resp && resp.quoteList) {
                sendListOrder()
            }
        })

        return () => {
            ws.unsubscribe();
            quoteEvent.unsubscribe();
            listOrder.unsubscribe();
        }
    }, []);

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessagee(accountId);
    }

    const prepareMessagee = (accountId: string) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(uid);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    useEffect(() => {
        window.scrollTo(position.x, position.y)
    }, [position])

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const btnShowFullData = () => {
        setShowFullData(!isShowFullData);
        setPosition({
            x: myRef.current.getBoundingClientRect().left,
            y: myRef.current.getBoundingClientRect().top
        })
    }

    const getTicker = (symbolCode: string) => {
        const ticker = symbolList.find(item => item.symbolCode === symbolCode);
        return ticker;
    }

    const handleModify = (item: IListOrderMonitoring) => {
        const symbolName = symbolList.find(i => i.symbolCode === item.symbolCode)?.symbolName;
        const param: IParamOrderModifyCancel = {
            orderId: item.orderId.toString(),
            tickerCode: item.symbolCode.split('-')[0]?.trim(),
            tickerName: symbolName || '',
            orderType: ORDER_TYPE_NAME.limit,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.side,
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
        }
        setParamModifyCancel(param);
        setIsModify(true);
    }

    const handleCancel = (item: IListOrderMonitoring) => {
        const symbolName = symbolList.find(i => i.symbolCode === item.symbolCode)?.symbolName;
        const param: IParamOrderModifyCancel = {
            orderId: item.orderId.toString(),
            tickerCode: item.symbolCode.split('-')[0]?.trim(),
            tickerName: symbolName || '',
            orderType: ORDER_TYPE_NAME.limit,
            volume: item.amount,
            price: Number(item.price),
            side: item.side,
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
        }
        setParamModifyCancel(param)
        setIsCancel(true)
    }

    const togglePopup = (isCloseModifyCancel: boolean) => {
        setIsModify(isCloseModifyCancel);
        setIsCancel(isCloseModifyCancel);
        setIsCancelAll(isCloseModifyCancel);
    }

    const _rendetMessageSuccess = (typeOrderRes: string) => {
        setMessageSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        switch (typeOrderRes) {
            case (TYPE_ORDER_RES.Order):
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
            case TYPE_ORDER_RES.Cancel:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_CANCEL)}</div>
            case TYPE_ORDER_RES.Modify:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_MODIFY)}</div>
        }
    }

    const _rendetMessageError = (message: string, msgCode: number) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(messageDis)}</div>
    }

    const getStatusOrderResponse = (value: number, content: string, typeOrderRes: string, msgCode: number) => {
        if (statusOrder === 0 && typeOrderRes === TYPE_ORDER_RES.Order) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (statusCancel === 0 && typeOrderRes === TYPE_ORDER_RES.Cancel) {
            setStatusCancel(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (statusModify === 0 && typeOrderRes === TYPE_ORDER_RES.Modify) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        return <></>;
    }

    const btnCancelAllConfirm = () => {
        const dataSelected = dataOrder.filter(item => item.isChecked);
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }
    const handleChecked = (e) => {
        const { name, checked } = e.target;
        if (name === "allSelect") {
            const isSelectAll = dataOrder.map((order) => {
                return { ...order, isChecked: checked };
            });
            setDataOrder(isSelectAll);
        } else {
            let tempOrder = dataOrder.map((order, index) =>
                Number(index) === Number(name) ? { ...order, isChecked: checked } : order
            );
            setDataOrder(tempOrder);
        }
    }
    const _renderTableListOrder = () => {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" value=""
                                name="allSelect"
                                onChange={handleChecked}
                                checked={!dataOrder.some((order) => order?.isChecked !== true) && dataOrder.length > 0}
                            />
                        </th>
                        <th className="sorting_disabled">
                            <span className="text-ellipsis">Order ID</span>
                        </th>
                        <th className="sorting_disabled">
                            <span className="text-ellipsis">Ticker</span>
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Side</span>
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Type</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Price</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Quantity</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Pending</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Datetime</span>
                        </th>
                        <th className="text-end sorting_disabled">

                            {(dataOrder.some((order) => order?.isChecked === true) && dataOrder.length > 0) && <button className="text-ellipsis btn btn-primary" onClick={() => btnCancelAllConfirm()}>Cancel</button>}

                        </th>
                    </tr>
                </thead>
                <tbody>
                    {getListDataOrder()}
                </tbody>
            </table>
        );
    }
    const getListDataOrder = () => (
        dataOrder.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value=""
                                checked={item?.isChecked || false}
                                name={index.toString()}
                                onChange={handleChecked}
                                id="all" />
                        </div>
                    </td>
                    <td className="fm">{item.externalOrderId}</td>
                    <td title={getTicker(item.symbolCode)?.symbolName}>{getTicker(item.symbolCode)?.symbolCode}</td>
                    <td className="text-center "><span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span></td>
                    <td className="text-center ">{ORDER_TYPE_NAME.limit}</td>
                    <td className="text-end ">{formatCurrency(item.price.toString())}</td>
                    <td className="text-end ">{formatNumber(item.amount.toString())}</td>
                    <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                    <td className="text-end">{formatOrderTime(item.time)}</td>
                    <td className="text-end">
                        <a className="btn-edit-order mr-10" onClick={() => handleModify(item)}>
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <a onClick={() => handleCancel(item)}>
                            <i className="bi bi-x-lg"></i>
                        </a>
                    </td>
                </tr>
            )
        })
    )
    return (
        <>
            <div className="card order-list">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                    <div>
                        <a id="show-data" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white" ref={myRef}>
                            <i className={`bi bi-chevron-compact-${isShowFullData ? 'down' : 'up'}`}></i>
                        </a>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className={`table-responsive ${!isShowFullData ? 'mh-350' : ''} tableFixHead`}>
                        {_renderTableListOrder()}
                    </div>
                </div>
            </div>

            {isCancel && <ConfirmOrder isCancel={isCancel}
                handleCloseConfirmPopup={togglePopup}
                handleOrderResponse={getStatusOrderResponse}
                params={paramModifyCancel}
                />}
            {isModify && <ConfirmOrder isModify={isModify}
                handleCloseConfirmPopup={togglePopup}
                handleOrderResponse={getStatusOrderResponse}
                params={paramModifyCancel}
                />}
            {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
                totalOrder={totalOrder} listOrder={dataSelected}
                handleOrderResponse={getStatusOrderResponse} />}
        </>
    )
}

export default ListOrder;