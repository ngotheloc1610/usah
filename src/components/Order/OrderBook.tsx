const OrderBook = () => {

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
                            <tr>
                                <td className="text-end bg-success-light">2,400</td>
                                <td className="fw-bold text-center">145.54</td>
                                <td className="text-end">&nbsp;</td>
                            </tr>
                            <tr>
                                <td className="text-end bg-success-light">1,500</td>
                                <td className="fw-bold text-center">145.55</td>
                                <td className="text-end">&nbsp;</td>
                            </tr>
                            <tr>
                                <td className="text-end bg-success-light">900</td>
                                <td className="fw-bold text-center">145.56</td>
                                <td className="text-end">&nbsp;</td>
                            </tr>
                            <tr className="bg-light">
                                <td className="text-center" colSpan={3}>
                                    <span className="fs-5 fw-bold text-primary">145.57</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-end">&nbsp;</td>
                                <td className="fw-bold text-center">145.58</td>
                                <td className="text-end bg-danger-light">2,400</td>
                            </tr>
                            <tr>
                                <td className="text-end">&nbsp;</td>
                                <td className="fw-bold text-center">145.59</td>
                                <td className="text-end bg-danger-light">1,700</td>
                            </tr>
                            <tr>
                                <td className="text-end">&nbsp;</td>
                                <td className="fw-bold text-center">145.60</td>
                                <td className="text-end bg-danger-light">800</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    return <div>{_renderTemplate()}</div>
}

export default OrderBook