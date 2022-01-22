import '../../pages/CustomerInfo/CustomerInfo.scss';
import { IAccountDetail } from '../../interfaces/customerInfo.interface'
interface IPropsCustomerInfo {
    customerInfoDetail: IAccountDetail
}

const CustomerInfomation = (props: IPropsCustomerInfo) => {
    const { customerInfoDetail } = props

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
            {_renderNomalContent('Account holder', customerInfoDetail.name)}
            {_renderLinkContent('Email', customerInfoDetail.email, `mailto:${customerInfoDetail.email}`)}
            {_renderLinkContent('Phone', customerInfoDetail.phone, `tel:${customerInfoDetail.phone}`)}
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