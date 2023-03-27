import { LIST_TICKER_INFO } from "../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../helper/utils";
import { ITickerInfo } from "../../interfaces/order.interface";

interface IStockInfo {
    listDataTicker: ITickerInfo[];
    symbolCode: string;
    volumeTrade: string;
}

const StockInfo = (props: IStockInfo) => {
    const { symbolCode, volumeTrade } = props;

    const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const symbol = symbols.find(o => o?.symbolCode === symbolCode);

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
                                <th className="fs-14">Tick Size</th>
                                <td className="text-end fw-600">{formatCurrency(symbol?.tickSize?.toString())}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Lot Size</th>
                                <td className="text-end fw-600">{symbol?.lotSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Volume</th>
                                <td className="text-end fw-600">{formatNumber(volumeTrade || '0')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default StockInfo