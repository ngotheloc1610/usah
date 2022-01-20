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

    const _renderCustomerInfor = () => (
        <>
            {_renderNomalContent('Account holder', 'Deng Ming')}
            {_renderLinkContent('Email', 'dengmi@amir.broker', 'mailto:dengmi@amir.broker')}
            {_renderLinkContent('Phone', '(+65) 955 599 52', 'tel:+6595559952')}
        </>
    )

    const _renderTemplateCustomerInfo = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <div className="mb-4">
                    <h6 className="c-title text-primary bg-light px-2 py-1">Customer Infomation</h6>
                    {_renderCustomerInfor()}
                </div>
            </div>
        </div>
    )

    return <>{_renderTemplateCustomerInfo()}</>
}

export default CustomerInfomation