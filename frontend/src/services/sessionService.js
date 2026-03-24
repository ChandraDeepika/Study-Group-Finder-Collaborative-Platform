import api from "./api";

export const createSession = (groupId, data) =>
  api.post(`/groups/${groupId}/sessions`, data).then(r => r.data);

export const getGroupSessions = (groupId) =>
  api.get(`/groups/${groupId}/sessions`).then(r => r.data);

export const getUpcomingSessions = (groupId) =>
  api.get(`/groups/${groupId}/sessions/upcoming`).then(r => r.data);

export const deleteSession = (groupId, sessionId) =>
  api.delete(`/groups/${groupId}/sessions/${sessionId}`).then(r => r.data);
