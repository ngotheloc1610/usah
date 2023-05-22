import axios from "axios";
import { useEffect, useState } from "react";
import { API_GET_ACCOUNT_BY_TEAM_CODE } from "../constants/api.constant";
import {  IRespListAccId } from "../interfaces/order.interface";
import { badRequest, success } from "../constants";
import { defindConfigPost } from "../helper/utils";

function useFetchApiAccount() {
    const api_url = window.globalThis.apiUrl;
    const urlGetAccountId = `${api_url}${API_GET_ACCOUNT_BY_TEAM_CODE}`;

    const [listAccId, setListAccId] = useState<string[]>([]);
    const [isShowAccountId, setisShowAccountId] = useState<boolean>(false);

    useEffect(() => {
        axios.post<IRespListAccId, IRespListAccId>(urlGetAccountId, {}, defindConfigPost())
            .then((resp: IRespListAccId) => {
                if(resp.status === success) {
                    const listAccId = resp?.data?.data?.map(item => item.account_id );
                    setListAccId(listAccId);
                    setisShowAccountId(true);
                }
            })
            .catch((error) => {
                if(error.response.data.meta.code === badRequest){ 
                    setisShowAccountId(false);
                    return;
                };
            })
    }, [])

    return { listAccId, isShowAccountId}
}

export default useFetchApiAccount;