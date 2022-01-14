import { SIDE, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatNumber } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import { ORDER_HISTORY, LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'
import Pagination from '../Pagination'
import { IPropListOrderHistory, IListOrderHistory } from "../../../interfaces/order.interface";

const defaultProps: IPropListOrderHistory = {
    listOrderHistory: []
};

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
            <th className="text-ellipsis-sp fz-14">Order ID</th>
            <th className='w-120'>
                <div className="text-ellipsis text-start fz-14">Ticker Code</div>
                <div className="text-ellipsis text-start fz-14">Ticker Name</div>
            </th >
            <th className="text-center fz-14 w-120" >Order Side</th>
            <th className="text-center fz-14 w-120" > Order Status</th>
            <th className="text-center fz-14 w-120" >Order Type</th>
            <th className='w-120'>
                <div className="text-ellipsis text-end fz-14">Order Volume</div>
                <div className="text-ellipsis text-end fz-14">Remaining Volume</div>
            </th>
            <th className="text-end fz-14 w-140"> Executed Volume </th>
            <th className='w-120'>
                <div className="text-ellipsis text-end fz-14">Order Price</div>
                <div className="text-ellipsis text-end fz-14">Last Price</div>
            </th>
            <th className='w-180'>
                <div className="text-ellipsis text-end fz-14"> Order Datetime </div>
                <div className="text-ellipsis text-end fz-14"> Executed Datetime </div>
            </th>
        </tr>
    )

    const _renderOrderHistoryTableBody = () => (
        listOrderHistorySortDate.map((item, index) => (
            <tr className="align-middle" key={index}>
                <td><span className="text-ellipsis"><a href="#">{item.orderId}</a></span></td>

                <td>
                    <div className="text-ellipsis text-start">{getTickerCode(item.symbolCode.toString())}</div>
                    <div className="text-ellipsis text-start">{getTickerName(item.symbolCode.toString())}</div>
                </td>
                <td className="text-center">
                    <span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span>
                </td>

                <td className="text-center">
                    <span className={`${item.state === statusPlace || item.state === statusPartial ? 'text-info' : ''}`}>{getStateName(item.state)}</span>
                </td>

                <td className="text-center">Limit</td>

                <td>
                    <div className="text-ellipsis text-end">{formatNumber(item.amount)}</div>
                    <div className="text-ellipsis text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</div>
                </td>

                <td className="text-end">{formatNumber(item.filledAmount)}</td>

                <td>
                    <div className="text-ellipsis text-end">{formatNumber(item.price)}</div>
                    {item.lastPrice && <div className="text-ellipsis text-end">{formatNumber(item.lastPrice)}</div>}
                    {item.lastPrice === '' && <div className="text-ellipsis text-end">&nbsp;</div>}
                </td>

                <td>
                    <div className="text-ellipsis  text-end">{formatOrderTime(item.time)}</div>
                    {item.executedDatetime && <div className="text-ellipsis  text-end">{formatOrderTime(item.time)}</div>}
                    {item.executedDatetime === '' && <div className="text-ellipsis  text-end">&nbsp;</div>}
                </td>

            </tr>
        ))
    )


    const _renderOrderHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderOrderHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderOrderHistoryTableBody()}
                        </tbody>
                    </table>
                    <Pagination />
                </div>
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