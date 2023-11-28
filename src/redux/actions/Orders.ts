import { ISymbolMultiOrder } from "../../interfaces/order.interface";
import Types from "../types";

export const keepListOrder = (payload: ISymbolMultiOrder[]) => ({
    type: Types.LIST_ORDER,
    payload
})

export const setMarketName = (payload: string) => ({
    type: Types.MARKET_NAME,
    payload
})

export const setTimeMapSessions = (payload: any) => ({
    type: Types.TIME_MAP_SESSIONS,
    payload
})

export const setDstTime = (payload: string) => ({
    type: Types.DST_TIME,
    payload
})
