import { createSlice } from "@reduxjs/toolkit";

function getSavedAdmin() {
  const savedAdmin = localStorage.getItem("trailnestAdmin");

  if (savedAdmin) {
    try {
      return JSON.parse(savedAdmin);
    } catch {
      localStorage.removeItem("trailnestAdmin");
    }
  }

  return null;
}

const adminAuthSlice = createSlice({
  name: "adminAuth",

  initialState: {
    admin: getSavedAdmin(),
  },

  reducers: {
    setAdminCredentials: function (state, action) {
      state.admin = action.payload;

      localStorage.setItem("trailnestAdmin", JSON.stringify(action.payload));
    },

    adminLogout: function (state) {
      state.admin = null;

      localStorage.removeItem("trailnestAdmin");
    },
  },
});

export const { setAdminCredentials, adminLogout } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
