import axios from "axios";
import * as UrlApi from "../url";

export const UserService = {
  postAuthLogin: (email, password) => {
    return axios({
      url: UrlApi.URL_AUTH_LOGIN,
      method: "POST",
      data: {
        email: email,
        password: password,
      },
    });
  },
  forgotPassword: (email) => {
    return axios({
      url: UrlApi.URL_FORGOT_PASSWORD,
      method: "POST",
      data: {
        email: email,
      },
    });
  },
  resetPassword: (token, password) => {
    return axios({
      url: UrlApi.URL_RESET_PASSWORD,
      method: "POST",
      data: {
        token: token,
        password: password,
      },
    });
  },
};
