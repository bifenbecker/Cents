import React, {useState} from "react";
import {Flex, Text, Image} from "rebass/styled-components";

// Assets
import {IconBack} from "../../../assets/images";

// Components
import ServiceProviderTimeSelection from "../../online-order/common/service-provider-time-selection";
import Loader from "../../common/loader/index";

const DeliveryTime = (props) => {
  const {
    goBack,
    onSave,
    customer,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    store,
    deliveryWindow,
    deliveryProvider,
    address,
    deliveryEstimate,
    deliveryEstimateCost,
  } = props;

  const [loading, setLoading] = useState(false);
  const [orderDelivery, setOrderDelivery] = useState({
    deliveryProvider: deliveryProvider
      ? deliveryProvider
      : ownDriverDeliverySettings?.active
      ? "OWN_DRIVER"
      : "DOORDASH",
    deliveryWindow: deliveryWindow ? deliveryWindow : [],
    thirdPartyDeliveryId: deliveryEstimate ? deliveryEstimate : null,
    totalDeliveryCost: deliveryEstimateCost ? deliveryEstimateCost : 0,
    type: "DROPFF",
  });

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image
            {...styles.svgImage}
            onClick={() => {
              goBack();
            }}
            src={IconBack}
          />
          <Text {...styles.headerRowText}>Set delivery time</Text>
        </Flex>
      </Flex>
    );
  };

  /**
   * Format delivery time options and send it to parent
   *
   * @param {Object} timeSelection
   */
  const saveDeliveryTime = (timeSelection) => {
    setOrderDelivery({
      timingsId: timeSelection.timingsId,
      type: timeSelection.type,
      deliveryWindow: timeSelection.deliveryWindow,
      deliveryProvider: timeSelection.deliveryProvider,
      totalDeliveryCost: timeSelection.totalDeliveryCost,
      thirdPartyDeliveryId: timeSelection.thirdPartyDeliveryId,
    });

    onSave(timeSelection);
  };
  return (
    <Flex {...styles.screenContainer}>
      {loading && <Loader />}
      <Flex {...styles.bodyContainer}>
        {renderHeader()}
        <ServiceProviderTimeSelection
          onServiceProviderTimeChange={({
            type,
            timingsId,
            deliveryProvider,
            deliveryWindow,
            totalDeliveryCost,
            thirdPartyDeliveryId,
            pickupAt,
          }) => {
            const object = {
              type,
              timingsId,
              deliveryProvider,
              deliveryWindow,
              totalDeliveryCost,
              thirdPartyDeliveryId,
              pickupAt,
            };
            saveDeliveryTime(object);
          }}
          setLoading={setLoading}
          orderDelivery={orderDelivery}
          customerAddress={address ? address : customer?.addresses[0]}
          ownDeliveryStore={{
            ...ownDriverDeliverySettings,
          }}
          onDemandDeliveryStore={{
            storeId: store,
            ...onDemandDeliverySettings,
          }}
          type={"DROPOFF"}
          timeZone={store?.timeZone}
          store={store}
        />
      </Flex>
    </Flex>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "inherit",
      minHeight: window.innerHeight,
      justifyContent: "space-between",
      flexDirection: "column",
      overflowY: "hidden",
    },
  },
  bodyContainer: {
    sx: {
      height: window.innerHeight * 0.8,
      justifyContent: "flex-start",
      flexDirection: "column",
    },
  },
  headerRowContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: window.innerHeight * 0.1,
    },
  },
  headerRowText: {
    sx: {
      fontSize: 18,
      fontWeight: 600,
    },
  },
  svgImage: {
    sx: {
      position: "absolute",
      left: 20,
    },
  },
  headerColumnContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
    },
  },
  daySelectionContainer: {
    sx: {
      flexDirection: "row",
      overflowX: "auto",
      flexWrap: "nowrap",
    },
    pt: 10,
    pb: 30,
    px: 15,
  },
  individualDayContainer: {
    borderStyle: "solid",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    width: 96,
    height: 82,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
    mx: "5px",
  },
  dayOfWeek: {
    sx: {
      fontSize: 12,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  timeContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      overflowY: "auto",
      height: window.innerHeight * 0.6,
    },
  },
  individualDeliveryTime: {
    borderTop: "1px solid",
    borderColor: "BOX_BORDER",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    px: 20,
    py: 20,
  },
  individualDeliveryTimeText: {
    sx: {
      fontWeight: 600,
    },
  },
  saveButtonContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      height: window.innerHeight * 0.2,
    },
    py: 40,
  },
  saveButton: {
    width: "80%",
    borderRadius: 31,
    py: 20,
  },
};

export default DeliveryTime;
