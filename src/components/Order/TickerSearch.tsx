import { useState } from 'react'
import { ITickerInfo } from '../../interfaces/order.interface'
import { LIST_TICKER_INFOR_MOCK_DATA } from '../../mocks'
import '../../pages/Orders/OrderNew/OrderNew.scss'

interface ITickerSearch {
    handleTicker: (event: any) => void;
}

const defaultProps = {
    handleTicker: null
}

const TickerSearch = (props: ITickerSearch) => {
    const {handleTicker} = props;
    const [ticker, setTicker] = useState('')
    const _renderRecentSearch = () => (
        <div className="d-md-flex align-items-md-center text-center">
            <div>Recent Search:</div> &nbsp; &nbsp;
            <div>
                <a href="# " className='color-primary'>Apple Inc. [AAPL]</a> &nbsp; &nbsp;
                <a href="# " className='color-primary'>Adobe Inc. [ADBE]</a>&nbsp; &nbsp;
                <a className='color-primary' href="# ">Amazon.com, Inc. [AMZN]</a>
            </div>
        </div>
    )

    const renderOptionTicker = () => (
        LIST_TICKER_INFOR_MOCK_DATA.map((item: ITickerInfo, index: number) => (
            <option key={index} value={item.symbolId}>{item.tickerName} ({item.ticker})</option>
        ))
    )

    const handleSelectTicker = (event: any) => {
        setTicker(event.target.value);
        handleTicker(event.target.value);
    }

    const _renderTemplate = () => (
        <div className="row g-2 align-items-end">
            <div className="col-lg-2 col-md-3 mb-1 mb-md-0">
                <label className="d-block text-secondary">Ticker <span className="text-danger ">*</span></label>
            </div>
            <div className="col-lg-3 col-md-6">
                <select className="form-select form-select-sm" value={ticker} onChange={handleSelectTicker}>
                    <option value=''></option>
                    {renderOptionTicker()}
                </select>
            </div>
            <div className="col-lg-1 col-md-3 mb-2 mb-md-0 ">
                <a href="# " className="btn btn-sm d-block btn-primary-custom "><strong>Search</strong></a>
            </div>
            <div className="col-lg-6">
                {_renderRecentSearch()}
            </div>
        </div>
    )

    return <div className="card-body bg-gradient-light">
        {_renderTemplate()}
    </div>
}

TickerSearch.defaultProps = defaultProps;

export default TickerSearch