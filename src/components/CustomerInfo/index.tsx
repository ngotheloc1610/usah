const CustomerInfomation = () => {

    const _renderNomalContent = (title: string, content: string) => (
        <div className="row mb-2 mb-md-0">
            <div className="col-md-3">
                <label className="text-secondary">{title}</label>
            </div>
            <div className="col-md-8">
                <strong>{content}</strong>
            </div>
        </div>
    )

    const _renderContactUs = () => (
        <>
            {_renderNomalContent('Account holder', 'Deng Ming')}
            <div className="row mb-2 mb-md-0">
                <div className="col-md-3">
                    <label className="text-secondary">Email</label>
                </div>
                <div className="col-md-8">
                    <strong><a href="mailto:markt@phillip.com.sg">markt@phillip.com.sg</a></strong>
                </div>
            </div>
            <div className="row mb-2 mb-md-0">
                <div className="col-md-3">
                    <label className="text-secondary">Phone</label>
                </div>
                <div className="col-md-8">
                    <strong><a href="tel:+6534972334">(+65) 349 723 34</a></strong>
                </div>
            </div>
        </>
    )

    const _renderTemplateCustomerInfo = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Customer Infomation</h6>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Account holder</label>
                        </div>
                        <div className="col-md-8">
                            <strong>Deng Ming</strong>
                        </div>
                    </div>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Email</label>
                        </div>
                        <div className="col-md-8">
                            <strong><a href="mailto:dengmi@amir.broker">dengmi@amir.broker</a></strong>
                        </div>
                    </div>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Phone</label>
                        </div>
                        <div className="col-md-8">
                            <strong><a href="tel:+6595559952">(+65) 955 599 52</a></strong>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Maintenance Center</h6>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Account holder</label>
                        </div>
                        <div className="col-md-8">
                            <strong>TDT Asia</strong>
                        </div>
                    </div>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Email</label>
                        </div>
                        <div className="col-md-8">
                            <strong><a href="mailto:maintenace@tdt.asia">maintenace@tdt.asia</a></strong>
                        </div>
                    </div>
                    <div className="row mb-2 mb-md-0">
                        <div className="col-md-3">
                            <label className="text-secondary">Phone</label>
                        </div>
                        <div className="col-md-8">
                            <strong><a href="tel:+942477348572">(+84) 24 7734 8572</a></strong>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Contact Us</h6>
                    {_renderContactUs()}
                </div>
            </div>
        </div>
    )

    return <>{_renderTemplateCustomerInfo()}</>
}

export default CustomerInfomation