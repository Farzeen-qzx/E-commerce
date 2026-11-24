import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/products";

export function fetchProducts() {
    return axios.get(API_URL);
}