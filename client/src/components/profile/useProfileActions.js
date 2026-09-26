import { useState } from "react";
import axios from "../../config/axiosInstance.js";

import { API_URL } from "../../config/api.js";

export function useProfileActions({ updateUser, logout, navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Runs an API action with loading/error/success feedback; resolves to true on success
  const withFeedback = async (fn, successMsg) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await fn();
      setSuccess(successMsg);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = ({ username, bio, avatarFile, name }) => {
    if (!name) {
      setError("Name is required");
      return Promise.resolve(false);
    }

    return withFeedback(async () => {
      const { data } = await axios.put(`${API_URL}/profile/update`, {
        username,
        bio,
        avatar: avatarFile,
        name,
      });
      updateUser(data.user);
    }, "Profile updated!");
  };

  const deleteAccount = async (confirmText) => {
    if (confirmText !== "DELETE") return setError("Type DELETE to confirm");
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/profile/delete`);
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    setError,
    setSuccess,
    updateProfile,
    deleteAccount,
  };
}
