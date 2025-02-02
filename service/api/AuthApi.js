import axios from "axios";
import * as UrlApi from "../url/index.js";
import { errorHandler } from '../../utils/error.js';

export const UserService = {
  postAuthRegisterCustomer: ( username, email, password, firstName, lastName, phoneNumber, id) => {
    return axios({
      url: UrlApi.URL_AUTH_REGISTER_CUSTOMER,
      method: "POST",
      data: {
        emailId: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        mobileNo: phoneNumber,
        userName: username,
        mongoDbID: id,
      },
    }).then(() => { return null }).catch((error) => {
      // Handle error response
      if (error.response) {
        // Server responded with an error
        const responseData = error.response.data;
        if (responseData && responseData.message) {
          // Display error message to the user
          console.error("Message: " + responseData.message);
        } else {
          console.error("Error: Unknown error response");
        }
      } else if (error.request) {
        // No response received from the server
        console.error("Error: No response received from the server");
      } else {
        // Error during request setup
        console.error("Error:", error.message);
      }
    });
  },
  postAuthLoginCustomer: (token, email, password) => {
    return axios({
      url: UrlApi.URL_AUTH_LOGIN_CUSTOMER,
      method: "POST",
      data: {
        preToken: token,
        emailId: email,
        password: password,
      },
    }).then(() => { return null }).catch(error => {
      // Handle error response
      if (error.response) {
        // Server responded with an error
        const responseData = error.response.data;
        if (responseData && responseData.message) {
          // Display error message to the user
          console.error("Message: " + responseData.message);
          return responseData.message;
        } else {
          console.error("Error: Unknown error response");
          return "Error: Unknown error response";
        }
      } else if (error.request) {
        // No response received from the server
        console.error("Error: No response received from the server");
      } else {
        // Error during request setup
        console.error("Error:", error.message);
      }
    });
  },
  postAuthLogoutCustomer: (token) => {
    return axios({
      url: UrlApi.URL_AUTH_LOGOUT_CUSTOMER,
      method: "POST",
      data: {
        token: token,
      },
    }).then(()=>{return null}).catch(error => {
      // Handle error response
      if (error.response) {
        // Server responded with an error
        const responseData = error.response.data;
        if (responseData && responseData.message) {
          // Display error message to the user
          console.error("Message: " + responseData.message);
          return responseData.message;
        } else {
          console.error("Error: Unknown error response");
          return "Error: Unknown error response";
        }
      } else if (error.request) {
        // No response received from the server
        console.error("Error: No response received from the server");
      } else {
        // Error during request setup
        console.error("Error:", error.message);
      }
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

import grpc from '@grpc/grpc-js';
import protoLoader from'@grpc/proto-loader';

// Tải file proto
const packageDefinition = protoLoader.loadSync('./proto/auth.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Tạo một instance client gRPC
const client = new authProto.AuthService('localhost:50051', grpc.credentials.createInsecure());

export const postAuthLoginCustomergRPC = (token, email, password) => {
  return new Promise((resolve, reject) => {
    const request = {
      preToken: token,
      emailId: email,
      password: password
    };

    client.loginCustomer(request, (error, response) => {
      if (error) {
        // Xử lý lỗi
        if (error.code) {
          // gRPC error code
          console.error('gRPC Error:', error.message);
          reject(error.message);
        } else {
          // Unknown error
          console.error('Error:', error.message);
          reject('Error: Unknown error response');
        }
      } else {
        // Xử lý phản hồi thành công
        resolve(response.message);
      }
    });
  });
};

// // Sử dụng ví dụ
// postAuthLoginCustomergRPC('some-token', 'email@example.com', 'password123')
//   .then(message => {
//     console.log('Login successful:', message);
//   })
//   .catch(error => {
//     console.error('Login failed:', error);
//   });

