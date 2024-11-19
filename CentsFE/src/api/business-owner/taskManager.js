import httpClient from "../httpClient";

export const getTasks = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/tasks",
    params,
  });
};

export const getShiftList = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/tasks/allShifts",
  });
};

export const createOrUpdateTask = (task) => {
  const method = task.id ? "PUT" : "POST";
  const params = task.id ? {id: task.id} : null;

  return httpClient({
    params,
    method,
    data: task,
    url: "business-owner/admin/tasks",
  });
};

export const fetchTasksReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/tasks/export",
    params,
  });
};

export const archiveTask = (taskId, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/tasks/archive/${taskId}`,
    data,
  });
};
