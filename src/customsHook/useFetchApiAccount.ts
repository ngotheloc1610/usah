import axios from "axios";
import { useEffect, useState } from "react";
import { API_GET_ACCOUNT_BY_TEAM_CODE } from "../constants/api.constant";
import {  IRespListAccId } from "../interfaces/order.interface";
import { notFound, success } from "../constants";
import { defindConfigPost } from "../helper/utils";

function useFetchApiAccount() {
    const api_url = window.globalThis.apiUrl;
    const urlGetAccountId = `${api_url}${API_GET_ACCOUNT_BY_TEAM_CODE}`;

    const [listAccId, setListAccId] = useState<string[]>([]);
    const [isErrorAccount, setIsErrorAccount] = useState<boolean>(false);

    useEffect(() => {
        axios.post<IRespListAccId, IRespListAccId>(urlGetAccountId, {}, defindConfigPost())
            .then((resp: IRespListAccId) => {
                console.log("resp:", resp)
                if(resp.status === success) {
                    const listAccId = resp?.data?.data?.map(item => item.account_id );
                    setListAccId(listAccId);
                    setIsErrorAccount(true);
                }
                if (resp.status === notFound) {
                    setIsErrorAccount(false);
                }
            })
            .catch((error) => {
                console.log("error:", {error})
            })
    }, [])

    return { listAccId, isErrorAccount}
}

export default useFetchApiAccount;