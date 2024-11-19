import {useCallback} from "react";
import {Box, Button, Grid, Typography} from "@material-ui/core";
import {Image} from "rebass";

import orderImage from "assets/images/business/orderImage.svg";
import {ProcessingOrderInfo, RecentOrderInfo, ScheduledOrderInfo} from "./OrderDetails";
import {ORDER_ACTION_TYPES} from "../../constants/home";
import {useHistory} from "react-router-dom";

export const LastOrderCard = ({orderDetails, handleReorderButtonClick}) => {
  const history = useHistory();
  const {
    actionType,
    services,
    modifiers,
    scheduling,
    orderStatus,
    time,
    serviceOrderToken,
  } = orderDetails;

  const currentDetailsPicker = useCallback(
    (actionType) => {
      if (actionType === ORDER_ACTION_TYPES.completed) {
        return {
          orderDetailsView: <RecentOrderInfo services={services} modifiers={modifiers} />,
          actionHandler: handleReorderButtonClick,
        };
      }
      if (actionType === ORDER_ACTION_TYPES.active) {
        return {
          orderDetailsView: (
            <ProcessingOrderInfo
              time={time}
              scheduling={scheduling}
              orderStatus={orderStatus}
            />
          ),
          actionHandler: () => history.push(`/order-summary/${serviceOrderToken}`),
        };
      }
      if (actionType === ORDER_ACTION_TYPES.scheduled) {
        return {
          orderDetailsView: <ScheduledOrderInfo time={time} />,
          actionHandler: () => history.push(`/subscriptions`),
        };
      }
      return {
        orderDetailsView: (
          <Typography style={styles.actionButtonText}>Some error has ocurred</Typography>
        ),
        actionHandler: null,
      };
    },
    [
      history,
      services,
      modifiers,
      time,
      scheduling,
      orderStatus,
      handleReorderButtonClick,
      serviceOrderToken,
    ]
  );

  const {orderDetailsView, actionHandler} = currentDetailsPicker(actionType);

  return (
    <Box style={styles.boxWrapper}>
      <Grid container style={{padding: "16px"}}>
        <Grid item xs={7}>
          <Box>{orderDetailsView}</Box>
        </Grid>
        <Grid item xs={5}>
          <Box position="relative" width="auto" height={137}>
            <Image
              src={orderImage}
              alt="Order Image"
              style={{position: "absolute", right: 0}}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={actionHandler}
            color="primary"
            variant="outlined"
            style={styles.actionButton}
            fullWidth
          >
            <Typography style={styles.actionButtonText}>{actionType}</Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = {
  boxWrapper: {
    border: "1px solid #BBBBBB",
    borderRadius: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  actionButton: {
    borderRadius: "32px",
    width: "100%",
    height: "40px",
    padding: "16px, 8px",
  },
  actionButtonText: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: "14px",
    letterSpacing: "0.0125em",
    textTransform: "capitalize",
  },
};
