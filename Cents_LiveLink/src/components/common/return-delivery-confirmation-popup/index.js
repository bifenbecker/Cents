import React, {useMemo} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import PropTypes from "prop-types";
import VanImg from "assets/images/grayscale/Van.svg";
import TurnAroundImg from "assets/images/grayscale/Turnaround Time.svg";

import {BlueVan, TurnAroundTimeWithoutHand} from "../../../assets/images";
import {
  COLORS,
  ORDER_MESSAGES,
  TEXT_ME_WHEN_READY,
  TYPOGRAPHY,
} from "../../../constants/order";
import useWindowSize from "../../../hooks/useWindowSize";

import {DockModal} from "..";
import {Button} from "@material-ui/core";

const ReturnDeliveryConfirmationPopup = ({
  isOpen,
  toggle,
  onScheduleNowClick,
  turnAroundInHours,
  onScheduleLaterClick,
}) => {
  const [, height] = useWindowSize();

  return (
    <DockModal
      isOpen={isOpen}
      toggle={toggle}
      provideBackOption={true}
      fixedSize
      size={height}
      header="Return Delivery"
      onBackClick={toggle}
      dockStyle={{backgroundColor: COLORS.background}}
      showExitIcon
    >
      <div className="return-choice-container">
        <Box {...styles.mainWrapper}>
          <Flex {...styles.wrapper.main}>
            <Flex {...styles.wrapper.content}>
              <Text {...styles.wrapper.content.text}>{ORDER_MESSAGES.scheduleNow}</Text>
              <img src={VanImg} alt="Van" />
            </Flex>
            <Button
              variant="contained"
              color="primary"
              onClick={onScheduleNowClick}
              className="schedule-button pop-up-button"
            >
              {ORDER_MESSAGES.scheduleDeliveryNow}
            </Button>
          </Flex>
          <Flex {...styles.wrapper.main}>
            <Flex {...styles.wrapper.content}>
              <Text {...styles.wrapper.content.text}>
                {TEXT_ME_WHEN_READY} (
                {ORDER_MESSAGES.getTurnAroundInHours(turnAroundInHours)})
              </Text>
              <img src={TurnAroundImg} alt="Turn Around" />
            </Flex>
            <Button
              variant="contained"
              color="primary"
              onClick={onScheduleLaterClick}
              className="schedule-button pop-up-button"
            >
              {ORDER_MESSAGES.scheduleDeliveryLater}
            </Button>
          </Flex>
        </Box>
      </div>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    display: "grid",
    sx: {
      gridGap: "20px",
    },
    p: "18px",
    pt: 0,
  },
  wrapper: {
    main: {
      padding: "19px",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "173px",
      sx: {
        borderRadius: "14px",
      },
      backgroundColor: COLORS.containerBackground,
    },
    content: {
      justifyContent: "space-between",
      text: {
        fontSize: "18px",
        lineHeight: "24px",
        fontFamily: TYPOGRAPHY.default,
        fontWeight: 700,
      },
      image: {
        width: "110px",
        minWidth: "110px",
      },
    },
    button: {
      width: "100%",
      p: "16px",
      fontSize: "16px",
      lineHeight: "16px",
      fontFamily: "primary",
      sx: {
        textTransform: "uppercase",
      },
    },
  },
};

ReturnDeliveryConfirmationPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onScheduleNowClick: PropTypes.func.isRequired,
  onScheduleLaterClick: PropTypes.func.isRequired,
  turnAroundInHours: PropTypes.number.isRequired,
};
ReturnDeliveryConfirmationPopup.defaultProps = {
  isOpen: false,
  toggle: false,
  turnAroundInHours: 0,
};
export default ReturnDeliveryConfirmationPopup;
