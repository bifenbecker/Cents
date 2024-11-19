import {useState} from "react";
import get from "lodash/get";

import {saveAddressInfo} from "../api/online-order";

const useSaveAddress = ({address, afterSuccess, onFail}) => {
  const [addressObj, setAddressObj] = useState(address || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (field, value) => {
    setAddressObj(state => ({...state, [field]: value}));
  };

  const saveAddress = async (payload, googlePlacesId) => {
    try {
      setLoading(true);
      setError("");
      const response = await saveAddressInfo(googlePlacesId, payload);
      if (response.data.success) {
        const {centsCustomerAddress: savedAddress} = response?.data || {};
        setAddressObj(savedAddress);
        setLoading(false);

        afterSuccess(savedAddress);
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = get(error, "response.data.error", "Something went wrong!");
      setError(errorMsg);
      onFail(errorMsg);
    }
  };

  return {
    addressObj,
    setLoading,
    loading,
    error,
    setAddressObj,
    handleAddressChange,
    saveAddress,
  };
};

export default useSaveAddress;
