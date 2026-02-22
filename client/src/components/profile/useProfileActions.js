import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function useProfileActions({ updateUser, logout, navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = () => localStorage.getItem("accessToken");
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const withFeedback = async (fn, successMsg) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await fn();
      setSuccess(successMsg);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = ({ username, bio, avatarFile, name }) => {
    if (!name || !username) return setError("Name and username are required");
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return setError("Username must be 3–20 chars (letters, numbers, underscore)");

    withFeedback(async () => {
      const { data } = await axios.put(`${API_URL}/profile/update`,
        { username, bio, avatar: avatarFile },
        { headers: authHeader() }
      );
      updateUser(data.user);
    }, "Profile updated!");
  };

  const updateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address");

    withFeedback(async () => {
      const { data } = await axios.put(`${API_URL}/profile/update-email`,
        { email },
        { headers: authHeader() }
      );
      updateUser(data.user);
    }, "Email updated!");
  };

  const updatePassword = ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword || !newPassword || !confirmPassword) return setError("All fields are required");
    if (newPassword !== confirmPassword) return setError("Passwords don't match");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");

    withFeedback(async () => {
      await axios.put(`${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: authHeader() }
      );
    }, "Password changed!");
  };

  const deleteAccount = async (confirmText) => {
    if (confirmText !== "DELETE") return setError("Type DELETE to confirm");
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/profile/delete`, { headers: authHeader() });
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, setError, setSuccess, updateProfile, updateEmail, updatePassword, deleteAccount };
}