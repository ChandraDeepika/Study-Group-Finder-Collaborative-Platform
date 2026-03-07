import api from "./api";

/**
 * ========================================
 * Group Service - Production Grade
 * Backend Aligned Version
 * ========================================
 */

/* =====================================
   PRIVATE HELPERS
===================================== */

/**
 * Normalize group structure
 */
const normalizeGroup = (group) => ({
  id: group?.id,
  name: group?.name || "Untitled Group",
  description: group?.description || "",
  privacy: group?.privacy || "PUBLIC",
  createdBy: group?.createdBy || null,
  membersCount: group?.membersCount ?? 0,
  createdAt: group?.createdAt || null,
});

/**
 * Centralized error handling
 */
const handleError = (error) => {
  console.error("Group Service Error:", error);

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
   GROUP CRUD
===================================== */

/**
 * Create a new group
 */
export const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return normalizeGroup(response.data);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get all groups OR filtered groups
 * Uses query params instead of /search
 */
export const getGroups = async (filters = {}) => {
  try {
    const response = await api.get("/groups", {
      params: filters,
    });
    return (response.data || []).map(normalizeGroup);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Alias for compatibility
 */
export const searchGroups = getGroups;

/**
 * Get single group by ID
 */
export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return normalizeGroup(response.data);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete group (Admin only)
 */
export const deleteGroup = async (groupId) => {
  try {
    await api.delete(`/groups/${groupId}`);
    return true;
  } catch (error) {
    handleError(error);
  }
};

/* =====================================
   MEMBERSHIP LOGIC
===================================== */

/**
 * Join group (Public auto-join / Private request)
 */
export const joinGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Leave group
 */
export const leaveGroup = async (groupId) => {
  try {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Approve / Reject join request (Admin)
 */
export const handleJoinRequest = async (
  groupId,
  userId,
  approve
) => {
  try {
    const response = await api.post(
      `/groups/${groupId}/join-requests`,
      { userId, approve }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get group members
 */
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(
      `/groups/${groupId}/members`
    );
    return response.data || [];
  } catch (error) {
    handleError(error);
  }
};

/* =====================================
   MY GROUPS
===================================== */

/**
 * Get groups user has joined
 * (Only works if backend endpoint exists)
 */
export const getMyGroups = async () => {
  try {
    const response = await api.get("/groups/my");
    return (response.data || []).map(normalizeGroup);
  } catch (error) {
    handleError(error);
  }
};

/* =====================================
   REAL-TIME REFRESH SUPPORT
===================================== */

/**
 * Refresh group details
 */
export const refreshGroup = async (groupId) => {
  return await getGroupById(groupId);
};