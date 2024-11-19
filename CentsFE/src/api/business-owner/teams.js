import httpClient from "../httpClient";

export const fetchTeamMembersList = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/team/list-all",
  });
};

export const fetchCheckedInEmployees = (locationId) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/team/list-checkedin-employees",
    params: locationId,
  });
};

export const fetchActiveTeamMemberDetails = (id) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/team/${id}`,
  });
};

export const searchTeamMembers = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/team/search",
    params,
  });
};

export const createNewTeamMember = (newTeamMember) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/team",
    data: newTeamMember,
  });
};

export const updateTeamMember = async (teamMemberId, field, value) => {
  return httpClient({
    data: {
      id: teamMemberId,
      field,
      value,
    },
    method: "PUT",
    url: "/business-owner/admin/team",
  });
};

export const fetchTeamMembersReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/team/report",
    params,
  });
};

export const getTimeLog = (teamMemberId, params) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/team/${teamMemberId}/time-logs`,
    params,
  });
};

export const updateTimeLog = ({teamMemberId, id}, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/team/${teamMemberId}/time-logs/${id}`,
    data,
  });
};

export const fetchTeamMemberInsights = (teamMemberId, params) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/team/${teamMemberId}/time-logs/insights`,
    params,
  });
};

export const getSuggestedEmployeeCode = () => {
  return httpClient({
    method: "GET",
    url: "business-owner/admin/team/employee-codes/suggestion",
  });
};

export const archiveTeamMember = (teamMemberId, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/team/archive/${teamMemberId}`,
    data,
  });
};
