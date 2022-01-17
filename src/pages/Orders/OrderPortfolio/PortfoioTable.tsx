import { ORDER_PORTFOLIO, ORDER_PORTFOLIO_HEADER } from '../../../mocks'
import { ITickerPortfolio } from '../../../interfaces/order.interface'
import { formatPrice } from '../../../helper/utils'

function PortfolioTable(props: any) {

    const { accountBalance } = props

    const _rederPortfolioInvestItem = (title: string, value: string) => (
        title === 'Currency:' ?
            <div className="col-md-3 order-0 order-md-4">
                <p className="text-end small opacity-50 mb-2">{title} {value}</p>
            </div> :
            <div className="col-md-3 text-center">
                <div>{title}</div>
                <div className="fs-5 fw-bold">{formatPrice(value)}</div>
            </div>

    )

    const _rederPortfolioInvest = () => (
        <div className="border p-3 mb-3">
            <div className="row">
                {_rederPortfolioInvestItem('Total Invested Value:', '1453537.86')}
                {_rederPortfolioInvestItem('Total Current Value:', '1481240.10')}
                {_rederPortfolioInvestItem('Total P&amp;L:', '27702.24')}
                {_rederPortfolioInvestItem('Currency:', 'USD')}
            </div>
        </div>
    )

    const _renderPortfolioTableHeaderItem = (title: string, index: number) => (
      <th className={title === 'Ticker Name' || title ==='Ticker Code' ? "text-start fz-14 w-s" : "text-end fz-14 w-s"} key={index}>{title}</th> 
    )

    const _renderPortfolioTableHeader = () => (
        <tr>
            {ORDER_PORTFOLIO_HEADER.map((item: string, index: number) => (
                _renderPortfolioTableHeaderItem(item, index)
            ))}
            <th className="text-end fz-14 w-17"></th>

        </tr>
    )

    const _renderPortfolioTableBody = () => (
        ORDER_PORTFOLIO.map((item: ITickerPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-s td" >{item.companyName}</td>
                <td className="text-start w-s td">{item.ticker}</td>
                {
                    parseInt(item.ownedVolume) === 0 ? <td className="text-end w-s td" >&nbsp;</td> : <td className="text-end w-s td" >{item.ownedVolume}</td>
                }

                {
                    item.orderPendingVolume === 0 ? <td className="text-end w-s td">&nbsp;</td> : <td className="text-end w-s td">{item.orderPendingVolume}</td>
                }

                <td className="text-end w-s td" >{item.avgPrice}</td>
                <td className="text-end w-s td" >{item.investedValue}</td>
                <td className="text-end w-s td" >{item.marketPrice}</td>
                <td className="text-end w-s td"  >{item.curentValue}</td>
                <td className="text-end w-s td" ><span className={parseInt(item.pl) > 0 ? "text-success" : "text-danger"}>{item.pl}</span></td>
                <td className="text-end w-s td"><span className={item.plPercent > 0 ? "text-success" : "text-danger"}>{item.plPercent + "%"}</span></td>
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

    return (
        <>
            {_rederPortfolioInvest()}
            {_renderPortfolioTable()}
        </>
    )
}

export default PortfolioTable