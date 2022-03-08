import PaginationComponent from "../../../Common/Pagination";
import "./ListModifyCancel.css";
import * as tspb from "../../../models/proto/trading_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { wsService } from "../../../services/websocket-service";
import { useEffect, useState } from "react";
import { IListOrder, IParamOrder } from "../../../interfaces/order.interface";
import * as qspb from "../../../models/proto/query_service_pb"
import { ACCOUNT_ID, DEFAULT_ITEM_PER_PAGE, MESSAGE_TOAST, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, START_PAGE, TITLE_CONFIRM } from "../../../constants/general.constant";
import { calcCurrentList, calcPendingVolume, formatCurrency, formatNumber, formatOrderTime } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import PopUpConfirm from "../../Modal/PopUpConfirm";

interface IPropsListModifyCancel {
    orderSide: number;
}

const ListModifyCancel = (props: IPropsListModifyCancel) => {
    const { orderSide } = props;
    const [listOrder, setListOrder] = useState<IListOrder[]>([]);
    const [dataOrder, setDataOrder] = useState<IListOrder[]>([]);
    const [statusOrder, setStatusOrder] = useState(0);
    const tradingModelPb: any = tspb;
    const [isModify, setIsModify] = useState<boolean>(false);
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    const defaultData: IParamOrder = {
        tickerCode: '',
        tickerName: '',
        orderType: '',
        volume: '',
        price: 0,
        side: '',
        confirmationConfig: false,
        tickerId: ''
    }
    const [paramModifyCancel, setParamModifyCancel] = useState<IParamOrder>(defaultData);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const totalItem = listOrder.length;

    useEffect(() => {
        const listOrderSortDate: IListOrder[] = listOrder.sort((a, b) => b.time.toString()?.localeCompare(a.time.toString()));
        const currentList = calcCurrentList(currentPage, itemPerPage, listOrderSortDate);
        setDataOrder(currentList);
    }, [listOrder, itemPerPage, currentPage])

    useEffect(() => {
        setCurrentPage(START_PAGE)
    }, [listOrder])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
                sendMsgSymbolList();
            }
        });

        const listOrder = wsService.getListOrder().subscribe(response => {
            let listOrderSortDate: IListOrder[] = [];
            if (orderSide !== 0) {
                const listOrderFilter = response.orderList.filter(item => item.orderType === orderSide)
                listOrderSortDate = listOrderFilter.sort((a, b) => b.time - a.time);
                setDataOrder(listOrderSortDate);
                return
            };
            listOrderSortDate = response.orderList.sort((a, b) => b.time - a.time);
            setDataOrder(listOrderSortDate);
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            listOrder.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [orderSide]);

    useEffect(() => {
        sendListOrder();
        const listOrder = wsService.getListOrder().subscribe(response => {
            if (orderSide !== 0) {
                const listOrderFilter = response.orderList.filter(item => item.orderType === orderSide)
                setListOrder(listOrderFilter);
                return
            };
            setListOrder(response.orderList);
        });
        return () => listOrder.unsubscribe();
    }, [msgSuccess, orderSide]);

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE)
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
    }

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessage(accountId);
    }

    const prepareMessage = (accountId: string) => {
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

    const getTickerCode = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolCode || '';
    }

    const getTickerName = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolName || '';
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const handleModifyCancel = (item: IListOrder, value: string) => {
        const param: IParamOrder = {
            orderId: item.orderId.toString(),
            tickerCode: getTickerCode(item.symbolCode.toString())?.toString(),
            tickerName: getTickerName(item.symbolCode.toString())?.toString(),
            orderType: ORDER_TYPE_NAME.limit,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.orderType.toString(),
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
        }
        setParamModifyCancel(param);
        if (value === TITLE_CONFIRM['modify']) {
            setIsModify(true);
            return;
        }
        setIsCancel(true);
    }

    const togglePopup = (isCloseModifyCancel: boolean) => {
        setIsModify(isCloseModifyCancel);
        setIsCancel(isCloseModifyCancel);
        setIsCancelAll(isCloseModifyCancel);
    }

    const _rendetMessageSuccess = (message: string) => {
        // To handle when modify or cancel success then update new data without having to press f5
        setMsgSuccess(MESSAGE_TOAST.SUCCESS_PLACE)
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getStatusOrderResponse = (value: number, content: string) => {
        if (statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
            </>
        }
        return <></>;
    }

    const getStatusModifyCancelOrCancelMulti = (value: boolean) => {
        if (value) {
            sendListOrder();
        }
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

    const getListModifyCancelData = () => (
        dataOrder.map((item, index) => {
            return <tr key={index} className="odd">
                <td>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" value=""
                            checked={item?.isChecked || false}
                            name={index.toString()}
                            onChange={handleChecked}
                            id="all" />
                    </div>
                </td>
                <td className="fm">{item.orderId}</td>
                <td>{getTickerCode(item.symbolCode.toString())}</td>
                <td className="text-center "><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                <td className="text-center ">{ORDER_TYPE_NAME.limit}</td>
                <td className="text-end ">{formatCurrency(item.price.toString())}</td>
                <td className="text-end ">{formatNumber(item.amount.toString())}</td>
                <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                <td className="text-end">{formatOrderTime(item.time)}</td>
                <td className="text-end">
                    <a className="btn-edit-order mr-10" onClick={() => handleModifyCancel(item, TITLE_CONFIRM['modify'])}>
                        <i className="bi bi-pencil-fill"></i>
                    </a>
                    <a onClick={() => handleModifyCancel(item, TITLE_CONFIRM['cancel'])}>
                        <i className="bi bi-x-lg"></i>
                    </a>
                </td>
            </tr>
        })
    )
    return <div className="card-modify mb-3">
        <div className="card-body p-0 mb-3">
            <div className="table table-responsive mh-500 tableFixHead">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
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
                                <span className="text-ellipsis">Volume</span>
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
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} currentPage={currentPage}
            getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage}
        />
        {isCancel && <ConfirmOrder isCancel={isCancel}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel}
            handleStatusModifyCancel={getStatusModifyCancelOrCancelMulti} />}
        {isModify && <ConfirmOrder isModify={isModify}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel}
            handleStatusModifyCancel={getStatusModifyCancelOrCancelMulti} />}
        {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
            totalOrder={totalOrder} listOrder={dataSelected}
            handleOrderResponse={getStatusOrderResponse}
            handleStatusCancelAll={getStatusModifyCancelOrCancelMulti}/>}
    </div>
}
export default ListModifyCancel;