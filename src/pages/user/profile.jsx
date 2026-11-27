import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getUserProfile, updateUserProfile } from "../../services/authService";

import { setCredentials } from "../../features/auth/authSlice";

function Profile() {
  const user = useSelector(function (state) {
    return state.auth.user;
  });

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Fetch user profile
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", user?.id],

    queryFn: function () {
      return getUserProfile(user.id);
    },

    enabled: !!user?.id,
  });

  // Update profile
  const updateMutation = useMutation({
    mutationFn: function (userData) {
      return updateUserProfile(user.id, userData);
    },

    onSuccess: function (updatedUser) {
      // Update Redux authentication data
      dispatch(setCredentials(updatedUser));

      // Refresh profile data
      queryClient.invalidateQueries({
        queryKey: ["profile", user.id],
      });

      setIsEditing(false);

      toast.success("Profile updated successfully!");
    },

    onError: function () {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  // Handle input changes
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  // Open Edit Form
  function handleEdit() {
    setFormData({
      fullName: data.fullName || "",
      phone: data.phone || "",
      address: data.address || "",
    });

    setIsEditing(true);
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    updateMutation.mutate(formData);
  }

  // Cancel Editing
  function handleCancel() {
    setIsEditing(false);

    setFormData({
      fullName: data.fullName || "",
      phone: data.phone || "",
      address: data.address || "",
    });
  }

  // Loading State
  if (isLoading) {
    return <p className="text-center py-20">Loading profile...</p>;
  }

  // Error State
  if (isError || !data) {
    return (
      <p className="text-center py-20 text-red-600">Failed to load profile.</p>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-8">My Profile</h1>

        {!isEditing ? (
          // PROFILE VIEW
          <div className="space-y-5">
            <div>
              <p className="text-gray-500">Full Name</p>
              <p className="font-semibold">{data.fullName}</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold">{data.email}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-semibold">{data.phone || "Not added"}</p>
            </div>

            <div>
              <p className="text-gray-500">Saved Delivery Address</p>
              <p className="font-semibold whitespace-pre-line">
                {data.address || "Not added"}
              </p>
            </div>

            <button
              onClick={handleEdit}
              className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-900"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          // PROFILE EDIT FORM
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Full Name</label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Phone</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Delivery Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Enter your complete delivery address"
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <p className="text-sm text-gray-500">
              Your saved delivery address will automatically appear when you
              proceed to checkout.
            </p>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-900 disabled:bg-gray-400"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="border px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default Profile;
