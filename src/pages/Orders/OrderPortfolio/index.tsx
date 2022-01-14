import { ORDER_PORTFOLIO } from '../../../mocks'
import { ITickerPortfolio } from '../../../interfaces/order.interface'
import './orderPortfolio.css'

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
            <th className="text-start fz-14 w-s" >Ticker Name	</th>
            <th className="text-start fz-14 w-s" >Ticker Code</th >
            <th className="text-end fz-14 w-s" >Owned Volume	</th>
            <th className="text-end fz-14 w-s" > Pending Volume</th>
            <th className="text-end fz-14 w-s" >AVG Price</th>
            <th className="text-end fz-14 w-s" > Invested Value</th>
            <th className="text-end fz-14 w-s" >Market Price</th>
            <th className="text-end fz-14 w-s" > Current Value</th>
            <th className="text-end fz-14 w-s" > P&amp;L</th>
            <th className="text-end fz-14 w-s" > % P&amp;L</th>
            <th className="text-end fz-14 w-17"></th>

        </tr>
    )
    const _renderPortfolioTableBody = () => (
        ORDER_PORTFOLIO.map((item: ITickerPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-s td" >{item.companyName}</td>
                <td className="text-start w-s td">{item.ticker}</td>
                {
                    parseInt(item.ownedVolume)===0 ? <td className="text-end w-s td" >&nbsp;</td> : <td className="text-end w-s td" >{item.ownedVolume}</td>
                } 
                
                {
                    item.orderPendingVolume===0 ? <td className="text-end w-s td">&nbsp;</td> : <td className="text-end w-s td">{item.orderPendingVolume}</td>
                }                
                
                <td className="text-end w-s td" >{item.avgPrice}</td>
                <td className="text-end w-s td" >{item.investedValue}</td>
                <td className="text-end w-s td" >{item.marketPrice}</td>
                <td className="text-end w-s td"  >{item.curentValue}</td>
                <td className="text-end w-s td" ><span className={parseInt(item.pl)>0?"text-success":"text-danger"}>{item.pl}</span></td>
                <td className="text-end w-s td"><span className={item.plPercent>0?"text-success":"text-danger"}>{item.plPercent + "%"}</span></td>
            </tr>
        ))

    )
    const _renderPortfolioTable = () => {
        return (
            <>
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead className="thead">
                            {_renderPortfolioTableHeader()}
                        </thead>
                        <tbody className='scroll tbody'>
                            {_renderPortfolioTableBody()}
                        </tbody>
                    </table>

                </div>
            </>
        )
    }
    const _renderPortfolio = () => (
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
    )
    return (
        <>{_renderPortfolio()}</>
    )
}
export default OrderPortfolio