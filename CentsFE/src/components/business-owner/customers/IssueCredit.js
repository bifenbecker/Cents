import React, {useState} from "react";

import MaterialSelect from "../../commons/select/select";
import exitIcon from "../../../assets/images/Icon_Exit_Side_Panel.svg";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import TextField from "../../commons/textField/textField";
import {
  INTERCOM_EVENTS_TEMPLATES,
  DEFAULT_INTERCOM_VALUES,
} from "constants/intercom-events";

const IssueCreditScreen = ({
  reasonsList,
  showHideIssueCreditScreen,
  issueCreditCallInProgress,
  issueCustomerCredit,
  activeCustomerDetails,
  issueCreditCallError,
  onIntercomEventTrack,
}) => {
  const [creditValue, setCreditValue] = useState("");
  const options = reasonsList.map((reasonItem) => ({
    value: reasonItem.id,
    label: reasonItem.reason,
  }));
  const [selectedReason, setSelectedReason] = useState(options[0]);

  const handleIssueNewCredit = () => {
    const payload = {
      reasonId: selectedReason.value,
      customerId: activeCustomerDetails.id,
      creditAmount: Number(creditValue),
    };
    issueCustomerCredit(payload).then((error) => {
      if (!error) {
        void onIntercomEventTrack?.(INTERCOM_EVENTS_TEMPLATES.customers.issueCredit, {
          Reason: selectedReason.label,
          "Full name": activeCustomerDetails.boFullName,
          "E-mail": activeCustomerDetails.boEmail || DEFAULT_INTERCOM_VALUES.NO_RECORD,
          "Phone number":
            activeCustomerDetails.boPhoneNumber || DEFAULT_INTERCOM_VALUES.NO_RECORD,
        });
      }
    });
  };

  return (
    <div className="issue-credit-container">
      <main className="issue-credit-form-container">
        <div className="exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              showHideIssueCreditScreen(false);
            }}
          />
        </div>
        <p>Issue Credit</p>
        <TextField
          label="Credit amount"
          prefix="$"
          className="issue-credit-textfield"
          value={creditValue}
          onChange={(evt) => {
            setCreditValue(
              evt.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
            );
          }}
          maxLength={6}
        />
        <MaterialSelect
          label="Select Reason"
          options={options}
          onChange={(selectedReason) => {
            setSelectedReason(selectedReason);
          }}
          value={selectedReason}
        />
      </main>
      <footer className="service-prices-footer">
        <p className="service-footer-error-message new-service">
          {issueCreditCallError || null}
        </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            showHideIssueCreditScreen(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded form-save-button"
          onClick={handleIssueNewCredit}
          disabled={!selectedReason?.value || !Number(creditValue)}
        >
          ISSUE CREDIT
        </button>
      </footer>
      {issueCreditCallInProgress && <BlockingLoader />}
    </div>
  );
};

export default IssueCreditScreen;
