import { AnyAction } from "redux";
import Types from "../types";

const initState = {
    warningMessage: '',
    enableFlag: false
};

const AppReducer = (state = initState, action: AnyAction) => {
    const { type, payload } = action;
    switch (type) {
        case Types.WARNING_MESSAGE:
            return {
                ...state,
                warningMessage: payload.warningMessage,
                enableFlag: payload.enableFlag
            };

        default:
            return state;
    }
};

export default AppReducer;
