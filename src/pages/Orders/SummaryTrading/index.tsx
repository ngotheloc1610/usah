import SummaryTradingTable from './SummaryTradingTable'
import './orderPortfolio.scss'

function SummaryTrading() {

    const _renderSummaryTrading = () => (
        <div className="site-main">
            <div className="container">
                <div className="card shadow-sm mb-3">
                    <div className="card-header">
                        <h6 className="card-title fs-6 mb-0">Summary Trading</h6>
                    </div>
                    <div className="card-body">
                        <SummaryTradingTable />
                    </div>
                </div>
            </div>
        </div>
    )
    return (
        <>{_renderSummaryTrading()}</>
    )
}
export default SummaryTrading