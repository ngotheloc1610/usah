import { KEY_LOCAL_STORAGE } from "./general.constant";

export const api_login = '/v1/auth/login';

export const get_api_news = '/v1/market/news';

export const BearerToken = {
    headers: { Authorization: `Bearer ${localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` },
}