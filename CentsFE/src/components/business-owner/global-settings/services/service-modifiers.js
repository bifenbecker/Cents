import React, {Fragment, useEffect, useState} from "react";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import Checkbox from "../../../commons/checkbox/checkbox";

const ServiceModifiers = ({
  fetchModifiers,
  modifiersListCallInProgress,
  showHideAddModifierScreen,
  activeServiceId,
  modifiers,
  modifiersCallError,
  toggleModifierIsFeatured,
  clearModifiers,
  setUpdateValues,
  modifiersRefresh,
}) => {
  const [hoveredModifierId, setHoveredModifierId] = useState(null);

  useEffect(() => {
    fetchModifiers(activeServiceId);
    return () => {
      clearModifiers();
    };
  }, [fetchModifiers, activeServiceId, clearModifiers, modifiersRefresh]);

  return (
    <Fragment>
      {modifiersListCallInProgress ? <BlockingLoader /> : null}
      <main className="service-modifier-container">
        <p className="modifier-title">Choose Modifiers</p>
        <p>
          Select the modifiers you want to offer as add-ons to this service.
          <span> E.g. +$0.15/lb for eco-friendly detergent.</span>
        </p>
        <p className="modifier-note">
          *Note: modifiers will be the same price and available at all locations this
          service is offered.
        </p>
        <div
          className="add-modifier"
          onClick={() => {
            showHideAddModifierScreen(true);
          }}
        >
          <p className="plus-button">+</p>
          <p>Add New Modifier</p>
        </div>
        <div className="modifiers-list">
          {modifiersCallError ? (
            <p className="error-message">{modifiersCallError}</p>
          ) : (
            modifiers.map((modifier, idx) => (
              <div
                key={`${modifier.name}_${idx}`}
                className={`common-list-item`}
                onMouseEnter={() => {
                  setHoveredModifierId(modifier.serviceModifierId);
                }}
                onMouseLeave={() => {
                  setHoveredModifierId(null);
                }}
              >
                <Checkbox
                  checked={modifier.isFeatured}
                  onChange={() => {
                    toggleModifierIsFeatured({
                      serviceModifierId: modifier.serviceModifierId,
                      isFeatured: !modifier.isFeatured,
                    });
                  }}
                />
                <p className="service-item-type">{modifier.name}</p>
                <p className="service-item-dollar-amount">${modifier.price}/ lb</p>
                <button
                  className="btn btn-text-only cancel-button"
                  style={{
                    visibility:
                      hoveredModifierId === modifier.serviceModifierId
                        ? "visible"
                        : "hidden",
                  }}
                  onClick={() => {
                    showHideAddModifierScreen(true, true);
                    setUpdateValues({
                      name: modifier.name,
                      price: modifier.price,
                      modifierId: modifier.modifierId,
                    });
                  }}
                >
                  edit&gt;
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </Fragment>
  );
};

export default ServiceModifiers;
