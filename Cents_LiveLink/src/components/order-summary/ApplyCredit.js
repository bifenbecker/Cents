import React, {useState} from "react";
import {Flex, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import get from "lodash/get";

import {toDollars} from "./utils";

import {TextField, FullScreenModalForm} from "../common";

import {addCredits} from "../../api";

const ApplyCredit = props => {
  const {
    onClose,
    orderToken,
    setOrderDetails,
    availableCredits,
    balanceDue,
    netOrderTotal,
    isOnlineOrder,
  } = props;
  const orderTotal = Number((isOnlineOrder ? netOrderTotal : balanceDue).toFixed(2));

  const [creditValue, setcreditValue] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingErrorMsg, setLoadingErrorMsg] = useState();

  const applycredit = async () => {
    try {
      setLoading(true);
      const data = {
        appliedCredits: Number(creditValue),
      };
      const res = await addCredits(orderToken, data);
      if (res.data.success) {
        setOrderDetails(res.data.order);
        onClose();
        toast.success("Credit Applied!");
      }
    } catch (error) {
      setLoadingErrorMsg(
        get(error, "response.data.error", "Error while applying credit")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreditChange = event => {
    setcreditValue(event.target.value);
  };

  return (
    <FullScreenModalForm
      header="Apply Credit"
      onClose={onClose}
      onSubmit={applycredit}
      loading={loading}
      disabled={
        !creditValue ||
        Number(creditValue) < 0 ||
        Number(availableCredits - creditValue) < 0 ||
        Number(orderTotal - creditValue) < 0
      }
    >
      <Flex {...styles.wrapper}>
        <Flex {...styles.contentWrapper}>
          <Flex variant="blackText" {...styles.boldAmountDisplay}>
            <Text mr="2rem">Available Credit</Text>
            <Text>{toDollars(availableCredits)}</Text>
          </Flex>
          <TextField
            label="Amount to apply"
            prefix="$"
            type="number"
            materialWrapperStyle={{
              width: ["100%", "100%", "100%", "50%"],
              fontSize: "16px",
              padding: "12px 0",
            }}
            value={creditValue}
            onChange={handleCreditChange}
          />
          {loadingErrorMsg ? (
            <Text variant="errorMessage"> {loadingErrorMsg} </Text>
          ) : null}
        </Flex>
        <Flex {...styles.contentWrapper} mt="auto">
          <Flex {...styles.boldAmountDisplay} mb="1rem">
            <Text mr="2rem">Order Total</Text>
            <Text>{toDollars(orderTotal)}</Text>
          </Flex>
          <Flex {...styles.boldAmountDisplay} {...styles.amountDue.wrapper}>
            <Text mr="2rem">Total due after credits applied</Text>
            <Text {...styles.amountDue.amount}>
              {toDollars(creditValue ? orderTotal - Number(creditValue) : orderTotal)}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </FullScreenModalForm>
  );
};

const styles = {
  loader: {
    wrapper: {
      p: 3,
      height: "80vh",
      textAlign: "center",
      justifyContent: "center",
      flexDirection: "column",
    },
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexDirection: "column",
    height: "100%",
  },
  contentWrapper: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  boldAmountDisplay: {
    width: ["100%", "100%", "100%", "50%"],
    justifyContent: "space-between",
    alignItems: "center",
    mb: "2rem",
  },
  amountDue: {
    wrapper: {
      fontSize: "1.2rem",
    },
    amount: {
      color: "SUCCESS_TEXT_GREEN",
    },
  },
};

export default ApplyCredit;
