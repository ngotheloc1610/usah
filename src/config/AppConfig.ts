import { AxiosRequestConfig } from "axios";

const axios: AxiosRequestConfig = {
  baseURL: process.env.REACT_APP_BASE_URL,
  responseType: 'json',
  timeout: 30000,
}

export default {
  axios
};
