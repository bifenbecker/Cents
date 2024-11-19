import React, {useState, useEffect, useCallback} from "react";
import {getTierDetails, editTierDetails} from "api/business-owner/tiers";
import CommercialDeliveryFee from "./commercial-delivery";

const EditCommercialTierDelivery = ({state, dispatch}) => {
  const [tierDetailsError, setTierDetailsError] = useState("");
  const [deliveryFeeEditError, setDeliveryFeeEditError] = useState(null);
  const [deliveryFeeInCents, setDeliveryFeeInCents] = useState(
    state?.tierDetails?.commercialDeliveryFeeInCents
  );

  const fetchDeliveryFee = useCallback(async () => {
    try {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: true,
      });
      const resp = await getTierDetails(state.selectedTierId);
      dispatch({
        type: "FETCH_TIERS_DETAILS",
        payload: resp?.data?.tier,
      });
      setDeliveryFeeEditError(null);
      setDeliveryFeeInCents(resp?.data?.tier?.commercialDeliveryFeeInCents);
    } catch (error) {
      setTierDetailsError("Could not get commercial delivery fee details!");
    } finally {
      dispatch({
        type: "SET_EDIT_LOADER",
        payload: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedTierId]);

  useEffect(() => {
    fetchDeliveryFee();
  }, [fetchDeliveryFee]);

  const updateDeliveryFee = async (updatedDeliveryFeeInCents) => {
    setDeliveryFeeEditError(null);

    if (
      !updatedDeliveryFeeInCents &&
      updatedDeliveryFeeInCents !== 0 && // free pickup and delivery
      updatedDeliveryFeeInCents !== null // location-based fee
    ) {
      setDeliveryFeeEditError("Pickup / delivery fee must be greater than 0.");
      return;
    }

    if (state?.tierDetails?.commercialDeliveryFeeInCents !== updatedDeliveryFeeInCents) {
      try {
        dispatch({
          type: "SET_EDIT_LOADER",
          payload: true,
        });
        const payload = {
          commercialDeliveryFeeInCents: updatedDeliveryFeeInCents,
        };
        await editTierDetails(payload, state?.selectedTierId);
        dispatch({
          type: "EDIT_COMMERCIAL_TIER_DELIVERY_FEE",
          payload: {...payload, id: state?.selectedTierId},
        });
      } catch (error) {
        setDeliveryFeeEditError(
          error?.response?.data?.error || "Could not edit commercial delivery fee!"
        );
      } finally {
        dispatch({
          type: "SET_EDIT_LOADER",
          payload: false,
        });
      }
    }
  };

  return (
    <>
      <div className="delivery-container">
        {tierDetailsError ? (
          <p className="view-tier-details-error-msg pricing-error-container">
            {tierDetailsError}
          </p>
        ) : null}

        {deliveryFeeEditError ? (
          <div className="tier-edit-error-container">
            <p className="error-message">{deliveryFeeEditError}</p>
          </div>
        ) : null}

        {state?.tierDetails ? (
          <CommercialDeliveryFee
            loading={state?.tierDetailsLoader}
            onDeliveryFeeUpdate={updateDeliveryFee}
            initialCommercialDeliveryFee={deliveryFeeInCents}
          />
        ) : null}
      </div>
    </>
  );
};

export default EditCommercialTierDelivery;
