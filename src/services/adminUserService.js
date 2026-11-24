import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/users";

// Fetch all users
export function getAdminUsers() {
    return axios.get(API_URL);
}

// Block or unblock a user
export function updateUserStatus({ id, isBlocked }) {
    return axios.patch(`${API_URL}/${id}`, {
        isBlocked: isBlocked
    });
}