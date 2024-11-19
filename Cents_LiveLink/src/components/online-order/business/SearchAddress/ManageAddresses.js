import React, {useState, useEffect} from "react";
import {useMediaQuery, Box} from "@material-ui/core";
import {getAddressAndLatLng, mapGoogleAddressResult, getFormattedAddress} from "./utils";
import AddressInput from "./MobileComponents/AddressInput";
import ConfirmAddress from "./ConfirmAddress";
import ErrorCard from "../ErrorCard";
import AutoComplete from "./AutoComplete";
import SavedAddresses from "./SavedAddresses";
import {useAppDispatch, useAppSelector} from "app/hooks";
import {ORDER_DELIVERY_TYPES} from "../../../../constants/order";
import {
  onlineOrderActions,
  onlineOrderSelectors,
  onlineOrderThunks,
} from "components/online-order/redux";
import {toast} from "react-toastify";
import {ToastError} from "components/common";

const ManageAddresses = ({
  businessId,
  setIsImageCardVisible,
  setStoreId,
  setLoadingState,
  setIsCheckingAddress,
  isCheckingAddress,
}) => {
  const {
    data: {customerAddress: latestAddress},
  } = useAppSelector(onlineOrderSelectors.getOrderInitialData);

  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 500px)");
  const [isInputClick, setIsInputClick] = useState(false);
  const [isSelectAddress, setIsSelectAddress] = useState(false);
  const [isCanPickupAddress, setIsCanPickupAddress] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);
  const [loadingId, setLoadingId] = useState(-1);

  const [address, setAddress] = useState({
    name: "",
    isNew: false,
    details: {},
  });
  const [addressToEdit, setAddressToEdit] = useState({
    name: "",
    isNew: false,
    details: {},
  });

  useEffect(() => {
    setAddress({
      isNew: false,
      details: latestAddress,
      name: getFormattedAddress(latestAddress),
    });
    setIsCheckingAddress(true);
    setIsSelectAddress(true);
  }, []);

  const handleChange = (newAddress) => {
    setAddress((current) => ({
      ...current,
      name: newAddress,
      details: {},
      isNew: true,
    }));
  };

  useEffect(() => {
    const fetchAvailableStores = async (address) => {
      try {
        const {addressResult, latLng, timeZone} = await getAddressAndLatLng(address);
        const mappedAddress = mapGoogleAddressResult(addressResult);
        const response = await dispatch(
          onlineOrderThunks.getNearStores({
            businessId: businessId,
            timeZone,
            lng: latLng.lng,
            lat: latLng.lat,
            zipCode: mappedAddress.postalCode,
            googlePlacesId: mappedAddress.googlePlacesId,
            type: ORDER_DELIVERY_TYPES.pickup,
          })
        ).unwrap();
        return {
          response,
          mappedAddress,
        };
      } catch (error) {
        toast.error(
          <ToastError message={"Could not get the available stores for the address"} />
        );
        throw new Error(
          error?.message || "Could not get the available stores for the address"
        );
      }
    };

    if (isSelectAddress) {
      if (!isEditAddress && address.name !== "") {
        fetchAvailableStores(address.name)
          .then((res) => {
            const {response, mappedAddress} = res;
            setStoreId((prev) => {
              const newStoreId =
                response?.onDemandDeliveryStore.storeId ||
                response?.ownDeliveryStore.storeId;
              if (prev === newStoreId) {
                setLoadingState(false);
              }
              return newStoreId;
            });

            const isSuccessResponse = !!response?.success;

            if (isSuccessResponse) {
              dispatch(onlineOrderActions.setCurrentAddress(mappedAddress));
            } else {
              setLoadingState(false);
            }
            setIsCanPickupAddress(isSuccessResponse);
            setAddress((current) => {
              return current.isNew
                ? {
                    ...current,
                    name: getFormattedAddress(mappedAddress),
                    details: mappedAddress,
                  }
                : current;
            });
            toggleInputActive(isMobile ? address.isNew : false);
          })
          .catch((error) => {
            setLoadingState(false);
            setIsCanPickupAddress(false);
            toggleInputActive(isMobile);
            throw new Error(
              error?.message || "Could not get the available stores for the address"
            );
          })
          .finally(() => {
            setLoadingId(-1);
            setIsCheckingAddress(false);
          });
      }
    } else {
      setIsCanPickupAddress(false);
      setIsEditAddress(false);
    }
  }, [isSelectAddress]);

  const handleSelect = async (address) => {
    setIsCheckingAddress(true);
    setIsEditAddress(false);
    setLoadingId(address?.details?.id || -1);
    setAddress(address);
    setIsSelectAddress(true);
  };

  const toggleInputActive = (flag) => {
    setIsInputClick(flag);
  };

  const handleClose = () => {
    toggleInputActive(false);
    setIsSelectAddress(false);
    setIsEditAddress(false);
  };

  const handleEditAddress = (address) => {
    setAddressToEdit(address);
    setIsEditAddress(true);
    setIsSelectAddress(true);
    if (!isMobile) {
      toggleInputActive(false);
    }
  };

  const handleClearToInit = (address = null) => {
    setIsSelectAddress(false);
    setIsEditAddress(false);
    toggleInputActive(false);
    if (address) {
      setAddress(address);
    }
  };

  const ENUM_STATES = {
    CONFIRM: (
      <Box style={{marginTop: 60}}>
        <ConfirmAddress
          address={isEditAddress ? addressToEdit : address}
          handleClearToInit={handleClearToInit}
        />
      </Box>
    ),
    CANT_PICKUP: (
      <Box style={{marginTop: 60}}>
        <ErrorCard />
      </Box>
    ),
    NULL: null,
  };

  const getState = () => {
    if (isSelectAddress && loadingId === -1) {
      setIsImageCardVisible(isCheckingAddress ? true : false);
      if (address.isNew) {
        if (isCanPickupAddress || isEditAddress) {
          return "CONFIRM";
        } else {
          return !isCheckingAddress ? "CANT_PICKUP" : "NULL";
        }
      } else {
        if (isCanPickupAddress) {
          setIsImageCardVisible(true);
          return "NULL";
        } else {
          setIsImageCardVisible(false);
          return !isCheckingAddress ? "CANT_PICKUP" : "NULL";
        }
      }
    } else {
      setIsImageCardVisible(true);
      return "NULL";
    }
  };

  return isMobile && isInputClick ? (
    <AddressInput
      isEditAddress={isEditAddress}
      setIsEditAddress={setIsEditAddress}
      mobileHandler={handleClose}
      handleEditAddress={handleEditAddress}
      businessId={businessId}
      address={address}
      addressToEdit={addressToEdit}
      onChange={handleChange}
      setAddress={setAddress}
      isSelectAddress={isSelectAddress}
      isCanPickupAddress={isCanPickupAddress}
      setIsCanPickupAddress={setIsCanPickupAddress}
      toggleInputActive={toggleInputActive}
      setIsSelectAddress={setIsSelectAddress}
      handleClearToInit={handleClearToInit}
      setLoadingId={setLoadingId}
      loadingId={loadingId}
      setIsCheckingAddress={setIsCheckingAddress}
      isCheckingAddress={isCheckingAddress}
    />
  ) : (
    <>
      <AutoComplete
        address={address}
        onChange={handleChange}
        onSelect={handleSelect}
        onClose={handleClose}
        isInputActive={isInputClick}
        toggleInputActive={toggleInputActive}
        setIsCanPickupAddress={setIsCanPickupAddress}
        setIsSelectAddress={setIsSelectAddress}
        isCheckingAddress={isCheckingAddress}
        loadingId={loadingId}
        savedAddresses={
          isInputClick ? (
            <SavedAddresses
              loadingId={loadingId}
              onClickItem={handleSelect}
              handleEdit={handleEditAddress}
              clearInput={() => handleChange("")}
            />
          ) : null
        }
      />
      {ENUM_STATES[getState()]}
    </>
  );
};

export default ManageAddresses;
