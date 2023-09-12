
import { IWarningMessage } from "../../interfaces";
import Types from "../types";

export const setWarningMessage = (payload: IWarningMessage) => ({
    type: Types.WARNING_MESSAGE,
    payload
})