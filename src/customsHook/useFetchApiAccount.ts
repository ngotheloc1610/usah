import { useEffect, useState } from "react";
import axios from "axios";

import {  IRespListAccId } from "../interfaces/order.interface";
import { defindConfigPost } from "../helper/utils";

import { success } from "../constants";
import { API_GET_ACCOUNT_BY_TEAM_CODE } from "../constants/api.constant";
import { TEAM_CODE } from "../constants/general.constant";

function useFetchApiAccount() {
    const api_url = window.globalThis.apiUrl;
    const urlGetAccountId = `${api_url}${API_GET_ACCOUNT_BY_TEAM_CODE}`;

    const [listAccId, setListAccId] = useState<string[]>([]);
    const [isShowAccountId, setIsShowAccountId] = useState<boolean>(false);

    const teamCode = sessionStorage.getItem(TEAM_CODE) || ''

    useEffect(() => {
        if(teamCode && teamCode !== 'null') {
            axios.post<IRespListAccId, IRespListAccId>(urlGetAccountId, {}, defindConfigPost())
                .then((resp: IRespListAccId) => {
                    if(resp.status === success) {
                        const listAccId = resp?.data?.data?.map(item => item.account_id );
                        setListAccId(listAccId);
                        if(listAccId.length > 0) setIsShowAccountId(true);
                    }
                })
                .catch((error) => {
                    console.log("Error Call API List AccountID", error);
                })
        }
    }, [])

    return { listAccId, isShowAccountId}
}

export default useFetchApiAccount;