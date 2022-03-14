import { useState } from 'react';
import ContentSearch from '../../../Common/ContentSearch'
import ListModifyCancel from '../../../components/Orders/LIstModifyCancel'
import './OrderModifyCancel.scss'
const OrderModifyCancel = () => {
    const [orderSide, setOrderSide] = useState(0);
    const [symbolCode, setSymbolCode] = useState('');

    const getParamSearch = (symbolCode: string, orderSide: number) => {
        setOrderSide(orderSide);
        setSymbolCode(symbolCode);
    }
    
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Modify - Cancel Order</h6>
                </div>
                <ContentSearch getParamSearch={getParamSearch} />
                <ListModifyCancel orderSide={orderSide} symbolCode={symbolCode}/>
            </div>
        </div>
    </div>
}
export default OrderModifyCancel