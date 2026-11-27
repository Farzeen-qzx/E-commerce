import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// REGISTER USER
export async function registerUser(userData) {
  // Check whether email already exists
  const response = await axios.get(`${API_URL}/users`, {
    params: {
      email: userData.email,
    },
  });

  if (response.data.length > 0) {
    throw new Error("Email already exists.");
  }

  // Create new user
  const newUser = {
    fullName: userData.fullName,
    email: userData.email,
    password: userData.password,
  };

  const registerResponse = await axios.post(`${API_URL}/users`, newUser);

  return {
    id: registerResponse.data.id,
    fullName: registerResponse.data.fullName,
    email: registerResponse.data.email,
  };
}

// LOGIN USER
export async function loginUser(email, password) {
  const response = await axios.get(`${API_URL}/users`, {
    params: {
      email: email,
    },
  });

  const user = response.data.find(function (item) {
    return item.password === password;
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Check whether user is blocked
  if (user.isBlocked === true) {
    throw new Error("Your account has been blocked.");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

// GET USER PROFILE
export async function getUserProfile(userId) {
  const response = await axios.get(`${API_URL}/users/${userId}`);

  return {
    id: response.data.id,
    fullName: response.data.fullName,
    email: response.data.email,
    phone: response.data.phone || "",
    address: response.data.address || "",
  };
}

// UPDATE USER PROFILE
export async function updateUserProfile(userId, userData) {
  const response = await axios.patch(`${API_URL}/users/${userId}`, {
    fullName: userData.fullName,
    phone: userData.phone,
    address: userData.address,
  });

  return {
    id: response.data.id,
    fullName: response.data.fullName,
    email: response.data.email,
    phone: response.data.phone || "",
    address: response.data.address || "",
  };
}
