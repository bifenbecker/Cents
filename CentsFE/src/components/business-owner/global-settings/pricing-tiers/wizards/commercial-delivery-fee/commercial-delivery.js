import React, {Fragment, useState, useEffect} from "react";
import BlockingLoader from "components/commons/blocking-loader/blocking-loader";
import CentsInput from "components/commons/currency-input/cents-input";
import {centsToDollarsDisplay} from "components/business-owner/global-settings/locations/utils/location";

const CommercialDeliveryFee = ({
  onDeliveryFeeUpdate,
  loading,
  initialCommercialDeliveryFee,
}) => {
  const [hasFreeDelivery, setHasFreeDelivery] = useState(false);
  const [useLocationDeliveryFee, setUseLocationDeliveryFee] = useState(
    initialCommercialDeliveryFee == null || initialCommercialDeliveryFee === undefined
  );
  const [useCustomDeliveryFee, setUseCustomDeliveryFee] = useState(false);
  const [deliveryFeeInCents, setDeliveryFeeInCents] = useState(
    initialCommercialDeliveryFee
  );
  const [customDeliveryFeeInCents, setCustomDeliveryFeeInCents] = useState(
    initialCommercialDeliveryFee
  );

  const handleOptionChange = (e) => {
    const {name} = e.target;
    if (name === "freeDelivery") {
      setDeliveryFeeInCents(0);

      setHasFreeDelivery(true);
      setUseLocationDeliveryFee(false);
      setUseCustomDeliveryFee(false);
    } else if (name === "locationDeliveryFee") {
      setDeliveryFeeInCents(null);

      setUseLocationDeliveryFee(true);
      setHasFreeDelivery(false);
      setUseCustomDeliveryFee(false);
    } else if (name === "customDeliveryFee") {
      setCustomDeliveryFeeInCents(deliveryFeeInCents);

      setUseLocationDeliveryFee(false);
      setHasFreeDelivery(false);
      setUseCustomDeliveryFee(true);
    }
  };

  useEffect(() => {
    onDeliveryFeeUpdate(deliveryFeeInCents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFeeInCents]);

  // initialize the checked radio button based on the existing commercial delivery fee value
  useEffect(() => {
    switch (initialCommercialDeliveryFee) {
      case 0:
        setHasFreeDelivery(true);
        setUseLocationDeliveryFee(false);
        setUseCustomDeliveryFee(false);
        break;
      case null:
        setUseLocationDeliveryFee(true);
        setHasFreeDelivery(false);
        setUseCustomDeliveryFee(false);
        break;
      case undefined:
        break;
      default:
        setUseCustomDeliveryFee(true);
        setUseLocationDeliveryFee(false);
        setHasFreeDelivery(false);
        break;
    }
  }, [initialCommercialDeliveryFee]);

  return (
    <Fragment>
      <div className="commercial-delivery-fee-container">
        {loading ? <BlockingLoader /> : null}
        <div className="commercial-delivery-fee-selection">
          <div className="content-header-text">
            Do you want to charge your commercial customers on this tier for pickup and
            delivery?
          </div>
          <div className="radio-btns-container">
            <div>
              <label>
                <input
                  name="freeDelivery"
                  type="radio"
                  value={hasFreeDelivery}
                  checked={hasFreeDelivery}
                  onChange={handleOptionChange}
                />
                Free pickup & delivery
              </label>
            </div>
            <div>
              <label>
                <input
                  name="locationDeliveryFee"
                  type="radio"
                  value={useLocationDeliveryFee}
                  checked={useLocationDeliveryFee}
                  onChange={handleOptionChange}
                />
                Use pickup & delivery fee settings from the servicing location
              </label>
            </div>
            <div>
              <label>
                <input
                  name="customDeliveryFee"
                  type="radio"
                  value={useCustomDeliveryFee}
                  checked={useCustomDeliveryFee}
                  onChange={handleOptionChange}
                />
                Set custom pickup & delivery fee
              </label>
            </div>
          </div>
          <div>
            {useCustomDeliveryFee ? (
              <>
                <CentsInput
                  label="Roundtrip fee"
                  suffix="roundtrip"
                  hideSuffixOnBlur
                  focusedLabel="Pickup & delivery fee"
                  className="flat-fee-input"
                  onCentsChange={setCustomDeliveryFeeInCents}
                  onBlur={(evt) => {
                    setDeliveryFeeInCents(customDeliveryFeeInCents);
                  }}
                  maxLimit={9999.99}
                  value={customDeliveryFeeInCents}
                />
                {deliveryFeeInCents ? (
                  <span className="each-way-fee">
                    ({centsToDollarsDisplay(customDeliveryFeeInCents / 2)} each way)
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CommercialDeliveryFee;
