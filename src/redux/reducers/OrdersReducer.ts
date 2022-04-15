import { AnyAction } from "redux";
import Types from "../types";

const initState = {
    listOrder: []
};

const OrdersReducer = (state = initState, action: AnyAction) => {
    const { type, payload } = action;
    switch (type) {
        case Types.LIST_ORDER:
            return {
                ...state,
                listOrder: payload
            };

        default:
            return state;
    }
};

export default OrdersReducer;
