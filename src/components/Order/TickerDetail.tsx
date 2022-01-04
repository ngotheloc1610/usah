import '../../pages/Orders/OrderNew/OrderNew.css'

const TickerDetail = () => {
    const _renderTickerDetail = () => (
        <div>
            <div className="text-uppercase small text-secondary mb-2"><strong>Ticker Detail</strong></div>
            <div className="table-responsive">
                <table cellPadding="0" cellSpacing="0" className="table border table-i table-sm">
                    <tbody>
                        <tr className="align-middle">
                            <th >
                                <div>Last Price</div>
                                <div>Change</div>
                            </th>
                            <td className="text-end">
                                <div className="text-success fs-6 fw-bold"><i className="bi bi-arrow-up"></i> 145.57</div>
                                <div className="text-success">1.80(1.27%)</div>
                            </td>
                            <th >Open</th>
                            <td className="text-end">141.00</td>
                        </tr>
                        <tr>
                            <th >Lot Size</th>
                            <td className="text-end">100</td>
                            <th >High</th>
                            <td className="text-end">145.57</td>
                        </tr>
                        <tr>
                            <th >Minimum Bid Size</th>
                            <td className="text-end">0.01</td>
                            <th >Low</th>
                            <td className="text-end">140.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
    return <div>{_renderTickerDetail()}</div>
}

export default TickerDetail