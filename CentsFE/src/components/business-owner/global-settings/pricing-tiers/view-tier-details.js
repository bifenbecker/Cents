/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from "react";
import starIcon from "assets/images/star.svg";
import locationIcon from "assets/images/location.svg";
import tierTypeIcon from "assets/images/TierType.svg";
import userIcon from "assets/images/User.svg";
import washFoldIcon from "assets/images/Wash-Fold.svg";
import BlockingLoader from "components/commons/blocking-loader/blocking-loader";
import TextField from "components/commons/textField/textField";
import {getTierDetails, editTierDetails} from "api/business-owner/tiers";
import {TIER_TYPE} from "./constants";
import isEmpty from "lodash/isEmpty";
import {toDollars} from "../locations/utils/location";

const ViewTierDetails = (props) => {
  const {state, dispatch} = props;
  const [tierDetailsError, setTierDetailsError] = useState("");
  const [tierNameEditError, setTierNameEditError] = useState(null);
  const [tierName, setTierName] = useState(state?.tierDetails?.name);

  const fetchTierDetails = useCallback(async () => {
    try {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: true,
      });
      const resp = await getTierDetails(state?.selectedTierId);
      dispatch({
        type: "FETCH_TIERS_DETAILS",
        payload: resp?.data?.tier,
      });
      setTierNameEditError(null);
      setTierName(resp?.data?.tier?.name);
    } catch (error) {
      setTierDetailsError("Could not get tier details!");
    } finally {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: false,
      });
    }
  }, [dispatch, state.selectedTierId]);

  useEffect(() => {
    fetchTierDetails();
  }, [fetchTierDetails]);

  const handleTierNameChange = (evt) => {
    const {value} = evt.target;
    setTierName(value);
  };

  const handleTierNameEdit = async () => {
    setTierNameEditError(null);
    if (state?.tierDetails?.name !== tierName) {
      try {
        dispatch({
          type: "SET_EDIT_LOADER",
          payload: true,
        });
        const payload = {
          name: tierName,
          type: state?.tierDetails?.type,
        };
        await editTierDetails(payload, state?.selectedTierId);
        dispatch({
          type: "EDIT_TIER_NAME",
          payload: {...payload, id: state?.selectedTierId},
        });
      } catch (error) {
        state?.tierDetails?.name !== tierName && setTierName(state?.tierDetails?.name);
        setTierNameEditError(error?.response?.data?.error || "Could not edit tier name!");
      } finally {
        dispatch({
          type: "SET_EDIT_LOADER",
          payload: false,
        });
      }
    }
  };
  const openEditTierScreen = () => {
    dispatch({
      type: "TOGGLE_EDIT_TIER_WIZARD",
      payload: true,
    });
  };
  return (
    <>
      {state?.tierDetailsLoader ? <BlockingLoader /> : null}
      {tierDetailsError ? (
        <p className="view-tier-details-error-msg pricing-error-container">
          {tierDetailsError}
        </p>
      ) : state?.tierDetails ? (
        <div className="row services-row service-name-desc-row tier-details-row-padding">
          <div>
            <div className="inline-icon-container">
              <img src={starIcon} alt="icon" />
              <TextField
                isInline={true}
                label="Tier Name"
                className="team-member-input"
                value={tierName}
                onChange={handleTierNameChange}
                onBlur={handleTierNameEdit}
                error={tierNameEditError}
                maxLength={30}
              />
            </div>
            <div className="inline-icon-container">
              <img src={tierTypeIcon} alt="icon" />
              <p className="tier-details-text">
                {state?.tierDetails?.type?.toLowerCase()}
              </p>
            </div>
            <div className="inline-icon-container">
              <img
                src={
                  state?.tierDetails?.type === TIER_TYPE.commercial
                    ? userIcon
                    : locationIcon
                }
                alt="icon"
              />
              <div className="tier-details-container">
                <p className="customers-tier-details-heading">
                  {state?.tierDetails?.locationAndCustomerLabel}{" "}
                </p>
                {!isEmpty(state?.tierDetails?.locationAndCustomerData) ? (
                  state?.tierDetails?.locationAndCustomerData?.map((data, index) => {
                    return (
                      <p className="customers-tier-details-sub-text" key={index}>
                        {data?.name}
                      </p>
                    );
                  })
                ) : state?.tierDetails?.type === TIER_TYPE.commercial ? (
                  <p className="customers-tier-details-sub-text">
                    Enroll a commercial{" "}
                    <span>
                      {" "}
                      <a
                        href="/dashboard/customers"
                        className="customers-tier-details-sub-text-link"
                        rel="help"
                      >
                        customer{" "}
                      </a>
                    </span>
                    in this tier: <br />
                    1. Mark customer as a commercial customer <br />
                    2. Assign to pricing tier <br />
                    <a
                      href="https://help.trycents.com/commercial-tier"
                      className="customers-tier-details-sub-text-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Click here for more info
                    </a>
                  </p>
                ) : (
                  <p className="customers-tier-details-sub-text">
                    Update your{" "}
                    <span>
                      {" "}
                      <a
                        href="/global-settings/locations"
                        className="customers-tier-details-sub-text-link"
                        rel="help"
                      >
                        store’s{" "}
                      </a>
                    </span>{" "}
                    delivery settings to apply this pricing tier. <br />
                    <a
                      href="https://help.trycents.com/delivery-tier"
                      className="customers-tier-details-sub-text-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Click here for more info
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div className="inline-icon-container">
              <img src={washFoldIcon} alt="icon" />
              <div className="online-ordering-details">
                <p className="online-ordering-heading-Text">
                  Showcased Services for Online Ordering:{" "}
                </p>
                {state?.tierDetails?.deliverableServicePrices?.length ? (
                  state?.tierDetails?.deliverableServicePrices?.map(
                    ({category, name, hasMinPrice, storePrice}, index) => {
                      return (
                        <div
                          className="online-ordering-sub-Text-unit-container"
                          onClick={openEditTierScreen}
                          key={index}
                        >
                          <p className="online-ordering-sub-Text">{name || ""}</p>
                          <p className="online-ordering-sub-unit">
                            {" "}
                            {`(${hasMinPrice ? "min + " : ""}${toDollars(storePrice)} /
                            ${category === "PER_POUND" ? "lb" : "unit"})`}
                          </p>
                        </div>
                      );
                    }
                  )
                ) : (
                  <p className="no-online-ordering-msg-text" onClick={openEditTierScreen}>
                    No services selected for online ordering
                  </p>
                )}
              </div>
            </div>
          </div>
          {tierNameEditError && (
            <div className="tier-edit-error-container">
              <p className="error-message">{tierNameEditError}</p>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default ViewTierDetails;
