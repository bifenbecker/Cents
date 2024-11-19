import httpClient from "../httpClient";

export const fetchPromotionsList = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/promotions/index",
  });
};

export const fetchPromotionDetails = (promotionId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/promotions/${promotionId}`,
  });
};

export const createNewPromotion = (data) => {
  return httpClient({
    method: "POST",
    url: "business-owner/admin/promotions/create",
    data,
  });
};

export const updatePromotionDetails = (id, data) => {
  return httpClient({
    method: "PUT",
    url: `business-owner/admin/promotions/update/${id}`,
    data,
  });
};
