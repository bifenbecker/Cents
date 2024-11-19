import React from "react";
import {Box, Flex, Text, Image} from "rebass/styled-components";

// Assets
import {EditIcon} from "../../../../assets/images";

const ListAddresses = props => {
  const {
    customerAddresses,
    onAddressChange,
    selectedAddress,
    onNewAddressClick,
    onEditAddressClick,
  } = props;

  const handleAddressClick = address => {
    if (address.disabled) {
      return;
    } else {
      onAddressChange(address);
    }
  };

  return (
    <Box {...styles.screenContainer}>
      <Flex {...styles.bodyContainer}>
        <Flex {...styles.newAddressContainer}>
          <Flex
            {...styles.newAddressSelectionRow}
            onClick={() => {
              onNewAddressClick(true);
            }}
          >
            <Text>+ Add new address</Text>
          </Flex>
        </Flex>

        <Flex {...styles.currentAddressContainer}>
          {customerAddresses.map(address => (
            <Flex key={address.id} {...styles.currentAddressRow}>
              <Flex
                sx={{
                  ...styles.currentAddress,
                  border:
                    address.id === selectedAddress?.id
                      ? "solid #3D98FF"
                      : address.disabled
                      ? "solid 1px #B1B1B1"
                      : "solid 1px #000000",
                }}
                onClick={() => {
                  handleAddressClick(address);
                }}
              >
                <Text
                  {...styles.currentAddressMainLine}
                  sx={{color: address.disabled ? "#B1B1B1" : "black"}}
                >
                  {address.address1}
                </Text>
                <Text
                  {...styles.currentAddressExtraDetails}
                  sx={{color: address.disabled ? "#B1B1B1" : "black"}}
                >
                  {address.city}, {address.firstLevelSubdivisionCode}
                  {address.postalCode}
                </Text>
              </Flex>
              <Image
                {...styles.editIcon}
                onClick={() => {
                  onEditAddressClick(address);
                }}
                src={EditIcon}
              />
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "inherit",
      height: "100%",
      justifyContent: "space-between",
    },
  },
  bodyContainer: {
    sx: {
      flexDirection: "column",
    },
  },

  currentAddressContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      ":hover": {
        cursor: "pointer",
      },
    },
    p: 10,
  },
  currentAddressRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    my: "6px",
  },
  currentAddress: {
    borderRadius: 28,
    width: "75%",
    flexDirection: "column",
    px: 15,
    py: 10,
  },
  currentAddressMainLine: {
    sx: {
      fontWeight: 600,
    },
  },
  currentAddressExtraDetails: {
    sx: {
      fontWeight: 600,
      fontSize: 12,
    },
  },
  editIcon: {
    pr: 10,
    sx: {
      ":hover": {
        cursor: "pointer",
      },
    },
  },
  newAddressContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      ":hover": {
        cursor: "pointer",
      },
    },
    px: 10,
    mb: 10,
  },
  newAddressSelectionRow: {
    sx: {
      borderRadius: 28,
      border: "dashed",
      borderColor: "#A0A0A0",
      width: "75%",
    },
    px: 20,
    py: 15,
  },
};

export default ListAddresses;
