import { IOrderBook } from "../../interfaces/order.interface"
import { DATA_ASK_VOLUME, DATA_BID_PRICE, ORDER_BOOK_HEADER } from "../../mocks"
import '../TickerDashboard/TickerDashboard.scss'

interface IOrderBookProps {
    isDashboard: boolean;
}

const defaultProps = {
    isDashboard: false
}

const OrderBook = (props: IOrderBookProps) => {
    const { isDashboard } = props;
    const _renderAskVol = () => (
        DATA_ASK_VOLUME.map((item: IOrderBook, index: number) => (
            <tr key={index}>
                <td className="text-end bg-success-light fw-600">{item.askVol}</td>
                <td className="fw-bold text-center">{item.price}</td>
                <td className="text-end fw-600">{item.bidPrice}</td>
            </tr>
        ))
    )

    const _renderAskPrice = () => (
        DATA_BID_PRICE.map((item: IOrderBook, index: number) => (
            <tr key={index}>
                <td className="text-end fw-bold">{item.askVol}</td>
                <td className="fw-bold text-center">{item.price}</td>
                <td className="text-end bg-danger-light fw-bold">{item.bidPrice}</td>
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

    const _renderTilte = () => (
        <div className="text-uppercase small text-secondary mb-2"><strong>Order Book</strong></div>
    )

    const _renderSearchBox = () => (
        <div className="card-header-style">
            <div className="input-group input-group-sm dark">
                <span className="input-group-text bg-light text-white"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control bg-light text-white border-start-0" placeholder="Search" />
            </div>
        </div>
    )

    const _renderTemplate = () => (
        <>
            {!isDashboard && _renderTilte()}
            {isDashboard && _renderSearchBox()}
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
        </>
    )

    return <div>{_renderTemplate()}</div>
}

OrderBook.defaultProps = defaultProps

export default OrderBook