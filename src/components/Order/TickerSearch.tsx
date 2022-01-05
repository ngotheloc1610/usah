import '../../pages/Orders/OrderNew/OrderNew.scss'

const TickerSearch = () => {

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

    const _renderTemplate = () => (
        <div className="row g-2 align-items-end">
            <div className="col-lg-2 col-md-3 mb-1 mb-md-0">
                <label className="d-block text-secondary">Ticker <span className="text-danger ">*</span></label>
            </div>
            <div className="col-lg-3 col-md-6">
                <select className="form-select form-select-sm ">
                    <option value="0 ">Apple Inc (AAPL)</option>
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

export default TickerSearch