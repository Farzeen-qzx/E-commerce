import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export function fetchCart(userId) {
  return axios.get(`${API_URL}/cart`, {
    params: {
      userId: userId,
    },
  });
}

export function addCartItem(cartData) {
  return axios.post(`${API_URL}/cart`, cartData);
}

export function updateCartItem(id, updatedData) {
  return axios.patch(`${API_URL}/cart/${id}`, updatedData);
}

export function removeCartItem(id) {
  return axios.delete(`${API_URL}/cart/${id}`);
}

export function clearUserCart(userId) {
  return fetchCart(userId).then(function (response) {
    return Promise.all(
      response.data.map(function (item) {
        return removeCartItem(item.id);
      }),
    );
  });
}
