import React, {useState, useEffect} from "react";
import {Box, Typography, Button} from "@material-ui/core";
import FormControl from "./FormControl";
import {useAppDispatch} from "app/hooks";
import {onlineOrderThunks} from "components/online-order/redux";
import {makeStyles} from "@material-ui/styles";
import {
  PLACE_HOLDER,
  LABEL_TEXT,
  SUBTITLE_TEXT,
  GET_BTN_TEXT,
  NOTES_TEXT,
} from "./constants";
import AddressConfirmTextField from "./AddressConfirmTextField";
import {getFormattedAddress} from "../utils";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    "@media (min-width: 500px)": {
      maxWidth: 316,
      margin: "24px auto 0",
    },
    "@media (max-width: 500px)": {
      margin: "13px 20px",
    },
  },
  title: {
    color: "#303651",
    fontSize: 18,
    fontWeight: 600,
  },
  addressName: {
    color: "#303651",
    fontSize: 16,
    fontWeight: 500,
    margin: "14px 0 35px",
  },
  pickupInstructionsTitle: {
    color: "#303651",
    fontSize: 18,
    fontWeight: 700,
    margin: "32px 0 23px",
  },
  checkBoxLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#303651",
  },
  notes: {
    fontSize: 12,
    fontWeight: 400,
    color: "#7B7B7B",
  },
  btnSave: {
    height: 62,
    width: 338,
    marginTop: 24,
    borderRadius: 31,
    position: "absolute",
    bottom: "20px",
  },
  btnSaveText: {
    fontWeight: 700,
    fontSize: 20,
    textTransform: "capitalize",
  },
}));

export default function ConfirmAddress({address, handleClearToInit}) {
  const [instructions, setInstructions] = useState({});
  const [addressDetails, setAddressDetails] = useState({});
  const [isLeaveAtDoor, setIsLeaveAtDoor] = useState({
    prev: false,
    new: false,
  });
  const dispatch = useAppDispatch();
  const {
    wrapper,
    title,
    addressName,
    pickupInstructionsTitle,
    checkBoxLabel,
    notes,
    btnSave,
    btnSaveText,
  } = useStyles();

  useEffect(() => {
    const {
      details: {address2, instructions, leaveAtDoor},
    } = address;
    setInstructions({
      prev: instructions || "",
      new: instructions || "",
    });

    setAddressDetails({
      prev: address2 || "",
      new: address2 || "",
    });
    setIsLeaveAtDoor({
      prev: leaveAtDoor || false,
      new: leaveAtDoor || false,
    });
  }, []);

  const checkForm = () => {
    if (
      instructions.prev !== instructions.new ||
      addressDetails.prev !== addressDetails.new ||
      isLeaveAtDoor.prev !== isLeaveAtDoor.new
    ) {
      return true;
    }
    return false;
  };

  const onButtonClick = () => {
    const {details} = address;
    const resultAddress = {
      ...address,
    };

    if (checkForm()) {
      const data = {
        address1: details.address1,
        address2: addressDetails.new,
        city: details.city,
        firstLevelSubdivisionCode: details.firstLevelSubdivisionCode,
        postalCode: details.postalCode,
        countryCode: details.countryCode,
        instructions: instructions.new,
        leaveAtDoor: isLeaveAtDoor.new,
      };
      dispatch(
        onlineOrderThunks.patchAddressInfo({googlePlacesId: details.googlePlacesId, data})
      );
      resultAddress.details = data;
      resultAddress.name = getFormattedAddress(data);
    }
    handleClearToInit(resultAddress);
  };

  return (
    <Box className={wrapper}>
      <Typography className={title} variant="subtitle1">
        {SUBTITLE_TEXT.ADDRESS_DETAILS}
      </Typography>
      <Typography className={addressName} variant="subtitle1">
        {address.name}
      </Typography>
      <AddressConfirmTextField
        placeholder={PLACE_HOLDER.ADDRESS_DETAILS}
        label={LABEL_TEXT.ADDRESS_DETAILS}
        onChange={(e) => {
          const {value} = e.target;
          setAddressDetails((prev) => ({
            ...prev,
            new: value,
          }));
        }}
        maxRows={1}
        defaultValue={addressDetails.prev || ""}
      />
      <Typography className={pickupInstructionsTitle} variant="subtitle1">
        {SUBTITLE_TEXT.PICKUP_INSTRUCTIONS}
      </Typography>

      <AddressConfirmTextField
        placeholder={PLACE_HOLDER.PICKUP_INSTRUCTIONS}
        label={LABEL_TEXT.PICKUP_INSTRUCTIONS}
        rows={4}
        maxRows={5}
        defaultValue={instructions.prev || ""}
        onChange={(e) => {
          const {value} = e.target;
          setInstructions((prev) => ({
            ...prev,
            new: value,
          }));
        }}
      />
      <FormControl
        setIsLeaveAtDoor={setIsLeaveAtDoor}
        isLeaveAtDoor={isLeaveAtDoor}
        labelClassName={checkBoxLabel}
      />
      <Typography className={notes}>{NOTES_TEXT}</Typography>
      {/* TODO: INLINE STYLES FIX */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        className={btnSave}
        onClick={onButtonClick}
      >
        <Typography className={btnSaveText}>{GET_BTN_TEXT(address.isNew)}</Typography>
      </Button>
    </Box>
  );
}
