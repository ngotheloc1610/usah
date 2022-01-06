import { ORDER_PORTFOLIO } from '../../../mocks'
import { IOrderPortfolio } from '../../../interfaces/order.interface'
function OrderPortfolio() {

    const _rederPortfolioInvest = () => (
        <>
            <div className="border p-3 mb-3">
                <div className="row">
                    <div className="col-md-3 text-center">
                        <div>Total Invested Value:</div>
                        <div className="fs-5 fw-bold">1,453,537.86</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total Current Value:</div>
                        <div className="fs-5 fw-bold">1,481,240.10</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total P&amp;L:</div>
                        <div className="fs-5 fw-bold text-success">27702.24</div>
                    </div>
                    <div className="col-md-3 order-0 order-md-4">
                        <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                    </div>
                </div>
            </div>
        </>
    )
    const _renderPortfolioTableHeader = () => (
        <tr>
            <th className="text-left center fz-14">Company Name	</th>
            <th className="text-center center fz-14">Ticker </th >
            <th className="text-center center fz-14" >Owned Volume	</th>
            <th className="text-center center fz-14" > Order Pending Volume</th>
            <th className="text-center center fz-14" >AVG Price</th>
            <th className="text-center center fz-14"> Invested Valu</th>
            <th className="text-center center fz-14" >Market Price</th>
            <th className="text-center center fz-14" > Curent Value	</th>
            <th className="text-center center fz-14"> P&amp;L</th>
            <th className="text-center center fz-14"> % P&amp;L</th>
        </tr>
    )
    const _renderPortfolioTableBody = () => (
        ORDER_PORTFOLIO.map((item: IOrderPortfolio, index: number) => (
            <tr className="odd" key={index}>
                <td>{item.companyName}</td>
                <td>{item.ticker}</td>
                {
                    item.ownedVolume===0 ? <td className="text-end">&nbsp;</td> : <td className="text-end">{item.ownedVolume}</td>
                } 
                
                {
                    item.orderPendingVolume===0 ? <td className="text-end">&nbsp;</td> : <td className="text-end">{item.orderPendingVolume}</td>
                }                
                
                <td className="text-end">{item.AVGPrice}</td>
                <td className="text-end">{item.investedValue}</td>
                <td className="text-end">{item.marketPrice}</td>
                <td className="text-end">{item.curentValue}</td>
                <td className="text-end"><span className="text-success">{item.PL}</span></td>
                <td className="text-end"><span className="text-success">{item.PL_Percent + "%"}</span></td>
            </tr>
        ))

    )
    const _renderPortfolioTable = () => {
        return (
            <>
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderPortfolioTableHeader()}
                        </thead>
                        <tbody>
                            {_renderPortfolioTableBody()}
                        </tbody>
                    </table>

                </div>
            </>
        )
    }
    const _renderPortfolio = () => (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header">
                            <h6 className="card-title fs-6 mb-0">My Account</h6>
                        </div>
                        <div className="card-body">
                            {_rederPortfolioInvest()}
                            {_renderPortfolioTable()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
    return (
        <>{_renderPortfolio()}</>
    )
}
export default OrderPortfolio