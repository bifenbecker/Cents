import React, {useEffect, useState} from "react";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

import {getAvailableNearStores} from "../../../api/online-order";
import {ORDER_DELIVERY_TYPES} from "../../../constants/order";
import {onlineOrderState} from "../../../state/online-order";
import {useMediaQuery} from "@material-ui/core";
import {GoogleAddressSearchInput} from "../../common";
import MobileSearchAddress from "./MobileSearchAddress";

const SearchAddress = (props) => {
  const {
    customerAddress,
    setCustomerAddress,
    setError,
    setLoading,
    setAddressResult,
    setAvailableStores,
    setAddressTimeZone,
    setCloneOrder,
    flags,
  } = props;
  const mobileResolution = useMediaQuery("(max-width: 600px)");
  const [isShowMobileSearchAddress, setIsShowMobileSearchAddress] = useState(null);

  const handleChange = (address) => {
    setCustomerAddress(address);
    clearAvailableStores();
  };

  const clearAvailableStores = () => {
    setAvailableStores();
  };

  const onAddressSelect = async ({mappedAddress, timeZone, latLng}) => {
    try {
      const res = await getAvailableNearStores({
        businessId: onlineOrderState.businessId.get(),
        timeZone,
        lng: latLng.lng,
        lat: latLng.lat,
        zipCode: mappedAddress.postalCode,
        googlePlacesId: mappedAddress.googlePlacesId,
        type: ORDER_DELIVERY_TYPES.pickup,
      });
      setAddressResult((state) => {
        return mappedAddress.googlePlacesId === state?.googlePlacesId
          ? {...state, ...mappedAddress} // Update the state's address if came from BE to update the address
          : mappedAddress;
      });
      setAddressTimeZone(timeZone);
      setAvailableStores(res?.data, mappedAddress);
      if (res?.data?.recentCompletedStandardOrder && flags.orderCloning) {
        setCloneOrder(res?.data?.recentCompletedStandardOrder);
      }
    } catch (error) {
      throw new Error(
        error?.response?.data?.error ||
          "Could not get the available stores for the address"
      );
    }
  };

  useEffect(() => {
    console.log(isShowMobileSearchAddress);
    console.log;
  }, [isShowMobileSearchAddress]);

  return (
    <GoogleAddressSearchInput
      triggerSelectOnMount
      address={customerAddress}
      onError={setError}
      onLoading={setLoading}
      onAddressSelect={onAddressSelect}
      onAddressChange={handleChange}
      onSearchClear={clearAvailableStores}
    />
  );
};

SearchAddress.propTypes = {};

SearchAddress.defaultProps = {};

export default withLDConsumer()(SearchAddress);
