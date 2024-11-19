import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {useState as useHookState} from "@hookstate/core";

import {onlineOrderState} from "../../../../../../state/online-order";
import useToggle from "../../../../../../hooks/useToggle";
import {PreferencesIcon, RightChevronIcon} from "../../../../../../assets/images";

import {sectionStyles} from "../styles";

import {NotesAndPreferencesDockModal} from "../../../../../common/order-sections/index.js";

const LaundryPreferences = ({preferences}) => {
  const {
    isOpen: showLaundryPreferences,
    toggle: toggleShowLaundryPreferences,
  } = useToggle();

  const customerNotesState = useHookState(onlineOrderState.customerNotes);
  const orderNotesState = useHookState(onlineOrderState.orderNotes);
  const businessIdState = useHookState(onlineOrderState.businessId);

  const handleOrderNotesSave = ({orderNotes}) => {
    orderNotesState.set(orderNotes);
    toggleShowLaundryPreferences();
  };

  return (
    <Box>
      <Box {...styles.section.header}>Laundry Preferences & Order Notes</Box>
      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={toggleShowLaundryPreferences}
      >
        <Box {...styles.section.link.iconWrapper}>
          <Image src={PreferencesIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Preferences & Order Notes
            <Text {...styles.section.link.dataSubText}>
              {customerNotesState.get() || orderNotesState.get() || (
                <i>Add preferences and order notes</i>
              )}
            </Text>
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <NotesAndPreferencesDockModal
        toggle={toggleShowLaundryPreferences}
        isOpen={showLaundryPreferences}
        header={"Preferences & Order Notes"}
        preferences={preferences}
        businessId={businessIdState.get()}
        orderNotes={orderNotesState.get()}
        handleSave={handleOrderNotesSave}
      />
    </Box>
  );
};

const styles = {
  section: sectionStyles,
};

export default LaundryPreferences;
