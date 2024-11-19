import React, {useState} from "react";
import get from "lodash/get";

import {updateOnDemandDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import DeliverySubsidy from "./forms/delivery-subsidy/delivery-subsidy";

const EditDeliverySubsidy = (props) => {
  const {
    subsidyInCents,
    returnOnlySubsidyInCents,
    storeId,
    closeEditDeliverySettingsScreen,
  } = props;
  const [loading, setLoading] = useState(false);
  const [subsidy, setSubsidy] = useState(subsidyInCents);
  const [returnOnlySubsidy, setReturnOnlySubsidy] = useState(returnOnlySubsidyInCents);
  const [error, setError] = useState();
  const [deliverySubsidyStatus, setDeliverySubsidyStatus] = useState({});
  const updateDeliverySubsidy = () => {
    setLoading(true);
    setError();
    updateOnDemandDeliverySettings(storeId, {
      subsidyInCents: subsidy,
      returnOnlySubsidyInCents: returnOnlySubsidy,
    })
      .then(({data: {success}}) => {
        setLoading(false);
        success && closeEditDeliverySettingsScreen();
      })
      .catch((error) =>
        setError(get(error, "response.data.error", "Something went wrong"))
      )
      .finally(() => setLoading(false));
  };
  return (
    <EditStep
      header="Delivery Subsidy"
      isLoading={loading}
      errorMessage={error}
      onSubmit={updateDeliverySubsidy}
      onCancel={closeEditDeliverySettingsScreen}
      isSaveDisabled={deliverySubsidyStatus.isSaveDisabled}
    >
      <DeliverySubsidy
        subsidyInCents={subsidy}
        setSubsidyInCents={(value) => {
          setSubsidy(value || 0);
        }}
        returnOnlySubsidyInCents={returnOnlySubsidy}
        setReturnOnlySubsidyInCents={(value) => {
          setReturnOnlySubsidy(value || 0);
        }}
        setDeliverySubsidyStatus={setDeliverySubsidyStatus}
      />
    </EditStep>
  );
};

export default EditDeliverySubsidy;
