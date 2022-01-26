import { ORDER_TYPE_NAME, SIDE, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatCurrency, formatNumber } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import { LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'
import Pagination from '../../../Common/Pagination'
import { IPropListOrderHistory, IListOrderHistory } from "../../../interfaces/order.interface";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory } = props;
    

    const tradingModelPb: any = tspb;

    const listOrderHistorySortDate: IListOrderHistory[] = listOrderHistory.sort((a, b) => b.time - a.time);

    const getTickerCode = (sympleId: string) => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker;
    }

    const getTickerName = (sympleId: string) => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.tickerName;
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const getStateName = (state: number) => {
        return STATE.find(item => item.code === state)?.title;
    }

    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED
    const statusPartial = tradingModelPb.OrderState.ORDER_STATE_PARTIAL

    const _renderOrderHistoryTableHeader = () =>
    (
        <tr>
            <th className="text-ellipsis-sp fz-14 w-180">Order ID</th>
            <th className="text-ellipsis text-start fz-14 w-120">
                <div>Ticker Code</div>
                <div>Ticker Name</div>
            </th >
            <th className="text-center fz-14 w-120" >Order Side</th>
            <th className="text-center fz-14 w-120" > Order Status</th>
            <th className="text-center fz-14 w-120" >Order Type</th>
            <th className="text-ellipsis text-end fz-14 w-140">
                <div>Order Volume</div>
                <div>Remaining Volume</div>
            </th>
            <th className="text-end fz-14 w-120"> Executed Volume </th>
            <th className="text-ellipsis text-end fz-14 w-120">
                <div>Order Price</div>
                <div>Last Price</div>
            </th>
            <th className="text-ellipsis text-end fz-14 w-200">
                <div> Order Datetime </div>
                <div> Executed Datetime </div>
            </th>
        </tr>
    )

    const _renderOrderHistoryTableBody = () => (
        listOrderHistorySortDate.map((item, index) => (
            <tr className="align-middle" key={index}>
                <td className="w-180"><span className="text-ellipsis fm"><a href="#">{item.orderId}</a></span></td>
                <td className="text-ellipsis text-start w-120">
                    <div>{getTickerCode(item.symbolCode.toString())}</div>
                    <div>{getTickerName(item.symbolCode.toString())}</div>
                </td>
                <td className="text-center w-120">
                    <span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span>
                </td>

                <td className="text-center w-120">
                    <span className={`${item.state === statusPlace || item.state === statusPartial ? 'text-info' : ''}`}>{getStateName(item.state)}</span>
                </td>

                <td className="text-center w-120">{ORDER_TYPE_NAME.limit}</td>

                <td className="text-ellipsis text-end w-140">
                    <div>{formatNumber(item.amount)}</div>
                    <div>{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</div>
                </td>

                <td className="text-end w-120">{formatNumber(item.filledAmount)}</td>

                <td className="text-ellipsis text-end w-120">
                    <div className="">{formatCurrency(item.price)}</div>
                    {item.lastPrice && <div>{formatCurrency(item.lastPrice)}</div>}
                    {item.lastPrice === '' && <div>&nbsp;</div>}
                </td>

                <td className="td w-200 text-end">
                    <div>{formatOrderTime(item.time)}</div>
                    {item.executedDatetime && <div >{formatOrderTime(item.time)}</div>}
                    {item.executedDatetime === '' && <div >&nbsp;</div>}
                </td>

            </tr>
        ))
    )

    const _renderOrderHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0 tableBodyScroll" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderOrderHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderOrderHistoryTableBody()}
                        </tbody>
                    </table>
                </div>
                    <Pagination />
                <p className="text-end border-top pt-3">
                    <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
                </p>
            </div>
        )
    }

    return (
        <>
            {_renderOrderHistoryTable()}
        </>
    )
}

export default OrderTable