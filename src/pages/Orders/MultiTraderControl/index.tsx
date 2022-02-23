import MultiTraderTable from "./MultiTraderTable"

function MultiTraderControl() {

    const _renderTemplate = () => (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header">
                            <h6 className="card-title fs-6 mb-0">Multi Trader Control</h6>
                        </div>
                        <div className="card-body">
                            <MultiTraderTable />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
        {_renderTemplate()}
    </>
}

export default MultiTraderControl