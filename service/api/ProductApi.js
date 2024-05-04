import Axios from "axios";
import * as UrlApi from "../url";

export const ProductService = {
  postProduct: (newProduct) => {
    let {
      productId,
      deliveryNoteId,
      MFG,
      EXP,
      cost,
      price,
      quantity,
      description,
      image,
    } = newProduct;
    return Axios.post(UrlApi.URL_PRODUCT_ITEM, {
      productId: productId,
      deliveryNoteId: deliveryNoteId,
      MFG: MFG,
      EXP: EXP,
      cost: cost,
      price: price,
      quantity: quantity,
      description: description,
      image: image,
    });
  },
  getProduct: () => {
    return Axios.get(UrlApi.URL_PRODUCT_ITEM);
  },
  getProductById: (id) => {
    return Axios.get(UrlApi.URL_PRODUCT_ITEM_ID(id));
  },
  deleteProductById: (id) => {
    return Axios.delete(UrlApi.URL_PRODUCT_ITEM_ID(id));
  },
  putProductById: (id, productItemQuantity) => {
    let { price, description, image } = productItemQuantity;
    return Axios.put(UrlApi.URL_PRODUCT_ITEM_ID(id), {
      price: price,
      description: description,
      image: image,
    });
  },
};
