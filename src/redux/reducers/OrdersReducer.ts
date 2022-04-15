import { AnyAction } from "redux";
import Types from "../types";

const initState = {
    listOrderMultiOrder: []
  };
  
  const OrdersReducer = (state = initState, action: AnyAction) => {
    const {type, payload} = action;
    switch (type) {
      case Types.LIST_ORDER_MULTI_ORDER:
        return {
          ...state,
          listOrderMultiOrder: payload
        }
  
      default:
        return state;
    }
  };
  
  export default OrdersReducer;
  