import React, {Fragment, useState, useEffect} from "react";

// Stripe elements
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
  Elements,
} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {STRIPE_KEY} from "../../../utils/config";

// Libraries
import * as yup from "yup";
import {Modal, ModalBody, ModalFooter} from "reactstrap";

// Icons
import defaultCreditCardIcon from "../../../assets/images/Icon_Credit Card-Icon_Payment Type_Side Panel.svg";
import visaIcon from "../../../assets/images/visa.png";
import masterCardIcon from "../../../assets/images/master-card.svg";
import americanExpressIcon from "../../../assets/images/american-express.png";
import emailIcon from "../../../assets/images/email.svg";
import exitIcon from "../../../assets/images/Icon_Exit_Side_Panel.svg";
import zipCodeIcon from "../../../assets/images/Icon_Zip Code-Icon_Region-District_Account Settings.svg";

// Commons
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import TextField from "../../../components/commons/textField/textField";
import {INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";

const CARD_OPTIONS = {
  style: {
    base: {
      color: "black",
      "::placeholder": {color: "#BBBBBB"},
    },
    invalid: {
      color: "#AB0000",
    },
  },
};

const cardBrandMapping = {
  visa: visaIcon,
  mastercard: masterCardIcon,
  amex: americanExpressIcon,
  unknown: defaultCreditCardIcon,
};

const emailSchema = yup.object().shape({
  email: yup.string().email("Email is a required field"),
});

const zipCodeSchema = yup.object().shape({
  zipCode: yup
    .string()
    .matches(/(^\d{5}$)|(^\d{5}-\d{4}$)/, "Invalid zip code")
    .required("Zip code is a required field"),
});

const stripePromise = loadStripe(STRIPE_KEY);

const AddCardScreen = (props) => {
  const [billingDetails, setBillingDetails] = useState({
    zipCode: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    cardNumberError: null,
    expiryError: null,
    cvcError: null,
    zipCodeError: null,
    emailError: null,
  });

  const [brand, setBrand] = useState(null);

  useEffect(() => {
    return () => {
      props.showHideAddCardScreen(false);
    };
  }, [props]);

  const handleEmail = (email) => {
    setBillingDetails((prevState) => ({...prevState, email}));
    if (!email) {
      setErrors((prevState) => ({...prevState, emailError: null}));
      return;
    }
    const res = emailSchema.validate({email}, {abortEarly: false});
    res
      .then(() => {
        setErrors((prevState) => ({...prevState, emailError: null}));
      })
      .catch((er) =>
        setErrors((prevState) => ({...prevState, emailError: er.errors[0]}))
      );
  };

  const handleZipCode = (zipCode) => {
    setBillingDetails((prevState) => ({...prevState, zipCode}));
    if (!zipCode) {
      setErrors((prevState) => ({...prevState, zipCodeError: null}));
      return;
    }
    const res = zipCodeSchema.validate({zipCode}, {abortEarly: false});
    res
      .then(() => {
        setErrors((prevState) => ({...prevState, zipCodeError: null}));
      })
      .catch((er) =>
        setErrors((prevState) => ({...prevState, zipCodeError: er.errors[0]}))
      );
  };

  const stripe = useStripe();
  const elements = useElements();

  const handleAddCard = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardNumberElement. Elements knows how
    // to find your CardNumberElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardNumberElement);

    props.addCardOnFile({
      stripe,
      cardElement,
      billingDetails,
      customerId: props.activeCustomerId,
    });
  };

  const handleDisableSave = () => {
    return Object.values(errors).filter(Boolean).length;
  };

  return (
    <div className="issue-credit-container">
      <main className="issue-credit-form-container">
        <p>Add a Card</p>

        <div className="card-form-container">
          <div className="form-field">
            <div className="image-container">
              <img src={cardBrandMapping[brand] || defaultCreditCardIcon} alt="icon" />
            </div>
            <div className="card-input card-number">
              <CardNumberElement
                options={CARD_OPTIONS}
                className={`element-card-number ${
                  errors.cardNumberError ? "error" : null
                }`}
                id="element-card-number"
                onChange={({brand, error}) => {
                  setBrand(brand);
                  setErrors((prevState) => ({
                    ...prevState,
                    cardNumberError: error?.message || null,
                  }));
                }}
              />
              <label htmlFor="element-card-number">Credit Card #</label>
            </div>
          </div>

          <div className="form-field">
            <div className="card-input expiry">
              <CardExpiryElement
                options={CARD_OPTIONS}
                className={`element-card-number ${errors.expiryError ? "error" : null}`}
                id="element-card-expiry"
                onChange={({error}) => {
                  setErrors((prevState) => ({
                    ...prevState,
                    expiryError: error?.message || null,
                  }));
                }}
              />
              <label htmlFor="element-card-expiry">Exp. Date</label>
            </div>
            <div className="card-input cvc">
              <CardCvcElement
                options={CARD_OPTIONS}
                className={`element-card-number ${errors.cvcError ? "error" : null}`}
                id="element-card-cvc"
                onChange={({error}) => {
                  setErrors((prevState) => ({
                    ...prevState,
                    cvcError: error?.message || null,
                  }));
                }}
              />
              <label htmlFor="element-card-cvc">CVC</label>
            </div>
          </div>

          <div className="form-field">
            <div className="image-container">
              <img src={zipCodeIcon} alt="icon" />
            </div>
            <TextField
              label="Zip Code"
              onChange={(evt) => {
                handleZipCode(evt.target.value.replace(/[^0-9]+/g, ""));
              }}
              className={`${errors.zipCodeError ? "error" : null}`}
              maxLength={5}
              value={billingDetails.zipCode}
            />
          </div>

          <div className="form-field">
            <div className="image-container">
              <img src={emailIcon} alt="icon" />
            </div>
            <TextField
              label="Email"
              onChange={(evt) => {
                handleEmail(evt.target.value);
              }}
              className={`${errors.emailError ? "error" : null}`}
            />
          </div>
        </div>
      </main>
      <footer className="service-prices-footer">
        <p className="service-footer-error-message new-service">
          {props.addCardOnFileError || props.stripeClientSecretError || null}
        </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            props.showHideAddCardScreen(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded form-save-button"
          onClick={handleAddCard}
          disabled={handleDisableSave()}
        >
          SAVE
        </button>
      </footer>
      {props.isLoadingInCardFileScreen ? <BlockingLoader /> : null}
    </div>
  );
};

const CardsOnFileScreen = (props) => {
  const [showModal, setShowModal] = useState(false);

  const [cardToDelete, setCardToDelete] = useState(null);

  const {getCardsOnFile, activeCustomerId, showAddCardScreen} = props;

  useEffect(() => {
    if (!showAddCardScreen) getCardsOnFile(activeCustomerId);
  }, [showAddCardScreen, getCardsOnFile, activeCustomerId]);

  return (
    <Fragment>
      {props.isLoadingInCardFileScreen ? <BlockingLoader /> : null}
      {props.showAddCardScreen ? (
        <Elements stripe={stripePromise}>
          <AddCardScreen {...props} />
        </Elements>
      ) : (
        <div className="cards-on-file-container">
          <div className="exit-icon-container">
            <img
              src={exitIcon}
              alt=""
              onClick={() => {
                props.showHideCardsOnFileScreen(false);
              }}
            />
          </div>

          <header className="name-and-title">
            <p>{props.activeCustomerDetails.boFullName}</p>
            <p>Cards on File</p>
          </header>

          <p className="saved-cards-title">Saved Cards</p>

          {!props.cardsOnFileList.length ? (
            <div
              className="add-card"
              onClick={() => {
                props.showHideAddCardScreen(true);
              }}
            >
              <p className="plus-button">+</p>
              <p>Add a Card</p>
            </div>
          ) : null}

          {props.cardsOnFileList.map((cardItem) => (
            <div key={cardItem.id} className="saved-card-item">
              <div className="image-container">
                <img src={cardBrandMapping[cardItem.card.brand]} alt="icon" />
              </div>
              <p>**** {cardItem.card.last4}</p>
              <p>
                Exp.{" "}
                {`${cardItem.card.exp_month}/${cardItem.card.exp_year
                  .toString()
                  .slice(-2)}`}
                <span
                  onClick={() => {
                    setShowModal(true);
                    setCardToDelete(cardItem.id);
                  }}
                >
                  &#x2715;
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={showModal}
        toggle={() => {
          setShowModal(!showModal);
        }}
        centered={true}
      >
        <ModalBody>Are you sure you want to remove the card ?</ModalBody>
        <ModalFooter>
          <button
            className="btn-theme btn-rounded save-button"
            onClick={() => {
              setShowModal(false);
            }}
          >
            GO BACK
          </button>
          <button
            className="btn-theme btn-rounded btn-transparent"
            onClick={() => {
              setShowModal(false);
              props
                .deleteCardOnFile(props.activeCustomerId, cardToDelete)
                .then((error) => {
                  if (!error) {
                    void props.onIntercomEventTrack?.(
                      INTERCOM_EVENTS_TEMPLATES.customers.removeCardOnFile,
                      {
                        "Card owner": props.activeCustomerDetails.boFullName,
                        "E-mail": props.activeCustomerDetails.boEmail,
                      }
                    );
                  }
                });
            }}
          >
            REMOVE CARD
          </button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default CardsOnFileScreen;
