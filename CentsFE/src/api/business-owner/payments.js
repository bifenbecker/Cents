import httpClient from "./../httpClient";

export const refundStripePayment = (paymentId) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/payments/${paymentId}/stripe/refund`,
  });
};

export const refundCashPayment = (paymentId) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/payments/${paymentId}/cash/refund`,
  });
};
