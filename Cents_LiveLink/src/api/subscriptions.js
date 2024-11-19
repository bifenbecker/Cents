import httpClient from "./httpClient";

export const fetchSubscriptions = () => {
  return httpClient({
    method: "GET",
    url: `/live-status/subscriptions`,
  });
};

export const updateSubscription = (subscriptionId, data) => {
  return httpClient({
    method: "PATCH",
    url: `/live-status/subscriptions/${subscriptionId}`,
    data,
  });
};
