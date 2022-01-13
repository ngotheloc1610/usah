import '../../pages/CustomerInfo/CustomerInfo.scss';
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

    const _renderLinkContent = (title: string, content: string, link: string) => (
        <div className="row mb-2 mb-md-0">
            <div className="col-md-3">
                <label className="text-secondary">{title}</label>
            </div>
            <div className="col-md-8">
                <strong><a href={link}>{content}</a></strong>
            </div>
        </div>
    )

    const _renderContactUs = () => (
        <>
            {_renderNomalContent('Person in charge', 'Mark Twain')}
            {_renderLinkContent('Email', 'markt@phillip.com.sg', 'mailto:markt@phillip.com.sg')}
            {_renderLinkContent('Phone', '(+65) 349 723 34', 'tel:+6534972334')}
        </>
    )

    const _renderCustomerInfor = () => (
        <>
            {_renderNomalContent('Account holder', 'Deng Ming')}
            {_renderLinkContent('Email', 'dengmi@amir.broker', 'mailto:dengmi@amir.broker')}
            {_renderLinkContent('Phone', '(+65) 955 599 52', 'tel:+6595559952')}
        </>
    )

    const _renderMaintenanceCenter = () => (
        <>
            {_renderNomalContent('Account holder', 'TDT Asia')}
            {_renderLinkContent('Email', 'maintenace@tdt.asia', 'mailto:maintenace@tdt.asia')}
            {_renderLinkContent('Phone', '(+84) 24 7734 8572', 'tel:+842477348572')}
        </>
    )

    const _renderTemplateCustomerInfo = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Customer Infomation</h6>
                    {_renderCustomerInfor()}
                </div>
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Maintenance Center</h6>
                    {_renderMaintenanceCenter()}
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