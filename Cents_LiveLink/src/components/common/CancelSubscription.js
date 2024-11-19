import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {Flex, Button, Text} from "rebass/styled-components";
import {DockModal} from "./.";
import useWindowSize from "../../hooks/useWindowSize";

const CancelSubscription = props => {
  const [height] = useWindowSize();
  const {isOpen, toggle, dockProps, cancelSubscription} = props;

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 250;
    } else {
      return 0.7 * height;
    }
  }, [height]);

  return (
    <DockModal
      {...dockProps}
      isOpen={isOpen}
      size={getSize}
      fixedSize
      provideBackOption={true}
      showExitIcon={true}
      header="Cancel Recurring Order"
      onBackClick={toggle}
    >
      <Flex {...styles.subscription}>
        <Text {...styles.subscription.subtext}>
          Are you sure you want to cancel this recurring order?
        </Text>
        <Flex {...styles.buttons}>
          <Button variant="thickOutline" {...styles.buttons.button} onClick={toggle}>
            DON'T CANCEL
          </Button>
          <Button
            variant="primary"
            {...styles.buttons.button}
            onClick={() => cancelSubscription(true)}
          >
            YES, CANCEL
          </Button>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  subscription: {
    margin: "0px 30px",
    flexDirection: " column",
    alignItems: "center",

    exitIcon: {
      sx: {
        position: "absolute",
        top: "18px",
        left: "30px",
      },
    },

    subtext: {
      margin: "25px 0px",
      fontSize: "18px",
      fontFamily: "primary",
    },
  },
  buttons: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    my: "18px",

    button: {
      sx: {
        textTransform: "uppercase",
      },
      height: "60px",
      width: "calc(50% - 5px)",
      fontSize: ["12px", "14px", "16px"],
    },
  },
};

CancelSubscription.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  dockProps: PropTypes.object,
  cancelSubscription: PropTypes.func.isRequired,
};

CancelSubscription.defaultProps = {
  isOpen: false,
  toggle: () => {},
  dockProps: {},
};

export default CancelSubscription;
