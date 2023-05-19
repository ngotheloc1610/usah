import { useCallback, useState } from 'react';
import ContentSearch from '../../../Common/ContentSearch'
import ListModifyCancel from '../../../components/Orders/LIstModifyCancel'
import tmpb from '../../../models/proto/trading_model_pb';
import './OrderModifyCancel.scss'
import { IParamPendingOrder, IParamSearchPendingOrder } from '../../../interfaces';
import { ACCOUNT_ID, PAGE_SIZE_GET_ALL_ORDER_LIST, START_PAGE } from '../../../constants/general.constant';
import { DEFAULT_ITEM_PER_PAGE } from '../../../constants/order.constant';

const OrderModifyCancel = () => {
    const tradingModel: any = tmpb;
    const tradingModelPb: any = tmpb;
    const [orderSide, setOrderSide] = useState(0);
    const [symbolCode, setSymbolCode] = useState('');
    const [orderType, setOrerType] = useState(tradingModel.OrderType.OP_NONE);
    const [isSearch, setIsSearch] = useState(false);
    const accountId = localStorage.getItem(ACCOUNT_ID) || '';

    const [paramSearch, setParamSearch] = useState<IParamPendingOrder>({
        symbol_code: '',
        order_side: 0,
        order_type: tradingModelPb.OrderType.OP_NONE,
        account_id: accountId,
        page: START_PAGE, 
        page_size: PAGE_SIZE_GET_ALL_ORDER_LIST,
    });

    const [isUnAuthorised, setIsUnAuthorised] = useState(false);

    const handleUnAuthorisedAcc = useCallback((value: boolean) => {
        setIsUnAuthorised(value)
    }, [])

    const getParamSearch = useCallback((param: IParamSearchPendingOrder) => {
        const tmpParam = {
            ...paramSearch,
            ...param,
        }
        setParamSearch(tmpParam)
        setIsSearch(true);
    }, [paramSearch])

    const resetIsSearch = (value: boolean) => {
        setIsSearch(value);
    }

    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Modify - Cancel Order</h6>
                </div>
                <ContentSearch getParamSearch={getParamSearch} isUnAuthorised={isUnAuthorised}/>
                <ListModifyCancel
                    orderSide={orderSide}
                    symbolCode={symbolCode} 
                    orderType={orderType}
                    paramSearch={paramSearch}
                    isSearch={isSearch}
                    resetIsSearch={resetIsSearch}
                    handleUnAuthorisedAcc={handleUnAuthorisedAcc}
                />
            </div>
        </div>
    </div>
}
export default OrderModifyCancel