import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {PreferencesIcon, RightChevronIcon} from "../../../assets/images";
import orderSectionStyles from "../../../styles/order-section-styles";

import useToggle from "../../../hooks/useToggle";
import {actionTypes} from "../reducer";

import {NotesAndPreferencesDockModal} from "../../../components/common/order-sections";

const PreferencesAndNotes = props => {
  const {
    customerNotes,
    orderNotes,
    isIntakeComplete,
    dispatch,
    businessId,
    customer,
    fromManageOrder,
  } = props;

  const {
    isOpen: showPreferencesAndNotes,
    toggle: toggleShowPreferencesAndNotes,
  } = useToggle();

  const handleSave = advancedPayload => {
    dispatch({
      type: actionTypes.UPDATE_CUSTOMER_NOTES_AND_PREFERENCES,
      payload: {
        customerNotes: advancedPayload?.notes || customerNotes,
        orderNotes: advancedPayload?.orderNotes || orderNotes,
        hangDryInstructions:
          advancedPayload?.hangDryInstructions || customer?.hangDryInstructions,
        isHangDrySelected:
          advancedPayload?.isHangDrySelected || customer?.isHangDrySelected,
      },
    });
    toggleShowPreferencesAndNotes();
  };

  return (
    <Box>
      <Box {...styles.section.header}>Laundry Preferences & Order Notes</Box>
      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={toggleShowPreferencesAndNotes}
      >
        <Box {...styles.section.link.iconWrapper}>
          <Image src={PreferencesIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Preferences & Order Notes
            <Text {...styles.section.link.dataSubText}>
              {customerNotes || orderNotes || (
                <i>{isIntakeComplete ? "No" : "Add"} preferences and order notes</i>
              )}
            </Text>
          </Box>
          {isIntakeComplete ? null : (
            <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
          )}
        </Flex>
      </Flex>
      <NotesAndPreferencesDockModal
        isOpen={showPreferencesAndNotes}
        toggle={toggleShowPreferencesAndNotes}
        customerNotes={customerNotes}
        orderNotes={orderNotes}
        handleSave={handleSave}
        readonly={isIntakeComplete}
        businessId={businessId}
        customer={customer}
        fromManageOrder={fromManageOrder}
      />
    </Box>
  );
};

const styles = {
  section: orderSectionStyles,
};

export default PreferencesAndNotes;
