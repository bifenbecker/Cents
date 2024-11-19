import httpClient from "./httpClient";

export const login = data => {
  return httpClient({
    method: "POST",
    url: "/sign-in",
    data
  });
};

export const resetPassword = (params,data) => {
  return httpClient({
    method: "POST",
    url: "/sign-in/reset",
    data,
    params
  });
};

export const verifyResetToken = (params) => {
  return httpClient({
    method: "GET",
    url: "/sign-in/reset",
    params
  });
};

export const forgotPassword = (data) => {
  return httpClient({
    method: "POST",
    url: "/sign-in/forgot",
    data
  });
};