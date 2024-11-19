import React, {useState} from "react";

import CentsInput from "../../../../../../commons/currency-input/cents-input";
import Checkbox from "../../../../../../commons/checkbox/checkbox.js";
import {centsToDollarsDisplay} from "../../../utils/location";
import Radio from "../../../../../../commons/radio/radio.js";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

const DeliveryFee = ({
  zones,
  resetError,
  isFreeDelivery,
  setIsFreeDelivery,
  deliveryFeeInCents,
  setDeliveryFeeInCents,
  returnDeliveryFeeInCents,
  setReturnDeliveryFeeInCents,
  flags,
}) => {
  const [isZoneWiseFeeSet, setIsZoneWiseFeeSet] = useState(false);

  return (
    <div className="delivery-fee-container">
      <span className="content-header-text">
        Would you like to charge your customers for pickup & delivery?
      </span>
      <div className="fee-options-container">
        <div className="list-selection-item">
          <Radio
            selected={isFreeDelivery}
            onChange={() => {
              setIsFreeDelivery(true);
            }}
          />
          Free pickup & delivery
        </div>
        <div className="list-selection-item">
          <Radio
            selected={!isFreeDelivery}
            onChange={() => {
              setIsFreeDelivery(false);
            }}
          />
          Charge a flat fee for pickup & delivery
        </div>
        {!isFreeDelivery ? (
          <div>
            {/* set false to hasZones to add zone wise delivery fee */}
            {false ? (
              <div className="list-selection-item list-margin">
                <Checkbox
                  checked={isZoneWiseFeeSet}
                  onChange={() => setIsZoneWiseFeeSet(!isZoneWiseFeeSet)}
                />
                <p className="pick-up-drop-off-hours__set-radio-text">
                  Set fee per pickup / delivery zone
                </p>
              </div>
            ) : null}
            {isZoneWiseFeeSet ? (
              zones.map((zone, index) => (
                <div key={index} className="zone-wise-zip-row">
                  <span className="zone-name">{zone.name}</span>
                  <CentsInput
                    label="Pickup & delivery fee"
                    suffix="roundtrip"
                    hideSuffixOnBlur
                    className="zone-wise-fee-input"
                    onCentsChange={(valueInCents) => {
                      resetError();
                      // Set zone wise delivery fees. Create can be done in the same zones obj. Edit should be done depending on hasZones or not.
                    }}
                    maxLimit={9999.99}
                    value={zone.deliveryFeeInCents}
                  />
                </div>
              ))
            ) : (
              <>
                <CentsInput
                  label="Roundtrip fee"
                  suffix="roundtrip"
                  hideSuffixOnBlur
                  focusedLabel="Pickup & delivery fee"
                  className="flat-fee-input"
                  onCentsChange={(valueInCents) => {
                    resetError();
                    setDeliveryFeeInCents(valueInCents);
                  }}
                  maxLimit={9999.99}
                  value={deliveryFeeInCents}
                />
                {deliveryFeeInCents ? (
                  <span className="each-way-fee">
                    ({centsToDollarsDisplay(deliveryFeeInCents / 2)} each way)
                  </span>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
      <br />
      <span className="content-header-text">
        Do you want to charge a different fee for walk-in orders where the customer opts
        for return delivery?
      </span>
      <div className="fee-options-container">
        <CentsInput
          label="Return fee"
          focusedLabel="Delivery only fee"
          className="flat-fee-input"
          onCentsChange={(returnValueInCents) => {
            resetError();
            setReturnDeliveryFeeInCents(returnValueInCents);
          }}
          maxLimit={9999.99}
          value={returnDeliveryFeeInCents}
        />
      </div>
    </div>
  );
};

export default withLDConsumer()(DeliveryFee);
