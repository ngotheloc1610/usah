import { IPropsListPortfolio, IListPortfolio } from '../../../interfaces/order.interface'
import { formatPrice } from '../../../helper/utils'
import { LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'

function PortfolioTable(props: IPropsListPortfolio) {

    const { accountPortfolio } = props

    const getTickerCode = (sympleId: string) => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker;
    }

    const getTickerName = (sympleId: string) => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.tickerName;
    }

    const _rederPortfolioInvest = () => {
        const totalInvestedValue = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.investedValue)
        }, 0)

        const totalCurrentValue = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.currentValue)
        }, 0)

        const totalPl = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.unrealizedPl)
        }, 0)

        return (
            <div className="border p-3 mb-3">
                <div className="row">
                    <div className="col-md-3 text-center">
                        <div>Total Invested Value:</div>
                        <div className="fs-5 fw-bold">{formatPrice(totalInvestedValue.toString())}</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total Current Value:</div>
                        <div className="fs-5 fw-bold">{formatPrice(totalCurrentValue.toString())}</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total P&amp;L:</div>
                        <div className="fs-5 fw-bold text-success">{formatPrice(totalPl.toString())}</div>
                    </div>
                    <div className="col-md-3 order-0 order-md-4">
                        <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                    </div>
                </div>
            </div>
        )
    }

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
            {accountPortfolio.length > 6 && <th className="text-end fz-14 w-17"></th>}
        </tr>
    )

    const _renderPortfolioTableBody = () => (
        accountPortfolio.map((item: IListPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-s td" >{getTickerName(item.symbolCode)}</td>
                <td className="text-start w-s td">{getTickerCode(item.symbolCode)}</td>
                {
                    Number(item.ownedVolume) === 0 ? <td className="text-end w-s td" >&nbsp;</td> : <td className="text-end w-s td" >{item.ownedVolume}</td>
                }
                {
                    Number(item.pendingVolume) === 0 ? <td className="text-end w-s td">&nbsp;</td> : <td className="text-end w-s td">{item.pendingVolume}</td>
                }
                <td className="text-end w-s td" >{formatPrice(item.avgPrice)}</td>
                <td className="text-end w-s td" >{formatPrice(item.investedValue)}</td>
                <td className="text-end w-s td" >{formatPrice(item.marketPrice)}</td>
                <td className="text-end w-s td"  >{formatPrice(item.currentValue)}</td>
                <td className="text-end w-s td" ><span className={Number(item.unrealizedPl) > 0 ? "text-success" : "text-danger"}>
                    {formatPrice(item.unrealizedPl)}</span>
                </td>
                <td className="text-end w-s td"><span className={Number(item.unrealizedPl) > 0 ? "text-success" : "text-danger"}>
                    {(Number(item.unrealizedPl) / Number(item.investedValue) * 100).toFixed(2) + '%'}</span></td>
            </tr>
        ))

    )

    const _renderPortfolioTable = () => (
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
    )

    return (
        <>
            {_rederPortfolioInvest()}
            {_renderPortfolioTable()}
        </>
    )
}

export default PortfolioTable