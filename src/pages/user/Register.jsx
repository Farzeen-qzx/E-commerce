import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { registerUser } from "../../services/authService";
import { setCredentials } from "../../features/auth/authSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: function (userData) {
      return registerUser(userData);
    },

    onSuccess: function (user) {
      dispatch(setCredentials(user));

      navigate("/", {
        replace: true,
        state: {
          toastMessage: "Registration successful! Welcome to TrailNest.",
        },
      });
    },

    onError: function (error) {
      setError(error.message || "Registration failed");
    },
  });

  // Handle input changes
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
  }

  // Validate registration form
  function validateForm() {
    const name = formData.fullName.trim();
    const email = formData.email.trim();

    // Name validation
    const nameRegex = /^[A-Za-z][A-Za-z\s'-]{2,}$/;

    if (!nameRegex.test(name)) {
      return "Name must contain at least 3 letters and only letters, spaces, hyphens or apostrophes.";
    }

    // Email validation - must end with .com
    const emailRegex =
      /^[A-Z0-9._%+-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)*\.com$/i;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address ending with .com.";
    }

    // Password length
    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    // Uppercase validation
    if (!/[A-Z]/.test(formData.password)) {
      return "Password must contain at least one uppercase letter.";
    }

    // Lowercase validation
    if (!/[a-z]/.test(formData.password)) {
      return "Password must contain at least one lowercase letter.";
    }

    // Number validation
    if (!/[0-9]/.test(formData.password)) {
      return "Password must contain at least one number.";
    }

    // Special character validation
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(formData.password)) {
      return "Password must contain at least one special character.";
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    registerMutation.mutate({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  }

  return (
    <section className="min-h-screen bg-gray-50 flex justify-center items-center px-6 py-12">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-green-800 text-center">
          Join TrailNest
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Create your account and start exploring.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label className="font-medium">Full Name</label>

          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full border p-3 rounded-lg mt-2 mb-5"
          />

          <label className="font-medium">Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email (.com only)"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full border p-3 rounded-lg mt-2 mb-5"
          />

          <label className="font-medium">Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="w-full border p-3 rounded-lg mt-2 mb-2"
          />

          <p className="text-xs text-gray-500 mb-5">
            Minimum 8 characters, uppercase, lowercase, number and special
            character.
          </p>

          <label className="font-medium">Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="w-full border p-3 rounded-lg mt-2 mb-5"
          />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-green-800 text-white py-3 rounded-lg font-semibold hover:bg-green-900 transition disabled:bg-gray-400"
          >
            {registerMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-800 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
