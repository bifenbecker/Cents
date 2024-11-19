import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Box, Flex, Text} from "rebass/styled-components";

import {fetchFeaturedServices} from "../../../../api/online-order";

import {DockModal} from "../..";

import {businessSettingsSelectors} from "../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const SeePricing = (props) => {
  const {showPricing, toggleShowPricing, storeId, postalCode} = props;
  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [services, setServices] = useState([]);
  const [laundryServices, setLaundryServices] = useState([]);
  const [dryCleaningServices, setDryCleaningServices] = useState([]);
  const [products, setProducts] = useState([]);

  const hasServicesAndProducts = useMemo(() => {
    return (
      services?.length ||
      laundryServices?.length ||
      dryCleaningServices?.length ||
      products?.length
    );
  }, [
    services?.length,
    laundryServices?.length,
    dryCleaningServices?.length,
    products?.length,
  ]);

  const fetchFixedPriceServices = useCallback(async () => {
    try {
      setLoading(true);
      setError();
      const response = await fetchFeaturedServices(storeId, {
        type: "FIXED_PRICE",
        zipCode: postalCode,
      });
      setServices(response?.data?.services);
      setLaundryServices(response?.data?.laundry);
      setDryCleaningServices(response?.data?.dryCleaning);
      setProducts(response?.data?.products);
    } catch (error) {
      setError(
        error?.response?.data?.error || "Something went wrong while fetching services"
      );
    } finally {
      setLoading(false);
    }
  }, [postalCode, storeId]);

  useEffect(() => {
    if (showPricing) {
      fetchFixedPriceServices();
    }
  }, [fetchFixedPriceServices, showPricing]);

  return (
    <DockModal
      isOpen={showPricing}
      toggle={toggleShowPricing}
      header="Pricing"
      loading={loading}
    >
      <Box {...styles.body.wrapper}>
        {error ? (
          <Text variant="errorMessage">{error}</Text>
        ) : hasServicesAndProducts ? (
          <>
            <Text {...styles.body.description}>
              Blankets and larger items are priced individually. Please see pricing below:
            </Text>
            {!businessSettings?.dryCleaningEnabled ? (
              <Flex {...styles.pricing.sectionWrapper}>
                {services.map((service) => (
                  <Flex {...styles.pricing.item.wrapper} key={service.id}>
                    <Text {...styles.pricing.item.name}>{service.name}</Text>
                    <Text {...styles.pricing.item.price}>
                      ${service?.prices[0]?.storePrice?.toFixed(2)} / unit
                    </Text>
                  </Flex>
                ))}
              </Flex>
            ) : (
              <Box {...styles.pricing.headerWrapper}>
                <Text {...styles.body.sectionHeader}>Laundry</Text>
                <Flex {...styles.pricing.sectionWrapper}>
                  {laundryServices.map((service) => (
                    <Flex {...styles.pricing.item.wrapper} key={service.serviceId}>
                      <Text {...styles.pricing.item.name}>{service.lineItemName}</Text>
                      <Text {...styles.pricing.item.price}>
                        ${Number(service?.price).toFixed(2)} /{" "}
                        {service?.pricingStructureType === "FIXED_PRICE"
                          ? "unit"
                          : "pound"}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                <Text {...styles.body.sectionHeader}>Dry Cleaning</Text>
                <Flex {...styles.pricing.sectionWrapper}>
                  {dryCleaningServices.map((service) => (
                    <Flex {...styles.pricing.item.wrapper} key={service.serviceId}>
                      <Text {...styles.pricing.item.name}>{service.lineItemName}</Text>
                      <Text {...styles.pricing.item.price}>
                        ${Number(service?.price).toFixed(2)} /{" "}
                        {service?.pricingStructureType === "FIXED_PRICE"
                          ? "unit"
                          : "pound"}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                <Text {...styles.body.sectionHeader}>Products</Text>
                <Flex {...styles.pricing.sectionWrapper}>
                  {products.map((product) => (
                    <Flex {...styles.pricing.item.wrapper} key={product?.priceId}>
                      <Text {...styles.pricing.item.name}>{product?.lineItemName}</Text>
                      <Text {...styles.pricing.item.price}>
                        ${Number(product?.price).toFixed(2)} / unit
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            )}
          </>
        ) : (
          !loading && (
            <Text color="TEXT_GREY" width="100%" textAlign="center">
              No services to display
            </Text>
          )
        )}
      </Box>
    </DockModal>
  );
};

const styles = {
  main: {
    container: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    wrapper: {
      width: ["100%", "100%", "100%", "75%", "50%"],
      flexDirection: "column",
    },
  },
  header: {
    wrapper: {
      height: "67px",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      sx: {
        position: "relative",
      },
    },
    text: {
      fontSize: "18px",
    },
    image: {
      sx: {
        position: "absolute",
        top: "18px",
        left: "18px",
      },
    },
  },
  body: {
    wrapper: {
      mx: "18px",
      mt: "4px",
    },
    description: {
      fontSize: "18px",
      fontFamily: "secondary",
    },
  },
  pricing: {
    headerWrapper: {
      my: "42px",
    },
    sectionWrapper: {
      my: "42px",
      alignItems: "center",
      flexDirection: "column",
    },
    item: {
      wrapper: {
        alignItems: "flex-start",
        width: "100%",
        mb: "16px",
      },
      name: {
        width: "50%",
        textAlign: "left",
      },
      price: {
        width: "50%",
        textAlign: "right",
      },
    },
  },
};

export default SeePricing;
