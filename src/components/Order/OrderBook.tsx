import { IOrderBook } from "../../interfaces/order.interface"
import { DATA_ASK_VOLUME, DATA_BID_PRICE, ORDER_BOOK_HEADER } from "../../mocks"

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

    const _renderHeaderOrderBook = () => (
        ORDER_BOOK_HEADER.map((item: string, index: number) => (
            <th className="text-uppercase text-center" key={index}>
                <span className="text-ellipsis">{item.split(' ')[0]}<br />{item.split(' ')[1]}</span>
            </th>
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
                                {_renderHeaderOrderBook()}
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