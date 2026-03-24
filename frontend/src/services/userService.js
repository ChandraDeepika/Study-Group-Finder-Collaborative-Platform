import api from "./api";

/**
 * =========================================
 * User Service - Production Grade
 * Handles all user & profile related APIs
 * Includes normalization, error handling,
 * security validation & scalability hooks
 * =========================================
 */

/* =====================================
   PRIVATE HELPERS
===================================== */

/**
 * Normalize user structure
 */
const normalizeUser = (user) => ({
  id: user?.id,
  name: user?.name || "",
  email: user?.email || "",
  bio: user?.bio || "",
  avatarUrl: user?.avatarUrl || null,
  role: user?.role || "USER",
  createdAt: user?.createdAt || null,
});

/**
 * Centralized error handler
 */
const handleError = (error) => {
  console.error("User Service Error:", error);

  if (error.response) {
    throw new Error(
      error.response.data?.error ||
        `Server Error (${error.response.status})`
    );
  } else if (error.request) {
    throw new Error("Server not reachable. Please try again.");
  } else {
    throw new Error("Unexpected error occurred.");
  }
};

/* =====================================
   PROFILE MANAGEMENT
===================================== */

/**
 * Get logged-in user profile
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/profile/me");
    return normalizeUser(response.data);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/profile", profileData);
    return normalizeUser(response.data);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Upload profile avatar
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/* =====================================
   SECURITY & ACCOUNT MANAGEMENT
===================================== */

/**
 * Change user password
 */
export const changePassword = async (
  currentPassword,
  newPassword
) => {
  try {
    if (!currentPassword || !newPassword) {
      throw new Error("Password fields required");
    }

    return await api.put("/profile/change-password", {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async () => {
  try {
    return await api.delete("/profile");
  } catch (error) {
    handleError(error);
  }
};

/* =====================================
   USER DISCOVERY (Peer Suggestion)
===================================== */

/**
 * Search users by name or keyword
 */
export const searchUsers = async (query) => {
  try {
    const response = await api.get("/users/search", {
      params: { q: query },
    });

    return (response.data || []).map(normalizeUser);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get suggested peers
 */
export const getSuggestedPeers = async () => {
  try {
    const response = await api.get("/users/suggestions");
    return (response.data || []).map(normalizeUser);
  } catch (error) {
    handleError(error);
  }
};