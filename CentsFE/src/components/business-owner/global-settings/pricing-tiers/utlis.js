// TODO: Commented since customer selection will not be needed while creating a tier anymore.

// export const prepareCustomerOptions = (list) => {
//   if (!list) {
//     return [];
//   }
//   return list.map((customer) => {
//     return getCustReactSelectOptionFromCustomer(customer);
//   });
// };

// export const getCustReactSelectOptionFromCustomer = (customer) => {
//   if (customer.id) {
//     return {
//       value: customer?.id,
//       label: `${customer?.fullName}`,
//       isCommercialCustomer: false,
//     };
//   } else {
//     return customer;
//   }
// };

export const formatServicePricesData = (data) => {
  return data
    .map((mainService) => {
      return mainService?.services?.map((service) => ({
        ...service,
        category: mainService.category,
        categoryId: mainService.id,
      }));
    })
    .reduce(function (a, b) {
      return a.concat(b);
    }, []);
};

export const getServiceandInventoryPrices = (data, orderIds) => {
  const services = [];
  const inventories = [];
  data.forEach((serviceOrProduct) => {
    const {
      price,
      isFeatured,
      prices = [],
      inventoryId,
      serviceCategoryId,
    } = serviceOrProduct;
    if (serviceCategoryId) {
      const {minQty, minPrice, serviceId, storePrice, isFeatured} = prices[0];
      let onlineOrderIds = orderIds.filter((order) => order.value === serviceId);

      services.push({
        minQty,
        minPrice,
        serviceId,
        storePrice,
        isFeatured,
        isDeliverable: !!onlineOrderIds?.length,
      });
    } else {
      inventories.push({
        price,
        isFeatured,
        inventoryId,
      });
    }
  });
  return {services, inventories};
};
