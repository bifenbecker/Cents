import React, {useState, useEffect, useCallback} from "react";
import {fetchSubscriptions} from "../../../api/business-owner/customers";
import recurringClockIcon from "../../../assets/images/Icon_Recurring_Clock.svg";
import {SUBSCRIPTION_INTERVAL_DISPLAY} from "../../../constants";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";

const Subscriptions = ({activeCustomerId, storeIds}) => {
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSubscriptionsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSubscriptions(activeCustomerId, storeIds);
      if (res.data.success) {
        setSubscriptionsList(res.data.subscriptions || []);
      }
    } catch (error) {
      setErrorMessage("Failed to fetch customer subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [activeCustomerId, storeIds]);

  useEffect(() => {
    fetchSubscriptionsList();
  }, [fetchSubscriptionsList]);

  return (
    <>
      {loading ? (
        <BlockingLoader />
      ) : (
        <div className="customer-subscription-container">
          {subscriptionsList?.length ? (
            subscriptionsList?.map((subscriptionItem, index) => {
              return (
                <div className="row" key={index}>
                  <div className="subscription-section section-item">
                    <img alt="icon" src={recurringClockIcon} className="icon" />
                    <div className="text-container">
                      <p className="head-text">Recurring Pickup & Delivery</p>
                      <p className="address-text">
                        {subscriptionItem?.centsCustomerAddress?.address1},{" "}
                        {subscriptionItem?.centsCustomerAddress?.city},{" "}
                        {
                          subscriptionItem?.centsCustomerAddress
                            ?.firstLevelSubdivisionCode
                        }
                      </p>
                      <div className="field-container">
                        <p className="bold-text">Frequency:</p>
                        <p className="normal-text">
                          {SUBSCRIPTION_INTERVAL_DISPLAY[subscriptionItem?.interval || 1]}
                        </p>
                      </div>
                      {subscriptionItem?.pickup ? (
                        <div className="field-container">
                          <p className="bold-text">Pickup:</p>
                          <p className="normal-text">
                            {subscriptionItem?.pickup.replace("day", "days")}
                          </p>
                        </div>
                      ) : null}
                      {subscriptionItem?.delivery ? (
                        <div className="field-container">
                          <p className="bold-text">Delivery:</p>
                          <p className="normal-text">
                            {subscriptionItem?.delivery.replace("day", "days")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {/* <a className="btn btn-text-only blue-text">Edit</a> */}
                </div>
              );
            })
          ) : (
            <div className="no-search-results">
              <p>
                {errorMessage
                  ? errorMessage
                  : "Customer haven’t set up any subscriptions yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default Subscriptions;
