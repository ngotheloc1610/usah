import { ISymbolMultiOrder } from "../../interfaces/order.interface";
import Types from "../types";

export const keepListOrder = (payload: ISymbolMultiOrder[]) => ({
    type: Types.LIST_ORDER,
    payload
})