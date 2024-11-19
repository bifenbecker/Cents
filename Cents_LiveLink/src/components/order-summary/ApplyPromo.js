import React, {useState} from "react";
import {Flex, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import get from "lodash/get";

import {FullScreenModalForm, TextField} from "../common";

import {addPromo} from "../../api";

const ApplyPromo = props => {
  const {onClose, orderToken, setOrderDetails} = props;

  const [promoValue, setPromoValue] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingErrorMsg, setLoadingErrorMsg] = useState();

  const applyPromo = async () => {
    try {
      setLoading(true);
      const data = {
        promoCode: promoValue,
      };
      const res = await addPromo(orderToken, data);
      if (res.data.success) {
        setOrderDetails(res.data.order);
        onClose();
        toast.success("Promo Applied!");
      }
    } catch (error) {
      setLoadingErrorMsg(get(error, "response.data.error", "Error while applying promo"));
    } finally {
      setLoading(false);
    }
  };

  const handlePromoChange = event => {
    setPromoValue(event.target.value);
  };

  return (
    <FullScreenModalForm
      header="Apply Promo"
      onClose={onClose}
      onSubmit={applyPromo}
      loading={loading}
      disabled={!promoValue}
    >
      <Flex
        width="100%"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <TextField
          label="Promo Code"
          type="text"
          materialWrapperStyle={{width: ["100%", "100%", "100%", "50%"]}}
          wrapperInputStyle={{fontSize: "1rem"}}
          value={promoValue}
          onChange={handlePromoChange}
        />
        {loadingErrorMsg ? <Text variant="errorMessage"> {loadingErrorMsg} </Text> : null}
      </Flex>
    </FullScreenModalForm>
  );
};

export default ApplyPromo;
