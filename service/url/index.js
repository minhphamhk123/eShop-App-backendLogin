export const DOMAIN_NAME = "http://localhost";

// AUTH
export const URL_AUTH_LOGIN = `${DOMAIN_NAME}/auth/login`;
export const URL_FORGOT_PASSWORD = `${DOMAIN_NAME}/auth/forgot-password`;
export const URL_RESET_PASSWORD = `${DOMAIN_NAME}/auth/reset-password`;

//USERS
export const URL_USERS = `${DOMAIN_NAME}/users`;
export const URL_USERS_ID = (id) => `${DOMAIN_NAME}/users/${id}`;

//PRODUCT-ITEMS - Sản phẩm
export const URL_PRODUCT_ITEM = `${DOMAIN_NAME}/product-items`;
export const URL_PRODUCT_ITEM_ID = (id) => `${DOMAIN_NAME}/product-items/${id}`;