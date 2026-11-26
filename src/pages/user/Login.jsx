import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { loginUser } from "../../services/authService";
import { adminLogin } from "../../services/adminService";

import { setCredentials, logout } from "../../features/auth/authSlice";

import {
  setAdminCredentials,
  adminLogout,
} from "../../features/adminAuth/adminAuthSlice";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async function () {
      // First check admin
      const response = await adminLogin({
        email: formData.email,
        password: formData.password,
      });

      // If admin exists
      if (response.data.length > 0) {
        return {
          role: "admin",
          account: response.data[0],
        };
      }

      // Otherwise check user
      const user = await loginUser(formData.email, formData.password);

      return {
        role: "user",
        account: user,
      };
    },

    onSuccess: function (result) {
      if (result.role === "admin") {
        // Clear previous user authentication
        dispatch(logout());

        // Save admin credentials
        dispatch(setAdminCredentials(result.account));

        navigate("/admin/dashboard", {
          replace: true,
          state: {
            toastMessage: "Admin login successful!",
          },
        });
      } else {
        // Clear previous admin authentication
        dispatch(adminLogout());

        // Save user credentials
        dispatch(setCredentials(result.account));

        const requestedPath = location.state?.from?.pathname;

        const redirectPath =
          requestedPath && !requestedPath.startsWith("/admin")
            ? requestedPath
            : "/";

        navigate(redirectPath, {
          replace: true,
          state: {
            toastMessage: "Login successful! Welcome back to TrailNest.",
          },
        });
      }
    },

    onError: function (error) {
      setError(error.message || "Invalid email or password");
    },
  });

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    loginMutation.mutate();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Welcome Back</h1>

          <p className="text-gray-500 mt-2">
            Login to continue your adventure with TrailNest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-green-800 text-white py-3 rounded-lg font-semibold hover:bg-green-900 transition disabled:opacity-50"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-800 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
