import API from './configAPI';

export default {
  loginPhone(params: {phone_number: string; token: string; device_id: string}) {
    const url = '/patients/auth/login/';
    const mParams = {
      phone_number: params.phone_number,
      token: params.token,
      device_id: params.device_id,
    };
    return API.post(url, mParams, {});
  },

  getInformation(token: string) {
    const url = '/doctors/me/info/';
    return API.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
