
const ContentSearch = () => {
    return <div>
        <div className="card-body bg-gradient-light mb-3">
            <div className="row g-2 align-items-end">

                <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <label className="d-block text-secondary mb-1">Ticker</label>
                    <input type="text" className="form-control form-control-sm" value="" placeholder="" />
                </div>

                <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <label className="d-block text-secondary mb-1">Side</label>
                    <div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="buy" value="buy" />
                            <label className="form-check-label">Buy</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="sell" value="sell" />
                            <label className="form-check-label">Sell</label>
                        </div>
                    </div>

                </div>

                <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <div className="col-xl-2 mb-2 mb-xl-0">
                        <a href="#" className="btn btn-sm d-block btn-primary text-nowrap"><strong>Search</strong></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
export default ContentSearch