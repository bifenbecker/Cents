import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Box, Flex, Text} from "rebass/styled-components";

// Components
import {Header} from "./../common";
import DeliveryOverview from "../delivery/DeliveryOverview";

import {fetchOrderDetail} from "../../api";
import {getPriceString} from "../../utils";

const OrderSummary = () => {
  const {orderToken} = useParams();
  const [orderDetails, setOrderDetails] = useState();
  const [loading, setLoading] = useState(true);
  const [loadingErrorMsg, setLoadingErrorMsg] = useState();
  const [showOrderDetails, setShowOrderDetails] = useState();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  useEffect(() => {
    fetchOrderDetail(orderToken)
      .then(({data: {orderDetails}}) => {
        setOrderDetails(orderDetails);
        setLoading(false);
        setShowOrderDetails(true);
      })
      .catch(error => {
        const errMsg = error.response?.data.error || error.message;
        setLoadingErrorMsg(errMsg);
      });
  }, [orderToken]);

  const renderHeader = () => {
    return (
      <Flex {...styles.header.wrapper}>
        <Box>
          <Text {...styles.header.title}>Order Summary</Text>
        </Box>
        {orderDetails.status === "COMPLETED" ? (
          <Text {...styles.header.status}>COMPLETE</Text>
        ) : null}
      </Flex>
    );
  };

  const renderCustomerDetail = () => {
    const {
      customer: {fullName, phoneNumber, email},
      store: {name, address, city, zipCode},
    } = orderDetails;
    return (
      <Box {...styles.address.wrapper}>
        <Text {...styles.address.info}>
          {fullName}
          <br />
          {phoneNumber}
          <br />
          {email}
          <br />
          {name} <br />
          {address}, {city} {zipCode}
        </Text>
      </Box>
    );
  };

  const renderOrderItems = () => {
    return (
      <Box {...styles.orderItems.wrapper}>
        {orderDetails.orderItems?.map(item => (
          <Box {...styles.orderItems.itemWrapper} key={item.orderItemId}>
            <Flex {...styles.orderItems.itemTitle}>
              <Text>{item.laundryType}</Text>
              <Text>${item.itemTotal?.toFixed(2) || "0.00"}</Text>
            </Flex>
            <Flex {...styles.orderItems.itemPriceInfo}>
              {getPriceString(item)
                .split("|")
                .map(text => (
                  <Text key={text}>{text}</Text>
                ))}
            </Flex>
          </Box>
        ))}
      </Box>
    );
  };

  const renderFooter = () => {
    return (
      <Box {...styles.footer.wrapper}>
        <Flex {...styles.footer.paidInfo}>
          <Text>Total Paid</Text>
          <Text>${orderDetails.totalPaid.toFixed(2)}</Text>
        </Flex>
        {orderDetails.tipAmount ? (
          <Flex {...styles.footer.otherPaidInfo}>
            <Text>Tip</Text>
            <Text>${orderDetails.tipAmount.toFixed(2)}</Text>
          </Flex>
        ) : null}
        {orderDetails.isTaxable ? (
          <Flex {...styles.footer.otherPaidInfo}>
            <Text>Tax</Text>
            <Text>${orderDetails.taxAmount.toFixed(2)}</Text>
          </Flex>
        ) : null}
        {orderDetails.creditAmount ? (
          <Flex {...styles.footer.otherPaidInfo}>
            <Text>Credit applied</Text>
            <Text>${orderDetails.creditAmount.toFixed(2)}</Text>
          </Flex>
        ) : null}
        <Flex {...styles.footer.dueInfo}>
          <Text>Total Due</Text>
          <Text>${orderDetails.balanceDue?.toFixed(2) || "0.00"}</Text>
        </Flex>
      </Box>
    );
  };

  const displayDeliveryModal = async () => {
    setShowDeliveryModal(true);
    setShowOrderDetails(false);
  };

  return (
    <Box>
      {/* <Header onDeliveryClick={displayDeliveryModal} /> */}
      {loading && (
        <Flex {...styles.loader.wrapper}>
          <Header onDeliveryClick={displayDeliveryModal} />
          <Text>{loadingErrorMsg ? loadingErrorMsg : "Loading ..."}</Text>
        </Flex>
      )}
      {!loading && (
        <Box>
          {showOrderDetails && (
            <Box>
              <Header order={orderDetails} onDeliveryClick={displayDeliveryModal} />
              {renderHeader()}
              {renderCustomerDetail()}
              {renderOrderItems()}
              {renderFooter()}
            </Box>
          )}
          {showDeliveryModal && (
            <DeliveryOverview
              order={orderDetails}
              closeModal={() => {
                setShowDeliveryModal(false);
                setShowOrderDetails(true);
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

const styles = {
  loader: {
    wrapper: {
      p: 3,
      height: "80vh",
      textAlign: "center",
      justifyContent: "center",
      flexDirection: "column",
    },
  },
  header: {
    wrapper: {
      p: 3,
      justifyContent: "space-between",
    },
    title: {
      fontSize: [3, 4],
      fontWeight: "500",
    },
    status: {
      fontSize: [0, 1],
      fontWeight: "600",
      bg: "HUB_NOTIFICATION_GREY",
      px: 2,
      py: 1,
      color: "CENTS_BLUE",
      sx: {
        borderRadius: 9999,
      },
    },
  },
  address: {
    wrapper: {
      sx: {
        borderBottom: "1px solid",
        borderColor: "DISABLED_TEXT_GREY",
      },
    },
    info: {
      pb: 4,
      px: 3,
      as: "address",
      fontSize: [0, 1],
      fontStyle: "normal",
    },
  },
  orderItems: {
    wrapper: {
      p: 3,
      minHeight: "60vh",
    },
    itemWrapper: {
      pb: 3,
    },
    itemTitle: {
      py: 1,
      fontSize: [1, 2],
      justifyContent: "space-between",
      fontWeight: "bold",
    },
    itemPriceInfo: {
      py: 1,
      fontSize: [1, 2],
      lineHeight: 1.5,
      flexDirection: "column",
    },
  },
  footer: {
    wrapper: {
      as: "footer",
      p: 3,
      py: [3, 4],
      width: 1,
      bg: "WHITE",
      fontWeight: "bold",
      sx: {
        position: "sticky",
        bottom: 0,
        boxShadow: "0 -5px 8px -7px rgba(0,0,0,.2)",
      },
    },
    paidInfo: {
      pb: [1, 2],
      fontSize: [1, 2],
      justifyContent: "space-between",
      lineHeight: 2,
    },
    dueInfo: {
      fontSize: [2, 3],
      justifyContent: "space-between",
      lineHeight: 1.6,
    },
    otherPaidInfo: {
      pb: [1, 2],
      fontSize: [1, 2],
      justifyContent: "space-between",
      lineHeight: 2,
      fontWeight: "normal",
    },
  },
};

export default OrderSummary;
