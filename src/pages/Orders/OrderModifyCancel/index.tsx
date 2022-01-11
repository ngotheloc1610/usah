import ContentSearch from '../../../Common/ContentSearch'
import ListModifyCancel from '../../../components/Orders/ListModifyCancel'
import './OrderModifyCancel.scss'
const OrderModifyCancel = () => {
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Modify Cancel</h6>
                </div>
                <ContentSearch />
                <ListModifyCancel />
            </div>
        </div>
    </div>
}
export default OrderModifyCancel