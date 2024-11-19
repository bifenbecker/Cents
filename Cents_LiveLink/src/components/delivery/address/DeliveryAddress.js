import React, {useState} from "react";
import {Box, Flex, Text, Image} from "rebass/styled-components";

// Assets
import {IconBack, EditIcon} from "../../../assets/images";

// Components
import DeliveryAddressForm from "./DeliveryAddressForm";

const DeliveryAddress = props => {
  const [showAddressOverview, setShowAddressOverview] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormHeader, setAddressFormHeader] = useState();
  const [addressFormButtonText, setAddressFormButtonText] = useState();
  const [addressSelectionId, setAddressSelectionId] = useState(
    props.address ? props.address : ""
  );
  const [fullAddress, setFullAddress] = useState(props.address ? props.address : "");
  const [customerAddresses, setCustomerAddresses] = useState(
    props.customer.addresses ? props.customer.addresses : []
  );

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image {...styles.svgImage} onClick={props.goBack} src={IconBack} />
          <Text {...styles.headerRowText}>Confirm delivery address</Text>
        </Flex>
      </Flex>
    );
  };

  const renderCustomerAddresses = () => {
    return (
      <Flex {...styles.currentAddressContainer}>
        {customerAddresses.map(address => (
          <Flex key={address.id} {...styles.currentAddressRow}>
            <Flex
              sx={{
                ...styles.currentAddress,
                border:
                  address.id === addressSelectionId
                    ? "solid #3D98FF"
                    : "solid 1px #000000",
              }}
              onClick={() => {
                selectAddress(address);
              }}
            >
              <Text {...styles.currentAddressMainLine}>{address.address1}</Text>
              <Text {...styles.currentAddressExtraDetails}>
                {address.city}, {address.firstLevelSubdivisionCode}, {address.postalCode}
              </Text>
            </Flex>
            <Image
              {...styles.editIcon}
              onClick={() => {
                showAddressFormSection(true, address);
              }}
              src={EditIcon}
            />
          </Flex>
        ))}
      </Flex>
    );
  };

  const renderNewAddressSelection = () => {
    return (
      <Flex {...styles.newAddressContainer}>
        <Flex
          {...styles.newAddressSelectionRow}
          onClick={() => {
            showAddressFormSection(false);
          }}
        >
          <Text>+ Add new address</Text>
        </Flex>
      </Flex>
    );
  };

  const showAddressFormSection = (edit, address = null) => {
    if (edit) {
      setAddressFormHeader("Edit Delivery Address");
      setAddressFormButtonText("Update Delivery Address");
      setFullAddress(address);
    } else {
      setAddressFormHeader("Add New Delivery Address");
      setAddressFormButtonText("Save Delivery Address");
      setFullAddress("");
    }

    setShowAddressForm(true);
    setShowAddressOverview(false);
  };

  const selectAddress = address => {
    setAddressSelectionId(address.id);
    setFullAddress(address);
    props.onSave(address);
  };

  const addAddressToCurrentState = address => {
    const newArray = customerAddresses;
    const index = newArray.findIndex(x => x.id === address.id);

    if (index === -1) {
      newArray.push(address);
    } else {
      newArray[index] = address;
    }

    setCustomerAddresses(newArray);
    setShowAddressForm(false);
    setShowAddressOverview(true);
  };

  return (
    <Box {...styles.screenContainer}>
      {showAddressOverview && renderHeader()}
      {showAddressOverview && (
        <Flex {...styles.bodyContainer}>
          {renderCustomerAddresses()}
          {renderNewAddressSelection()}
        </Flex>
      )}
      {showAddressForm && (
        <DeliveryAddressForm
          goBack={() => {
            setShowAddressForm(false);
            setShowAddressOverview(true);
          }}
          headerTitle={addressFormHeader}
          formButtonText={addressFormButtonText}
          customer={props.customer}
          onSave={address => {
            addAddressToCurrentState(address);
          }}
          addressToEdit={fullAddress}
          editAddress={fullAddress ? true : false}
        />
      )}
    </Box>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "inherit",
      height: window.innerHeight,
      justifyContent: "space-between",
    },
  },
  bodyContainer: {
    sx: {
      flexDirection: "column",
    },
  },
  headerRowContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: window.innerHeight * 0.1,
    },
  },
  headerRowText: {
    sx: {
      fontSize: 18,
      fontWeight: 600,
    },
  },
  svgImage: {
    sx: {
      position: "absolute",
      left: 20,
    },
  },
  headerColumnContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
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

export default DeliveryAddress;
