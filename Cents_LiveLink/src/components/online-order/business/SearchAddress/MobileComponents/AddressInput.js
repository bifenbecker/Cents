import {useState, useEffect} from "react";
import {Box} from "@material-ui/core";
import ConfirmAddress from "../ConfirmAddress";
import ErrorCard from "../../ErrorCard";
import SavedAddresses from "../SavedAddresses";
import Layout from "./Layout";
import AutoComplete from "../AutoComplete";
import {useAppDispatch, useAppSelector} from "app/hooks";
import {onlineOrderActions, onlineOrderSelectors} from "components/online-order/redux";
import {STATES} from "./constants";
import {FETCHING_STATUS} from "constants/api";

const AddressInput = ({
  mobileHandler,
  setIsEditAddress,
  isEditAddress,
  address,
  onChange,
  setAddress,
  toggleInputActive,
  isSelectAddress,
  isCanPickupAddress,
  setIsSelectAddress,
  handleClearToInit,
  handleEditAddress,
  addressToEdit,
  setLoadingId,
  loadingId,
  setIsCanPickupAddress,
  setIsCheckingAddress,
  isCheckingAddress,
}) => {
  const dispatch = useAppDispatch();
  const {CONFIRM, CANT_PICKUP, AUTO_COMPLETE, SAVED_ADDRESSES} = STATES;
  const [isTyping, setIsTying] = useState(false);
  const {
    data: {savedCustomerAddresses: addresses},
    fetchingStatus: statusSavedAddresses,
  } = useAppSelector(onlineOrderSelectors.getOrderInitialData);

  const onSelect = (newAddress) => {
    setIsCheckingAddress(true);
    setAddress(newAddress);
    setIsSelectAddress(true);
  };

  const inputOnClose = () => {
    setIsSelectAddress(false);
    onChange("");
    setIsEditAddress(false);
  };

  useEffect(() => {
    if (isSelectAddress) {
      setIsTying(false);
    } else {
      setIsTying(!!address.name);
    }
  }, [address.name]);

  const autoComplete = (
    <AutoComplete
      address={address}
      onChange={onChange}
      onSelect={onSelect}
      isInputActive={true}
      toggleInputActive={toggleInputActive}
      onClose={inputOnClose}
      setIsCanPickupAddress={setIsCanPickupAddress}
      setIsSelectAddress={setIsSelectAddress}
      isCheckingAddress={isCheckingAddress}
    />
  );

  const ENUM_STATES = {
    CONFIRM: (
      <ConfirmAddress
        address={isEditAddress ? addressToEdit : address}
        handleClearToInit={handleClearToInit}
      />
    ),
    CANT_PICKUP: (
      <>
        {autoComplete}
        <Box style={{marginTop: 24, position: "relative"}}>
          {!isCheckingAddress && <ErrorCard />}
        </Box>
      </>
    ),
    AUTO_COMPLETE: autoComplete,
    SAVED_ADDRESSES: (
      <>
        {autoComplete}
        <Box style={{marginTop: 11}}>
          <SavedAddresses
            onClickItem={(address) => {
              dispatch(onlineOrderActions.setCurrentAddress(address.details));
              setLoadingId(address?.details?.id || -1);
              onSelect(address);
            }}
            loadingId={loadingId}
            handleEdit={handleEditAddress}
            clearInput={() => {}}
          />
        </Box>
      </>
    ),
  };

  const getState = () => {
    if (isSelectAddress && loadingId === -1) {
      if (isCanPickupAddress || isEditAddress) {
        return CONFIRM;
      } else {
        return CANT_PICKUP;
      }
    } else {
      if (isTyping) {
        return AUTO_COMPLETE;
      } else {
        return Object.keys(addresses || {}).length === 0 &&
          statusSavedAddresses === FETCHING_STATUS.FULFILLED
          ? AUTO_COMPLETE
          : SAVED_ADDRESSES;
      }
    }
  };

  return (
    <>
      <Layout
        title={Object.keys(addresses || {}).length === 0 ? "Add Address" : "Edit Address"}
        onClose={mobileHandler}
        isSelectAddress={isSelectAddress}
        isCanPickupAddress={isCanPickupAddress}
        isTyping={isTyping}
      >
        {ENUM_STATES[getState()]}
      </Layout>
    </>
  );
};

export default AddressInput;
