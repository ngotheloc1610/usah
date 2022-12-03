import { useState } from 'react';
import ContentSearch from '../../../Common/ContentSearch'
import ListModifyCancel from '../../../components/Orders/LIstModifyCancel'
import tmpb from '../../../models/proto/trading_model_pb';
import './OrderModifyCancel.scss'
const OrderModifyCancel = () => {
    const tradingModel: any = tmpb;
    const [orderSide, setOrderSide] = useState(0);
    const [symbolCode, setSymbolCode] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [orderType, setOrerType] = useState(tradingModel.OrderType.OP_NONE);

    const getParamSearch = (symbolCode: string, orderSide: number, orderType: number) => {
        setOrderSide(orderSide);
        setSymbolCode(symbolCode);
        setIsSearch(true);
        setOrerType(orderType);
    }

    const resetIsSearch = (value: boolean) => {
        setIsSearch(value);
    }
    
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Modify - Cancel Order</h6>
                </div>
                <ContentSearch getParamSearch={getParamSearch} />
                <ListModifyCancel orderSide={orderSide} symbolCode={symbolCode} orderType={orderType} isSearch={isSearch} resetIsSearch={resetIsSearch} />
            </div>
        </div>
    </div>
}
export default OrderModifyCancel