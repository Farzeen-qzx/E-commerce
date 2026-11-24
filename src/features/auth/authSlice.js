import { createSlice } from "@reduxjs/toolkit";

function getSavedUser() {
    const savedUser = localStorage.getItem("trailnestUser");

    if (savedUser) {
        try {
            return JSON.parse(savedUser);
        } catch {
       localStorage.removeItem("trailnestUser");
     } 
    }

    return null;
}

const authSlice = createSlice({
    name: "auth",

    initialState: {
        user: getSavedUser()
    },

    reducers: {
        setCredentials: function(state, action) {
            state.user = action.payload;

            localStorage.setItem(
                "trailnestUser",
                JSON.stringify(action.payload)
            );
        },

        logout: function(state) {
            state.user = null;

            localStorage.removeItem("trailnestUser");
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;