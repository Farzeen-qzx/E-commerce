
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/products";

export function getAdminProducts() {
    return axios.get(API_URL);
}

export function addAdminProduct(product) {
    return axios.post(API_URL, product);
}

export function updateAdminProduct({ id, product }) {
    return axios.patch(`${API_URL}/${id}`, product);
}

export function deleteAdminProduct(id) {
    return axios.delete(`${API_URL}/${id}`);
}
