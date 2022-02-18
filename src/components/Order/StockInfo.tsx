import { ITickerInfo } from "../../interfaces/order.interface"

interface IStockInfo {
    listDataTicker: ITickerInfo[];
    detailTicker?: ITickerInfo;
}

const StockInfo = (props: IStockInfo) => {
    const { detailTicker } = props;
    return <>
        <div className="card">
            <div className="card-header">
                <h6 className="card-title mb-0"><i className="bi bi-info-circle"></i> Stock Infomation</h6>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-sm mb-0" cellSpacing="0" cellPadding="0">
                        <tbody>
                            <tr>
                                <th className="fs-14">Mininum bid size</th>
                                <td className="text-end fw-600">{detailTicker?.tickSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Lot size</th>
                                <td className="text-end fw-600">{detailTicker?.lotSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Volume</th>
                                <td className="text-end fw-600">{detailTicker?.volume}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">52w High</th>
                                <td className="text-end fw-600">{detailTicker?.high}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">52w Low</th>
                                <td className="text-end fw-600">{detailTicker?.low}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default StockInfo