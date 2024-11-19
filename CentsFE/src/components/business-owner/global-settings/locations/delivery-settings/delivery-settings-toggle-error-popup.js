import React, {useMemo} from "react";
import Modal from "../../../../commons/modal/modal";

const DeliverySettingsToggleErrorPopup = (props) => {
  const {settingsToggleErrorData, setSettingsToggleErrorData} = props;
  const onClose = () => {
    setSettingsToggleErrorData();
  };

  const errorHeader = useMemo(() => {
    switch (settingsToggleErrorData?.type) {
      case "On Demand Settings":
        return "On-demand pickup & delivery";
      case "Own Driver Settings":
        return "Pickup & delivery with your own drivers";
      default:
        return "Delivery settings";
    }
  }, [settingsToggleErrorData.type]);

  const errorMessage = useMemo(() => {
    const {activeOrderDeliveriesCount, activeRecurringSubscriptionCount} =
      settingsToggleErrorData;
    return [
      activeOrderDeliveriesCount
        ? `${activeOrderDeliveriesCount} ${
            activeOrderDeliveriesCount === 1 ? "order" : "orders"
          } scheduled for pickup or delivery,`
        : "",
      activeRecurringSubscriptionCount
        ? `${activeRecurringSubscriptionCount} active ${
            activeRecurringSubscriptionCount === 1 ? "subscription" : "subscriptions"
          }`
        : "",
    ]
      .filter((v) => !!v)
      .join(" and ");
  }, [settingsToggleErrorData]);

  return (
    <Modal isConfirmationPopup>
      <div className="zipcodes-validation-popup-body">
        <p className="header">{errorHeader} cannot be disabled</p>

        <p>
          You currently have {errorMessage} which must be completed or canceled before you
          can disable {errorHeader.toLowerCase()}.
        </p>

        <div className="modal-buttons-container">
          <button className="btn-theme btn-rounded small-button" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeliverySettingsToggleErrorPopup;
