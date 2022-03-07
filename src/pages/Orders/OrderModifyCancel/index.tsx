import { useState } from 'react';
import ContentSearch from '../../../Common/ContentSearch'
import ListModifyCancel from '../../../components/Orders/LIstModifyCancel'
import './OrderModifyCancel.scss'
const OrderModifyCancel = () => {
    const [orderSide, setOrderSide] = useState(0);

    const getOrderSide = (item: number) => {
        setOrderSide(item)
    }
    
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Modify - Cancel Order</h6>
                </div>
                <ContentSearch getOrderSide={getOrderSide} />
                <ListModifyCancel orderSide={orderSide} />
            </div>
        </div>
    </div>
}
export default OrderModifyCancel