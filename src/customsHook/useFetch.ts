import axios from "axios";
import { useEffect, useState } from "react";
import { API_GET_ACCOUNT_BY_TEAM_CODE } from "../constants/api.constant";
import {  IRespListAccId } from "../interfaces/order.interface";
import { notFound, success } from "../constants";
import { defindConfigPost } from "../helper/utils";
import { TEAM_CODE } from "../constants/general.constant";

function useFetch() {
    const api_url = window.globalThis.apiUrl;
    const urlGetAccountId = `${api_url}${API_GET_ACCOUNT_BY_TEAM_CODE}`;
    const teamCode = localStorage.getItem(TEAM_CODE) || ''
    const [listAccId, setListAccId] = useState<string[]>([])
    const [isShowAccInputBox, setIsShowAccInputBox] = useState(false)

    useEffect(() => {
        if(teamCode && teamCode !== 'null') {
            axios.post<IRespListAccId, IRespListAccId>(urlGetAccountId, {}, defindConfigPost()).then((resp: IRespListAccId) => {
                if(resp.status === success) {
                    setIsShowAccInputBox(true)
                    const listAccId = resp?.data?.data?.map(item => item.account_id )
                    setListAccId(listAccId)
                }
                if (resp.status === notFound) {
                    setIsShowAccInputBox(false)
                }
            })
        }
    }, [])

    return { listAccId, isShowAccInputBox}
}

export default useFetch;