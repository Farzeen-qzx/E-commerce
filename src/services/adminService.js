import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/admins";

export function adminLogin(credentials) {
    return axios.get(API_URL, {
        params: {
            email: credentials.email,
            password: credentials.password
        }
    });
}