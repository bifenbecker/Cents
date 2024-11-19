import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import PropTypes from "prop-types";
import {TurnAroundTime} from "../../../assets/images";
import {WE_WILL_TEXT_YOU_WHEN_READY} from "../../../constants/order";
import {businessSettingsSelectors} from "../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const ReturnDeliveryConfirmationContent = ({
  day,
  time,
  turnAroundInHours,
  onScheduleNowClick,
}) => {
  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  return (
    <Flex {...styles.mainWrapper}>
      <Image src={TurnAroundTime} {...styles.turnaroundIcon} />
      <Box>
        <Text {...styles.subHeading}>{WE_WILL_TEXT_YOU_WHEN_READY}</Text>
        <Flex {...styles.textWrapper}>
          {businessSettings?.dryCleaningEnabled ? (
            <Text {...styles.normalText}>
              Your laundry should be ready {turnAroundInHours} hours after pickup. We will
              text you when it’s ready so you can schedule your return delivery at your
              convenience.
            </Text>
          ) : (
            <Text {...styles.normalText}>
              Your laundry should be ready by {day} at {time}. We will text you when it’s
              ready so you can schedule your return delivery at your convenience.
            </Text>
          )}
        </Flex>
        <Text {...styles.normalText}>Prefer to preschedule your return delivery?</Text>
        <Flex {...styles.multiTextWrapper}>
          <Text {...styles.multiTextWrapper.normalText}>No problem.</Text>
          <Text {...styles.multiTextWrapper.blueText} onClick={onScheduleNowClick}>
            Click here
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      flexDirection: "column",
    },
  },
  turnaroundIcon: {
    sx: {
      alignSelf: "center",
      width: "245px",
      height: "200px",
    },
  },
  textWrapper: {
    margin: "20px 0px 20px",
  },
  subHeading: {
    padding: "20px 0px 0px 10px",
  },
  normalText: {
    fontSize: "16px",
    color: "BLACK",
    fontFamily: "secondary",
    sx: {ml: "10px"},
  },

  multiTextWrapper: {
    flexDirection: "row",
    normalText: {
      fontSize: "16px",
      color: "BLACK",
      fontFamily: "secondary",
      sx: {ml: "10px"},
    },
    blueText: {
      color: "primary",
      fontWeight: 500,
      lineHeight: "18px",
      sx: {
        textDecoration: "underline",
        cursor: "pointer",
      },
      pl: "5px",
    },
  },
  gotItButton: {
    sx: {
      backgroundColor: "CENTS_BLUE",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "20px",
    mt: "60px",
  },
};

ReturnDeliveryConfirmationContent.propTypes = {
  onScheduleNowClick: PropTypes.func.isRequired,
  day: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};
ReturnDeliveryConfirmationContent.defaultProps = {
  day: "",
  time: "",
};

export default ReturnDeliveryConfirmationContent;
