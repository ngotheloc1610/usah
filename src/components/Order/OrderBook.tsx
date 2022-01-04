import { IOrderBook } from "../../interfaces/order.interface"
import { DATA_ASK_VOLUME, DATA_BID_PRICE } from "../../mocks"

const OrderBook = () => {

    const _renderAskVol = () => (
        DATA_ASK_VOLUME.map((item: IOrderBook, index: number) => (
            <tr key={index}>
                <td className="text-end bg-success-light">{item.askVol}</td>
                <td className="fw-bold text-center">{item.price}</td>
                <td className="text-end">{item.bidPrice}</td>
            </tr>
        ))
    )

    const _renderAskPrice = () => (
        DATA_BID_PRICE.map((item: IOrderBook, index: number) => (
            <tr key={index}>
                <td className="text-end">{item.askVol}</td>
                <td className="fw-bold text-center">{item.price}</td>
                <td className="text-end bg-danger-light">{item.bidPrice}</td>
            </tr>
        ))
    )

    const _renderTemplate = () => (
        <div>
            <div className="text-uppercase small text-secondary mb-2"><strong>Order Book</strong></div>
            <div className="text-uppercase small text-secondary mb-2">
                <div className="table-responsive">
                    <table cellPadding="0" cellSpacing="0" className="table border table-sm mb-0">
                        <thead>
                            <tr className="align-middle">
                                <th className="text-uppercase text-center">
                                    <span className="text-ellipsis">Ask<br />Volume</span>
                                </th>
                                <th className="text-uppercase text-center">
                                    <span className="text-ellipsis">Price</span>
                                </th>
                                <th className="text-uppercase text-center">
                                    <span className="text-ellipsis">Bid<br />Volume</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {_renderAskVol()}
                            <tr className="bg-light">
                                <td className="text-center" colSpan={3}>
                                    <span className="fs-5 fw-bold text-primary">145.57</span>
                                </td>
                            </tr>
                            {_renderAskPrice()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    return <div>{_renderTemplate()}</div>
}

export default OrderBook