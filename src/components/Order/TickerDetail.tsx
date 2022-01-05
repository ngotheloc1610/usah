import '../../pages/Orders/OrderNew/OrderNew.scss'

const TickerDetail = () => {

    const _renderLastPrice = () => (
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
    )

    const _renderGeneralTemplate = (title1: string, value1: string, title2: string, value2: string) => (
        <tr>
            <th >{title1}</th>
            <td className="text-end">{value1}</td>
            <th >{title2}</th>
            <td className="text-end">{value2}</td>
        </tr>
    )

    const _renderTickerDetail = () => (
        <div>
            <div className="text-uppercase small text-secondary mb-2"><strong>Ticker Detail</strong></div>
            <div className="table-responsive">
                <table cellPadding="0" cellSpacing="0" className="table border table-i table-sm">
                    <tbody>
                        {_renderLastPrice()}
                        {_renderGeneralTemplate('Lot Size', '100', 'High', '145.75')}
                        {_renderGeneralTemplate('Minimum Bid Size', '0.01', 'Low', '140.00')}
                    </tbody>
                </table>
            </div>
        </div>
    )
    return <div>{_renderTickerDetail()}</div>
}

export default TickerDetail