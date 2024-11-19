import httpClient from "./httpClient";

export const verifyOTP = ({phoneNumber, otp}) => {
  return httpClient({
    method: "POST",
    url: "/live-status/verify-otp",
    data: {otp, phoneNumber},
  });
};

export const requestOtp = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/request-otp",
    data,
  });
};

export const authorizeAsAdmin = token => {
  return httpClient({
    method: "POST",
    url: "/live-status/authorize-admin",
    data: {token},
  });
};
