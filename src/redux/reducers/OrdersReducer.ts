import { AnyAction } from "redux";
import Types from "../types";
import { DEFAULT_TIME_MAP_VALUE } from "../../constants/general.constant";

const initState = {
    listOrder: [],
    marketName: "",
    timMapSession: DEFAULT_TIME_MAP_VALUE,
    dstTime: "",
};

const OrdersReducer = (state = initState, action: AnyAction) => {
    const { type, payload } = action;
    switch (type) {
        case Types.LIST_ORDER: {
            return {
                ...state,
                listOrder: payload
            };
        }

        case Types.MARKET_NAME: {
            return {
                ...state,
                marketName: payload
            }
        }

        case Types.TIME_MAP_SESSIONS: {
            return {
                ...state,
                timMapSession: payload
            }
        }

        case Types.DST_TIME: {
            return {
                ...state,
                dstTime: payload
            }
        }

        default:
            return state;
    }
};

export default OrdersReducer;
