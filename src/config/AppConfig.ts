import { AxiosRequestConfig } from "axios";

const axios: AxiosRequestConfig = {
  baseURL: window.globalThis.wsUrl,
  responseType: 'json',
  timeout: 30000,
}

export default {
  axios
};
