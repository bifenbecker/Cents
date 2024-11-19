import React from "react";
import PropTypes from "prop-types";
import {Flex, Text, Box} from "rebass/styled-components";

import {DockModal} from "../../../common/.";

const RecurringAddressDockModal = props => {
  const {isOpen, toggle, storeName} = props;

  const closeModal = () => {
    toggle();
  };

  const handleBackClick = () => {
    toggle();
  };

  return (
    <DockModal
      size={1}
      header="Confirm Address"
      isOpen={isOpen}
      toggle={closeModal}
      onBackClick={handleBackClick}
    >
      <Flex {...styles.wrapper}>
        <Box {...styles.wrapper.confirmaddresscontent}>
          <Text {...styles.wrapper.confirmtextcontent}>
            This is a recurring order connected to
            <b> {storeName}.</b>
          </Text>
          <Text {...styles.wrapper.confirmtextcontent}>
            You cannot change the pickup address for a recurring order.
          </Text>
          <Text {...styles.wrapper.confirmtextcontent}>
            To use a new address, recurring or not, please start a new order.
          </Text>
          <Text {...styles.wrapper.confirmtextcontent}>
            Note:
            <i>
              If the existing address on file for this recurring order is no longer
              relevant, please go to your Recurring Orders page and cancel the recurring
              order.
            </i>
          </Text>
        </Box>
      </Flex>
    </DockModal>
  );
};

const styles = {
  wrapper: {
    height: "calc(100% - 67px)",
    flexDirection: "column",
    justifyContent: "space-between",
    confirmaddresscontent: {
      marginLeft: "18px",
      marginRight: "18px",
    },
    confirmtextcontent: {
      marginTop: "18px",
      marginBottom: "18px",
      fontWeight: "100",
      fontFamily: "secondary",
    },
  },
};

RecurringAddressDockModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  storeName: PropTypes.string.isRequired,
  dockProps: PropTypes.object,
};

RecurringAddressDockModal.defaultProps = {
  dockProps: {},
};

export default RecurringAddressDockModal;
