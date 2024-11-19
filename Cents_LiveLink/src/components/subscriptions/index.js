import React, {useState, useEffect} from "react";
import {Flex} from "rebass/styled-components";
import {useHistory, useLocation} from "react-router-dom";
import {toast} from "react-toastify";

import useToggle from "../../hooks/useToggle";
import useFetchSubscriptions from "../../hooks/api/useFetchSubscriptions";
import {updateSubscription} from "../../api/subscriptions";
import {getQueryString} from "../../utils/common";

import {ScreenWrapper, ToastError, CancelSubscription} from "../common";
import CardWithHeaderAndFooter from "./common/card-with-header-and-footer";
import EditSubscription from "../edit-subscription";
import NoSubscriptions from "./NoSubscriptions";

const MySubscriptions = () => {
  const history = useHistory();
  const {search} = useLocation();
  const {subscriptionId} = getQueryString(search);

  const {isOpen, toggle} = useToggle();
  const [selectedSubscription, setSelectedSubscription] = useState();

  const {
    loading,
    subscriptions,
    getSubscriptions: fetchSubscriptionsList,
    setSubscriptions,
  } = useFetchSubscriptions({loading: true});

  useEffect(() => {
    fetchSubscriptionsList();
  }, [fetchSubscriptionsList]);

  useEffect(() => {
    if (subscriptionId) {
      if (!loading) {
        const currentSubscription = subscriptions?.find(
          sub => Number(sub?.recurringSubscriptionId) === Number(subscriptionId)
        );
        if (currentSubscription) {
          setSelectedSubscription(currentSubscription);
          toggle();
        }
        history.replace({search: ""});
      }
    }
  }, [loading, subscriptions, subscriptionId, history, toggle]);

  const onClose = () => {
    history.goBack();
  };

  const onSubscriptionClick = index => {
    setSelectedSubscription(subscriptions[index]);
    toggle();
  };

  const handleSubscriptionUpdate = susbcription => {
    const idx = subscriptions.findIndex(
      sub =>
        Number(sub?.recurringSubscriptionId) ===
        Number(susbcription?.recurringSubscriptionId)
    );
    setSubscriptions(state => {
      const newState = [...state];
      if (idx > -1) {
        newState[idx] = susbcription;
      } else {
        newState.push(susbcription);
      }
      return newState;
    });
  };

  const handleSubscriptionDelete = susbcription => {
    const idx = subscriptions.findIndex(
      sub =>
        Number(sub?.recurringSubscriptionId) ===
        Number(susbcription?.recurringSubscriptionId)
    );
    if (idx > -1) {
      setSubscriptions(state => {
        const newState = [...state];
        newState.splice(idx, 1);
        return newState;
      });
    }
  };

  // Delete subscriptions
  const {
    isOpen: isCancelOpen,
    setIsOpen: setIsCancelOpen,
    toggle: cancelToggle,
  } = useToggle();
  const [deleteSubscription, setDeleteSubscription] = useState({});
  const [deletingSubscription, setDeletingSubscription] = useState(false);

  const handleCancelSubscriptionClick = data => {
    setIsCancelOpen(true);
    setDeleteSubscription(data);
  };

  const handleDeleteSubscription = async () => {
    try {
      setDeletingSubscription(true);
      await updateSubscription(deleteSubscription?.recurringSubscriptionId, {
        isDeleted: true,
      });
      handleSubscriptionDelete(deleteSubscription);
      setDeleteSubscription();
      cancelToggle();
    } catch (_err) {
      toast.error(<ToastError message="Error while canceling recurring order" />);
    } finally {
      setDeletingSubscription(false);
    }
  };

  return (
    <>
      <ScreenWrapper
        header="My Recurring Orders"
        onClose={onClose}
        loading={loading || deletingSubscription}
        hideFooterButton
      >
        <Flex flexDirection="column">
          {subscriptions?.length ? (
            subscriptions?.map((subscription, index) => {
              return (
                <CardWithHeaderAndFooter
                  key={index}
                  subscription={subscription}
                  onClick={() => onSubscriptionClick(index)}
                  openCancelSubscriptionClick={handleCancelSubscriptionClick}
                />
              );
            })
          ) : !loading ? (
            <NoSubscriptions />
          ) : null}
        </Flex>
      </ScreenWrapper>
      <EditSubscription
        isOpen={isOpen}
        toggle={toggle}
        subscriptionDetail={selectedSubscription || {}}
        onSubscriptionUpdate={handleSubscriptionUpdate}
        onSubscriptionDelete={handleSubscriptionDelete}
      />
      <CancelSubscription
        isOpen={isCancelOpen}
        toggle={cancelToggle}
        cancelSubscription={handleDeleteSubscription}
      />
    </>
  );
};

export default MySubscriptions;
