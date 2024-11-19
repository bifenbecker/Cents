import React, {useState, useEffect, useCallback} from "react";
import checkIcon from "../../../../../assets/images/Icon_Blue_tick.svg";
import checkIconGreen from "../../../../../assets/images/Icon_Check_Green.svg";
import bankIcon from "../../../../../assets/images/Icon_Bank_Account.svg";
import TextField from "../../../../commons/textField/textField";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import StatusIndicator from "../../../../commons/statusIndicator/statusIndicator";
import {Modal, ModalBody, ModalFooter} from "reactstrap";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events.js";

const REFRESH_MESSAGE = "Refresh this page after Stripe Form Submission is complete";

const PaymentsGetStarted = ({onGetStarted}) => (
  <main className="account-payments-body">
    <p>Get setup to receive payments.</p>
    <p>
      <img src={checkIcon} alt="icon" />
      Enable your customers to easily pay by credit or debit card
    </p>
    <p>
      <img src={checkIcon} alt="icon" />
      Get paid out by Cents in 2-3 business days
    </p>
    <p>
      <img src={checkIcon} alt="icon" />
      Track your payments on Cents
    </p>
    <button
      className="btn-theme btn-rounded form-save-button payments-button"
      onClick={onGetStarted}
    >
      GET STARTED
    </button>
  </main>
);

const SetupPaymentWizard = ({account, onVerify, verificationLink, onAddAccount}) => {
  const {trackEvent} = useTrackEvent();

  const [showRefreshPageMessage, setShowRefreshPageMessage] = useState(false);
  const [bankAccountDetails, setBankAccountDetails] = useState({
    account_number: "",
    routing_number: "",
  });
  const {
    requirements: {currently_due, eventually_due},
  } = account;

  const isVerified = [...currently_due, ...eventually_due].filter(
    (req) => req !== "external_account"
  ).length
    ? false
    : true;

  useEffect(() => {
    if (!isVerified) {
      onVerify("onboarding");
    }
  }, [isVerified, onVerify]);

  const onClickSubmit = () => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "Routing/Account Number Verified",
      "Button name": "SUBMIT",
    });

    onAddAccount(bankAccountDetails);
  };

  const onClickVerify = () => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "Stripe Identity Verification",
      "Button name": "VERIFY BUSINESS",
    });

    setShowRefreshPageMessage(true);
    window.open(verificationLink, "_blank");
  };

  return (
    <>
      <p className="payment-wizard-title">Get set up to receive payments.</p>
      <div className="payment-wizard-step-container">
        <div className="payment-wizard-step-number">1</div>
        <p className="payment-wizard-step-text">Verify your identity through Stripe</p>
      </div>
      <div className="verification-status-container">
        {!isVerified ? (
          <button
            className="btn-theme btn-rounded save-button verify-business-button"
            onClick={onClickVerify}
          >
            VERIFY BUSINESS
          </button>
        ) : (
          <p className="payment-wizard-verified-text">
            <img src={checkIconGreen} alt="icon" /> Verified
          </p>
        )}
        {showRefreshPageMessage ? (
          <p className="payment-wizard-refresh-text">{REFRESH_MESSAGE}</p>
        ) : null}
      </div>

      <div className="payment-wizard-step-container">
        <div className={`payment-wizard-step-number ${!isVerified ? "disabled" : ""}`}>
          2
        </div>
        <p className={`payment-wizard-step-text ${!isVerified ? "disabled" : ""}`}>
          Add your bank account details
        </p>
      </div>
      <div className="verification-status-container">
        <TextField
          label="Routing Number"
          isInline={true}
          className={`payment-input ${!isVerified ? "disabled" : ""}`}
          onChange={({target: {value: routing_number}}) => {
            setBankAccountDetails((prevState) => ({
              ...prevState,
              routing_number: routing_number.replace(/[^0-9]+/g, ""),
            }));
          }}
          value={bankAccountDetails.routing_number}
        />
        <TextField
          label="Account Number"
          isInline={true}
          className={`payment-input ${!isVerified ? "disabled" : ""}`}
          onChange={({target: {value: account_number}}) => {
            setBankAccountDetails((prevState) => ({
              ...prevState,
              account_number: account_number.replace(/[^0-9]+/g, ""),
            }));
          }}
          value={bankAccountDetails.account_number}
        />
        <button
          className="btn-theme btn-rounded save-button payment-submit-button"
          disabled={
            !isVerified ||
            !bankAccountDetails.account_number ||
            !bankAccountDetails.routing_number
          }
          onClick={onClickSubmit}
        >
          SUBMIT
        </button>
      </div>
    </>
  );
};

const ConnectedAccount = ({
  bankAccount,
  showModal,
  setShowModal,
  updateBankAccount,
  updateBankAccountCallError,
  updateBankAccountCallInProgress,
}) => {
  const [bankAccountDetails, setBankAccountDetails] = useState({
    account_number: "",
    routing_number: "",
  });

  useEffect(() => {
    if (!showModal) {
      setBankAccountDetails({
        account_number: "",
        routing_number: "",
      });
    }
  }, [showModal]);

  return (
    <>
      <div className="connected-account-title">
        <img src={bankIcon} alt="icon" />
        <p>Connected Account</p>
      </div>
      <div className="connected-account-details">
        <img src={checkIconGreen} alt="icon" />
        <p>
          {bankAccount.bank_name} **** {bankAccount.last4}
        </p>
      </div>
      <div className="update-payment-details-container">
        {/* <button
          className="btn btn-text-only cancel-button update-payment"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Update payment details {">"}
        </button> */}
      </div>

      <Modal
        isOpen={showModal}
        toggle={() => {
          setShowModal(!showModal);
        }}
        centered={true}
      >
        {updateBankAccountCallInProgress ? <BlockingLoader /> : null}
        <ModalBody>
          <div className="update-bank-container">
            <p>Update Payment Details</p>
            <div className="verification-status-container">
              <TextField
                label="Routing Number"
                className="payment-input"
                onChange={({target: {value: routing_number}}) => {
                  setBankAccountDetails((prevState) => ({
                    ...prevState,
                    routing_number: routing_number.replace(/[^0-9]+/g, ""),
                  }));
                }}
                value={bankAccountDetails.routing_number}
              />
              <TextField
                label="Account Number"
                className="payment-input"
                onChange={({target: {value: account_number}}) => {
                  setBankAccountDetails((prevState) => ({
                    ...prevState,
                    account_number: account_number.replace(/[^0-9]+/g, ""),
                  }));
                }}
                value={bankAccountDetails.account_number}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="update-payment-footer">
          <div className="update-payment-buttons-container">
            <button
              className="btn-theme btn-rounded btn-transparent"
              onClick={() => {
                setShowModal(false);
              }}
            >
              CANCEL
            </button>
            <button
              className="btn-theme btn-rounded save-button"
              onClick={() => {
                updateBankAccount(bankAccountDetails, bankAccount.id);
              }}
              disabled={
                !bankAccountDetails.account_number || !bankAccountDetails.routing_number
              }
            >
              UPDATE
            </button>
          </div>
          {updateBankAccountCallError ? (
            <p className="update-bank-error">{updateBankAccountCallError}</p>
          ) : null}
        </ModalFooter>
      </Modal>
    </>
  );
};

const Payments = (props) => {
  const {
    fetchConnectedAccount,
    stripeConnectedAccountDetails,
    createStripeAccountCallInProgress,
    fetchStripeConnectedAccountCallInProgress,
    createConnectedAccount,
    fetchStripeVerificationLinkCallInProgress,
    stripeConnectedAccountCallError,
    createStripeAccountCallError,
    stripeVerificationLinkCallError,
    stripeVerificationLink,
    fetchVerificationLink,
    addBankAccountCallInProgress,
    bankAccount,
    addBankAccountCallError,
    addBankAccount,
    fetchBankAccountCallInProgress,
    fetchBankAccountCallError,
    getBankAccount,
    setShowModal,
    showModal,
    updateBankAccount,
    updateBankAccountCallInProgress,
    updateBankAccountCallError,
  } = props;

  useEffect(() => {
    getBankAccount();
    fetchConnectedAccount();
  }, [fetchConnectedAccount, getBankAccount]);

  const {trackEvent} = useTrackEvent();

  const showLoader = () => {
    if (
      createStripeAccountCallInProgress ||
      fetchStripeConnectedAccountCallInProgress ||
      fetchStripeVerificationLinkCallInProgress ||
      addBankAccountCallInProgress ||
      fetchBankAccountCallInProgress
    ) {
      return <BlockingLoader />;
    } else {
      return null;
    }
  };

  const showError = () =>
    stripeConnectedAccountCallError ||
    createStripeAccountCallError ||
    stripeVerificationLinkCallError ||
    addBankAccountCallError ||
    "";

  const onGetStarted = useCallback(() => {
    createConnectedAccount();

    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "Payments - Get started",
      "Button name": "Get started",
    });
  }, [createConnectedAccount, trackEvent]);

  return (
    <div className="account-payments-container">
      {showLoader()}
      {bankAccount?.id ? (
        <ConnectedAccount
          bankAccount={bankAccount}
          setShowModal={setShowModal}
          showModal={showModal}
          updateBankAccount={updateBankAccount}
          updateBankAccountCallInProgress={updateBankAccountCallInProgress}
          updateBankAccountCallError={updateBankAccountCallError}
        />
      ) : stripeConnectedAccountDetails?.id ? (
        <SetupPaymentWizard
          account={stripeConnectedAccountDetails}
          onVerify={fetchVerificationLink}
          verificationLink={stripeVerificationLink}
          onAddAccount={addBankAccount}
        />
      ) : (
        <PaymentsGetStarted onGetStarted={onGetStarted} />
      )}
      <footer className="account-payments-footer">
        <StatusIndicator status={bankAccount?.id ? "paired" : "inactive"} />
        <span>
          {bankAccount?.id ? "READY TO RECEIVE PAYMENTS" : "NO BANK ACCOUNT CONNECTED"}
        </span>
        <span className="payments-error">{showError()}</span>
      </footer>
    </div>
  );
};

export default Payments;
