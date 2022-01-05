import { LIST_DATA_TICKERS } from "../../../mocks";

const ListTicker = () => {
    const listDataTicker = LIST_DATA_TICKERS;
    const renderListDataTicker = listDataTicker.map((item, index) =>
        <div key={index} className="col-6 col-md-3 col-xl-2">
            <table
                className="table-item-ticker table table-sm table-hover border mb-1"
            >
                <thead>
                    <tr>
                        <th colSpan={3} className="text-center">
                            <div className="position-relative">
                                <strong className="px-4">AAPL</strong>
                                <a href="#" className="position-absolute me-1" style={{ right: 0 }} >
                                    <i className="bi bi-x-lg" />
                                </a>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-end text-success">{item.volume3Order} ({item.number3Order})</td>
                        <td className="text-center">{item.price3Order}</td>
                        <td className="text-end">&nbsp;</td>
                    </tr>
                    <tr>
                        <td className="text-end text-success">{item.volume2Order} ({item.number2Order})</td>
                        <td className="text-center">{item.price2Order}</td>
                        <td className="text-end">&nbsp;</td>
                    </tr>
                    <tr>
                        <td className="text-end text-success">{item.volume1Order} ({item.number1Order})</td>
                        <td className="text-center">{item.price1Order}</td>
                        <td className="text-end">&nbsp;</td>
                    </tr>
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-center">{item.bid1Price}</td>
                        <td className="text-end text-danger">{item.bid1Volume} ({item.bid1Number})</td>
                    </tr>
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-center">{item.bid2Price}</td>
                        <td className="text-end text-danger">{item.bid2Volume} ({item.bid2Number})</td>
                    </tr>
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-center">{item.bid1Price}</td>
                        <td className="text-end text-danger">{item.bid1Volume} ({item.bid1Number})</td>
                    </tr>
                </tbody>
            </table>

        </div>
    )
    return (

        <div className="row row-monitoring g-2">
            {renderListDataTicker}
        </div>
    )
}
export default ListTicker;