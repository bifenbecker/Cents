import httpClient from "./httpClient";

export const processPayment = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/payment/process",
    data,
  });
};
