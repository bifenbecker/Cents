import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import PropTypes from "prop-types";

import {updateSubscription} from "../../api/subscriptions";

import {ToastError} from "../common";
import ViewSusbcriptionPopup from "../common/ViewSusbcriptionPopup";

const EditSubscription = props => {
  const {
    isOpen,
    toggle,
    subscriptionDetail,
    onSubscriptionUpdate,
    onSubscriptionDelete,
  } = props;

  const [subscription, setSubscription] = useState({...subscriptionDetail});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSubscription({...subscriptionDetail});
  }, [subscriptionDetail]);

  const updateCurrentSubscription = async ({field, value}) => {
    try {
      setLoading(true);
      const res = await updateSubscription(subscription?.recurringSubscriptionId, {
        [field]: value,
      });
      if (res?.data?.success) {
        if (field === "isDeleted") {
          setLoading(false);
          onSubscriptionDelete(subscription);
          toggle();
        } else {
          const updatedSubscription = res?.data?.subscription || {};
          setSubscription(updatedSubscription);
          onSubscriptionUpdate(updatedSubscription);
          setLoading(false);
        }
      }
    } catch (error) {
      toast.error(
        <ToastError
          message={`Error while ${
            field === "isDeleted" ? "canceling" : "updating"
          } recurring order`}
        />
      );
      setLoading(false);
    }
  };

  return (
    <ViewSusbcriptionPopup
      isOpen={isOpen}
      toggle={toggle}
      loading={loading}
      subscription={subscription}
      onSubscriptionFieldChange={updateCurrentSubscription}
      isEditSubscription={true}
    />
  );
};

EditSubscription.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  subscriptionDetail: PropTypes.any.isRequired,
  onSubscriptionUpdate: PropTypes.func.isRequired,
  onSubscriptionDelete: PropTypes.func.isRequired,
};

EditSubscription.defaultProps = {
  subscriptionDetail: {},
};

export default EditSubscription;
