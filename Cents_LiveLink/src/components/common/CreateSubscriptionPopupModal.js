import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {Flex, Text, Box, Image} from "rebass/styled-components";
import {SubscriptionModalImage} from "../../assets/images";
import {DockModal, Dropdown} from ".";
import useWindowSize from "../../hooks/useWindowSize";
import {INTERVAL_DISPLAY} from "../../constants/subscriptions";
import {
  COLORS,
  ORDER_DELIVERY_TYPES,
  ORDER_MESSAGES,
  SCHEDULE_BUTTONS,
  TEXT_ME_WHEN_READY,
} from "../../constants/order";
import {zIndex} from "styled-system";
import {IconBack, ExitIcon} from "../../assets/images";
import {Close} from "@material-ui/icons";
import {Button, Grid, IconButton, Typography} from "@material-ui/core";
import {SCHEDULE} from "constants/order";

const CreateSubscriptionPopupModal = (props) => {
  const {
    isOpen,
    toggle,
    onAddSubscription,
    onSkipSubscription,
    onScheduleDelivery,
    pickupTime,
    deliveryTime,
    discount,
  } = props;

  const closeModal = () => {
    toggle();
  };

  const [selectedInterval, setSelectedInterval] = useState(2);

  const handleAddSubscription = () => {
    onAddSubscription({interval: selectedInterval});
  };

  const getWeekListFromObject = Object.entries(INTERVAL_DISPLAY).map(
    ([interval, display]) => {
      return {label: display, value: Number(interval)};
    }
  );

  return (
    <div
      className={
        isOpen
          ? "recurring-choice-container open-from-bottom"
          : "recurring-choice-container"
      }
    >
      <div className="close-container">
        <IconButton>
          <Close fontSize="large" onClick={closeModal} alt="Dock Close" />
        </IconButton>
      </div>
      <Grid container className="title">
        <Typography variant="h1" component="h2">
          {SCHEDULE.recurringOrder}
        </Typography>
      </Grid>
      <Grid className="recurring-content">
        {discount ? (
          <Typography variant="h1" component="p" color="primary">
            {ORDER_MESSAGES.getSubscriptionDiscount(discount)}
          </Typography>
        ) : null}
        <Typography variant="h1" component="h2" color="p">
          {ORDER_MESSAGES.recurringCall}
        </Typography>
        <Grid>
          <Dropdown
            list={getWeekListFromObject}
            onListItemClick={({value}) => setSelectedInterval(value)}
            selectedListItem={selectedInterval}
          />
          <Text {...styles.wrapper.subHeaderText}>{SCHEDULE.pickup}</Text>
          <Text {...styles.wrapper.contentText}>{pickupTime}</Text>
          {deliveryTime === TEXT_ME_WHEN_READY ? (
            <Text
              {...styles.wrapper.customisecta}
              onClick={() => onScheduleDelivery(ORDER_DELIVERY_TYPES.pickup)}
            >
              {SCHEDULE_BUTTONS.edit}
            </Text>
          ) : null}
          <Text {...styles.wrapper.subHeaderText}>{SCHEDULE.delivery}</Text>
          <Text {...styles.wrapper.contentText}>{deliveryTime}</Text>
          {deliveryTime === TEXT_ME_WHEN_READY ? (
            <Text
              {...styles.wrapper.customisecta}
              onClick={() => onScheduleDelivery(ORDER_DELIVERY_TYPES.return)}
            >
              {SCHEDULE_BUTTONS.scheduleDeliveryNow}
            </Text>
          ) : (
            <Text
              {...styles.wrapper.customisecta}
              {...styles.wrapper.editSchedulingText}
              onClick={() => onScheduleDelivery(ORDER_DELIVERY_TYPES.pickup)}
            >
              {SCHEDULE_BUTTONS.editScheduling}
            </Text>
          )}
        </Grid>
        <Text {...styles.wrapper.note}>{SCHEDULE_BUTTONS.pickupReminder}</Text>
      </Grid>
      <Grid container className="recurring-controls">
        <Button
          variant="outlined"
          color="primary"
          className="schedule-button"
          onClick={onSkipSubscription}
        >
          {SCHEDULE_BUTTONS.notNow}
        </Button>
        <Button
          variant="contained"
          color="primary"
          className="schedule-button"
          onClick={handleAddSubscription}
        >
          {SCHEDULE_BUTTONS.apply}
        </Button>
      </Grid>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100%",
    flexDirection: "column",
    header: {
      marginLeft: "18px",
      marginRight: "18px",
      marginTop: "18px",
      marginBottom: "18px",
      fontSize: [16, 20],
    },
    headerblue: {
      color: "CENTS_BLUE",
      marginTop: "18px",
      marginLeft: "18px",
      marginRight: "18px",
      fontSize: [14, 16],
    },
    midContentWrapper: {
      display: "flex",
      flexDirection: "row",
      marginLeft: "18px",
      marginTop: "18px",
      marginBottom: "18px",
      justifyContent: "space-between",
    },
    midLeftContent: {
      width: "60%",
    },
    subHeaderText: {
      fontSize: "16px",
      marginTop: "24px",
    },
    contentText: {
      lineHeight: "24px",
      fontWeight: "100",
      fontSize: "16px",
    },
    customisecta: {
      color: "CENTS_BLUE",
      lineHeight: "23px",
      sx: {textDecoration: "underline", fontSize: 14},
    },
    editSchedulingText: {
      mt: "18px",
    },
    note: {
      margin: "30px 18px 0px 18px",
      color: "TEXT_GREY",
      fontSize: "14px",
    },
    buttoncontainer: {
      padding: "18px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    buttonoutline: {
      borderColor: "CENTS_BLUE",
      backgroundColor: "white",
      padding: "16px 16px",
      marginRight: "2%",
      textAlign: "center",
      color: "CENTS_BLUE",
      fontSize: ["14px", "16px"],
    },
    buttonsolid: {
      backgroundColor: "CENTS_BLUE",
      padding: "16px 24px",
      textAlign: "center",
      fontSize: ["14px", "16px"],
    },
  },
};

CreateSubscriptionPopupModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  pickupTime: PropTypes.string.isRequired,
  deliveryTime: PropTypes.string.isRequired,
  onAddSubscription: PropTypes.func.isRequired,
  onSkipSubscription: PropTypes.func.isRequired,
  onScheduleDelivery: PropTypes.func.isRequired,
  discount: PropTypes.number,
};

CreateSubscriptionPopupModal.defaultProps = {
  dockProps: {},
  discount: 0,
};

export default CreateSubscriptionPopupModal;
