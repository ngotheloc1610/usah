import * as tspb from '../../models/proto/trading_model_pb';

import { ORDER_TYPE_NAME, SIDE } from "../../constants/general.constant";
import { DATA_MATCHING_DETAIL } from "../../mocks";

interface IPropsModalDetail {
    getStatusFromModal: (item: boolean) => void;
}

const ModalMatching = (props: IPropsModalDetail) => {
    const { getStatusFromModal } = props
    const tradingModelPb: any = tspb;

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const closeModalDetail = () => {
        getStatusFromModal(false)
    }

    const _renderHeader = () =>
    (<tr>
        <th className="text-center fz-14 text-nowrap" > Sub No </th>
        <th className="text-left fz-14 text-nowrap"> Order No </th>
        <th className="text-start fz-14 text-nowrap"> Ticker Code </th >
        <th className="text-start fz-14 text-nowrap" > Order Status </th>
        <th className="text-center fz-14 text-nowrap" > Side </th>
        <th className="text-center fz-14 text-nowrap" > Order Type </th>
        <th className="text-end fz-14 text-nowrap" > Order Price </th>
        <th className="text-end fz-14 text-nowrap "> Order Volume </th>
        <th className="text-end fz-14 text-nowrap"> Executed Price </th>
        <th className="text-end fz-14 text-nowrap" > Executed Volume </th>
        <th className="text-end fz-14 text-nowrap"> Remaining Volume </th>
        <th className="text-end fz-14 text-nowrap"> Datetime </th>
        <th className="text-center fz-14 text-nowrap"> Comment </th>
    </tr>)

    const _renderTable = () => (
        DATA_MATCHING_DETAIL.map((item: any, index: number) => (
            <tr className="align-middle" key={index}>
                <td className="td text-center " >{item.subNo}</td>
                <td className="td "><a href="#">{item.orderId}</a></td>
                <td className="td text-start ">{item.ticker}</td>
                <td className="td text-start ">{item.orderStatus}</td>
                <td className="td text-center ">
                    <span className={`${item.side === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>
                        {getSideName(item.side)}
                    </span>
                </td>
                <td className="text-center ">{ORDER_TYPE_NAME.limit}</td>
                <td className="td text-end ">{item.orderPrice}</td>
                <td className="td text-end ">{item.orderVolume}</td>
                <td className="td text-end " >{item.exPrice}</td>
                <td className="td text-end ">{item.exVolume}</td>
                <td className="td text-end ">{item.remainVolume}</td>
                <td className="td text-end ">{item.date}</td>
                <td className="td text-center ">{item.comment}</td>
            </tr>
        ))
    )

    const _renderTradeHistoryTable = () => (
        <>
            <div className="container modal-matching">
                <div className="card">
                    <div className="card-body pd-10">
                        <div className="title-moldal">
                            <h6 className="card-title mb-0">Matching History</h6>
                            <button type="button" className="btn_close" onClick={closeModalDetail}> <i className=" bi bi-x-lg"></i></button>
                        </div>

                        <div className="table-responsive">
                            <table id="table" className="table table-sm table-hover mb-0 " cellSpacing="0" cellPadding="0">
                                <thead>
                                    {_renderHeader()}
                                </thead>
                                <tbody className="tbody-modal">
                                    {_renderTable()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    return <div className="popup-box">
        {_renderTradeHistoryTable()}
    </div>
}

export default ModalMatching