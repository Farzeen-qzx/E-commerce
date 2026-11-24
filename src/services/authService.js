import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Register a new user
export async function registerUser(userData) {

    const response = await axios.get(`${API_URL}/users`, {
        params: {
            email: userData.email
        }
    });

    if (response.data.length > 0) {
        throw new Error("Email already registered");
    }

    const result = await axios.post(`${API_URL}/users`, userData);

    return {
        id: result.data.id,
        fullName: result.data.fullName,
        email: result.data.email
    };
}

// Login an existing user
export async function loginUser(email, password) {

    const response = await axios.get(`${API_URL}/users`, {
        params: {
            email: email
        }
    });

    const foundUser = response.data.find(function(item) {
        return item.password === password;
    });

    if (!foundUser) {
        throw new Error("Invalid email or password");
    }

    // Check whether the user is blocked
    if (foundUser.isBlocked === true) {
        throw new Error("Your account has been blocked. Please contact support.");
    }

    return {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email
    };
}

// Get user profile
export async function getUserProfile(userId) {

    const response = await axios.get(`${API_URL}/users/${userId}`);

    return {
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone || "",
        address: response.data.address || ""
    };
}

// Update user profile
export async function updateUserProfile(userId, userData) {

    const response = await axios.patch(
        `${API_URL}/users/${userId}`,
        userData
    );

    return {
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone || "",
        address: response.data.address || ""
    };
}