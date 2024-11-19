import React, {useMemo} from "react";
import {Box, Text} from "rebass/styled-components";

import {formatAddress} from "../../../../utils";

import {TextField} from "../../../../../common";
import AddressInstructionsForm from "../../../../../common/order-sections/address-instructions/Form";

const ConfirmAddress = props => {
  const {localAddressObj, handleAddressChange, showInstructionsHeading} = props;

  const formattedAddress = useMemo(() => {
    return formatAddress(localAddressObj);
  }, [localAddressObj]);

  return (
    <>
      <Box mb="32px">
        <Text {...styles.address}>{formattedAddress}</Text>
        <TextField
          label="Apt/Suite/Unit"
          placeholder="Apt, Suite, Unit, etc. (Optional)"
          materialWrapperStyle={styles.input.materialWrapper}
          themeStyles={styles.input.field}
          value={localAddressObj?.address2 || ""}
          onChange={e => handleAddressChange("address2", e.target.value)}
        />
      </Box>
      {showInstructionsHeading ? (
        <Text {...styles.headingText}>Pickup / Delivery Instructions</Text>
      ) : null}

      <Box>
        <AddressInstructionsForm
          instructions={localAddressObj?.instructions}
          leaveAtDoor={localAddressObj?.leaveAtDoor}
          handleChange={handleAddressChange}
        />
      </Box>
    </>
  );
};

const styles = {
  address: {
    pb: "12px",
    textAlign: "left",
    fontSize: "16px",
    fontFamily: "secondary",
  },
  headingText: {
    fontSize: "18px",
    mb: "16px",
  },
  input: {
    materialWrapper: {
      width: "100%",
      mt: "16px",
    },
    field: {
      sx: {
        "&::placeholder": {
          fontSize: "14px",
          fontFamily: "secondary",
          fontStyle: "italic",
        },
      },
    },
  },
};

export default ConfirmAddress;
