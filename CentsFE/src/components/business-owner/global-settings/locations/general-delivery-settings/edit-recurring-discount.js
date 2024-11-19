import React, {useState} from "react";

import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import RecurringDiscount from "./forms/recurring-discount/RecurringDiscount.js";

const EditRecurringDiscount = (props) => {
  const {
    closeEditDeliverySettingsScreen,
    recurringDiscountInPercent = null,
    storeId = null,
  } = props;

  const [updatedRecurringDiscount, setUpdatedRecurringDiscount] = useState(
    recurringDiscountInPercent
  );
  const [hasRecurringDiscount, setHasRecurringDiscount] = useState(
    !!updatedRecurringDiscount
  );
  const [error, setError] = useState();
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [recurringError, setRecurringError] = useState("");
  // Updates recurring discount
  const editRecurringDiscount = async () => {
    try {
      setError();
      let discount = Number(updatedRecurringDiscount);
      discount = isNaN(discount) ? 0 : discount;
      setUpdateInProgress(true);
      await updateDeliverySettings(storeId, {
        recurringDiscountInPercent: discount,
      });
      setUpdateInProgress(false);
      closeEditDeliverySettingsScreen();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the recurring discount. Please try again later!"
      );
      setUpdateInProgress(false);
    }
  };
  return (
    <EditStep
      header="Edit Discount for Recurring"
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={editRecurringDiscount}
      isLoading={updateInProgress}
      isSaveDisabled={hasRecurringDiscount && Number(updatedRecurringDiscount) === 0}
      errorMessage={recurringError || error}
    >
      <RecurringDiscount
        recurringDiscountInPercent={updatedRecurringDiscount}
        setRecurringDiscountInPercent={setUpdatedRecurringDiscount}
        hasRecurringDiscount={hasRecurringDiscount}
        setHasRecurringDiscount={setHasRecurringDiscount}
        error={recurringError}
        setError={setRecurringError}
      />
    </EditStep>
  );
};

export default EditRecurringDiscount;
