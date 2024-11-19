import React, {useCallback, useEffect, useState} from "react";

// Icons
import personIcon from "../../../../../assets/images/person.svg";
import IconBasket from "../../../../../assets/images/Icon_Basket.svg";
import Key from "../../../../../assets/images/key.svg";
import Hyperlink from "../../../../../assets/images/Icon_Hyperlink.svg";
import ExitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";

// Components
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import Checkbox from "../../../../commons/checkbox/checkbox";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import RoundedTabSwitcher from "../../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import TextField from "../../../../commons/textField/textField";
import TextArea from "../../../../commons/text-area/text-area";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events.js";

const weighOrder = [
  {
    name: "Weigh 1: During intake (sales weight)",
    field: "isWeightDuringIntake",
    disabled: true,
  },
  {name: "Weigh 2: Before processing", field: "isWeightBeforeProcessing"},
  {name: "Weigh 3: After processing", field: "isWeightAfterProcessing"},
  {
    name: "Weigh 4: Upon completion / at pickup",
    field: "isWeightUpOnCompletion",
  },
];

const additionalWeighHub = [
  {
    name: "Weigh upon receiving order back at store",
    field: "isWeightReceivingAtStore",
  },
];

const salesWeights = [
  {
    name: "Weigh 1: During intake (offers both pre-pay and post-pay)",
    field: "DURING_INTAKE",
  },
  {
    name: "Weigh 4: Upon completion / at pickup (offers post-pay only)",
    field: "UPON_COMPLETION",
  },
];

const TIP_MAPPING = {
  PERCENTAGE: "tipPercentage",
  DOLLAR_AMOUNT: "tipDollars",
};

const Settings = ({
  fetchAccountSettings,
  accountSettings: {settings, settingSaveInProgress, settingsSaveError},
  UpdateAccountSettings,
  updateTipping,
  handleTermsOfServiceUrl,
  handleReceiptCustomMessage,
  updateConvenienceFee,
  deleteBagNoteTag,
}) => {
  const [newNoteTag, setNewNoteTag] = useState();

  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    fetchAccountSettings();
  }, [fetchAccountSettings]);

  useEffect(() => {
    if (settings?.isCustomUrl && !settings?.termsOfServiceUrl) {
      UpdateAccountSettings({isCustomUrl: false});
    }
    // eslint-disable-next-line
  }, []);

  const getTipError = () => {
    // Disable showing error until error experience is finalised
    // Please take a look at JIRA issue CENTS-809 for more info
    return null;
    if (settingsSaveError?.[TIP_MAPPING?.[settings.tipSettings?.tipType]]) {
      return (
        <p className="error-message tip">
          {
            Object.values(
              settingsSaveError?.[TIP_MAPPING?.[settings.tipSettings?.tipType]]
            )[0]
          }
        </p>
      );
    } else return null;
  };

  const getOptionValue = (optionNumber) => {
    if (settings.tipSettings?.tipType === "PERCENTAGE") {
      return (
        settings.tipSettings?.tipPercentage &&
        settings.tipSettings?.tipPercentage[`option${optionNumber}`]
      );
    } else {
      return (
        settings.tipSettings?.tipDollars &&
        settings.tipSettings?.tipDollars[`option${optionNumber}`]
      );
    }
  };

  const updateTipOptionValue = (optionNumber, value, makeAPICall) => {
    let tipSettings = {...settings.tipSettings};
    if (!makeAPICall) {
      if (tipSettings?.tipType === "PERCENTAGE") {
        tipSettings.tipPercentage = {
          ...tipSettings.tipPercentage,
          [`option${optionNumber}`]: value,
        };
      } else {
        tipSettings.tipDollars = {
          ...tipSettings.tipDollars,
          [`option${optionNumber}`]: value,
        };
      }

      updateTipping(
        {
          tipSettings,
        },
        false
      );
    } else {
      if (tipSettings?.tipType === "PERCENTAGE") {
        updateTipping(
          {
            tipPercentage: {
              [`option${optionNumber}`]: value > 100 ? 100 : value,
            },
          },
          true
        );
      } else {
        updateTipping(
          {
            tipDollars: {
              [`option${optionNumber}`]: value,
            },
          },
          true
        );
      }
    }
  };

  const updateConvenienceFeeValue = (value, makeAPICall) => {
    let convenienceFee = {...settings.convenienceFee};
    if (!makeAPICall) {
      convenienceFee.feeType = "PERCENTAGE";
      convenienceFee.fee = value;

      updateConvenienceFee(
        {
          convenienceFee,
        },
        false
      );
    } else {
      updateConvenienceFee(
        {
          fee: value,
        },
        true
      );
    }
  };

  /**
   * Update settings with new bag note tag and reset the form
   */
  const addNewBagNoteTag = () => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: 'Add new "Notes per Bag"',
      "Tag name": newNoteTag,
    });

    UpdateAccountSettings(
      {
        bagNoteTag: newNoteTag,
      },
      true
    );
    setNewNoteTag("");
  };

  /**
   * Remove a bag note tag
   *
   * @param {Number} tagId
   */
  const removeBagNoteTag = (tagId) => {
    deleteBagNoteTag(tagId);
  };

  const handleRequiredCodeChange = useCallback(
    (value) => {
      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "Require Employee Code on Actions Enabled/Disabled",
        Enabled: value,
      });

      UpdateAccountSettings({requiresEmployeeCode: value});
    },
    [UpdateAccountSettings, trackEvent]
  );

  const onStorageChange = useCallback(
    (value) => {
      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "Storage Tracking enabled/disabled",
        Enabled: value,
      });

      UpdateAccountSettings({requiresRack: value});
    },
    [UpdateAccountSettings, trackEvent]
  );

  const onServiceFeeChange = useCallback(
    (value) => {
      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "Service Fee enabled/disabled",
        Enabled: value,
      });

      UpdateAccountSettings({hasConvenienceFee: value});
    },
    [UpdateAccountSettings, trackEvent]
  );

  const onInStoreChange = useCallback(
    (value) => {
      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "In Store Tipping enabled/disabled",
        Enabled: value,
      });

      updateTipping(
        {
          allowInStoreTip: value,
        },
        true
      );
    },
    [trackEvent, updateTipping]
  );

  const onReceiptMessageBlur = useCallback(() => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "Receipt Customization",
      Text: settings?.receiptFooterMessage,
    });

    UpdateAccountSettings({
      receiptFooterMessage: settings?.receiptFooterMessage,
    });
  }, [UpdateAccountSettings, settings, trackEvent]);

  const onChangeCentsTos = () => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "TOS/Use Cents",
    });

    UpdateAccountSettings({isCustomUrl: false});
  };

  const onChangeCustomTos = () => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "TOS/Link to own TOS",
    });

    UpdateAccountSettings({isCustomUrl: true});
  };

  return (
    <div className="account-settings-container">
      {settingSaveInProgress && <BlockingLoader />}
      <div className="form-section settings-section">
        <img alt="icon" src={personIcon}></img>
        <div className="form-fields-container">
          <b>In-Store Team Management</b>
          <div className="toggle-container">
            <small>Require employee code on actions</small>
            <ToggleSwitch
              checked={settings?.requiresEmployeeCode}
              onChange={handleRequiredCodeChange}
            />
          </div>
        </div>
      </div>
      <div className="form-section settings-section">
        <img alt="icon" src={IconBasket}></img>
        <div className="form-fields-container">
          <b>Full Service Order Settings</b>
          {/* <div className='sub-form-fields-container'>
            <b>Sales Weight</b>
            <div className='list-container'>
              <small>Which weight should be used to determine pricing?</small>
              <div><i>Note: Orders with weigh 4 as the sales weight will only offer post-pay.</i></div>
              <div className="list-item-container">
                {salesWeights.map((item) => (
                  <div key={item.name}>
                    <small className='list-selection-item'>
                      <input
                        type="radio"
                        name="sales-weight"
                        value = {item.field}
                        checked={item.field === settings?.salesWeight}
                        onChange={() => {
                          UpdateAccountSettings({ salesWeight : item.field})
                        }}
                      />
                      {item.name}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          <div className="sub-form-fields-container">
            <b>Weight Tracking</b>
            <div className="list-container">
              <small>When would you like the order to be weighted?</small>
              {weighOrder.map((item) => (
                <div key={item.name}>
                  <small className="list-selection-item">
                    <Checkbox
                      checked={settings[item.field]}
                      // disabled={item.disabled || (item.field === "isWeightUpOnCompletion" && settings.salesWeight ==="UPON_COMPLETION")}
                      disabled={item.disabled}
                      onChange={() => {
                        // if(!(item.field ==="isWeightUpOnCompletion" && settings.salesWeight ==="UPON_COMPLETION") && !item.disabled){
                        if (!item.disabled) {
                          UpdateAccountSettings({
                            [item.field]: !settings[item.field],
                          });
                        }
                      }}
                    />
                    {"  "}
                    {item.name}
                  </small>
                </div>
              ))}
            </div>
          </div>
          <div className="sub-form-fields-container"></div>

          <div className="sub-form-fields-container">
            <b>Storage Tracking</b>
            <div className="toggle-container">
              <small>Record rack number after intake and after processing </small>
              <ToggleSwitch checked={settings?.requiresRack} onChange={onStorageChange} />
            </div>
          </div>

          <div className="sub-form-fields-container">
            <b>Notes per Bag</b>
            <div className="toggle-container" style={{paddingBottom: "12px"}}>
              <small>
                Save tags to use for quick notes per bag when you're intaking an order on
                the Tablet App
              </small>
            </div>
            <div className="in-line-container">
              <TextField
                label="Type a tag and click +"
                error={settingsSaveError?.bagNoteTag}
                className="url-textField"
                key={`notes-per-bag`}
                value={newNoteTag}
                onChange={(evt) => {
                  setNewNoteTag(evt.target.value);
                }}
              />
              <button
                className={newNoteTag ? "plus-button" : "plus-button disabled"}
                disabled={!newNoteTag}
                onClick={() => {
                  addNewBagNoteTag();
                }}
              >
                +
              </button>
            </div>
            {settings?.bagNoteTags?.length > 0 && (
              <div className="bag-notes-container">
                {settings?.bagNoteTags?.map((tag) => (
                  <>
                    <p className="bag-note-pill">
                      {tag.name}
                      <img
                        alt="delete-tag-icon"
                        src={ExitIcon}
                        onClick={() => {
                          removeBagNoteTag(tag.id);
                        }}
                      />
                    </p>
                  </>
                ))}
              </div>
            )}
            {settingsSaveError?.bagNoteTag ? (
              <p className="error-message">{settingsSaveError?.bagNoteTag}</p>
            ) : null}
          </div>

          <div className="sub-form-fields-container">
            <b>Terms of Service</b>
            <div className="list-container">
              <small>
                Your customer will see a link to read your terms of service when viewing
                their order status on their live link. Please select which terms we should
                use.
              </small>
              <div className="list-item-container">
                <div>
                  <small className="list-selection-item">
                    <input
                      type="radio"
                      name="terms-of-service"
                      value="cents standard terms of service"
                      checked={!settings?.isCustomUrl}
                      onChange={onChangeCentsTos}
                    />
                    Use the{" "}
                    <a
                      href="https://www.trycents.com/template/wdf-tos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cents Standard terms of service
                    </a>
                  </small>
                </div>
                <div>
                  <small className="list-selection-item">
                    <input
                      type="radio"
                      name="terms-of-service"
                      value="own terms of service"
                      checked={settings?.isCustomUrl}
                      onChange={onChangeCustomTos}
                    />
                    Link to my own terms of service
                  </small>
                  {settings?.isCustomUrl ? (
                    <div>
                      <div className="url-link-container">
                        <img alt="icon" src={Hyperlink} className="icon"></img>
                        <TextField
                          label="Enter URL"
                          error={settingsSaveError?.termsOfServiceUrl}
                          className="url-textField"
                          key={`url-link`}
                          value={settings?.termsOfServiceUrl}
                          onChange={(evt) => {
                            handleTermsOfServiceUrl(evt.target.value);
                          }}
                          onBlur={() => {
                            UpdateAccountSettings({
                              termsOfServiceUrl: settings.termsOfServiceUrl,
                            });
                          }}
                        />
                      </div>
                      {settingsSaveError?.termsOfServiceUrl ? (
                        <p className="error-message">
                          {settingsSaveError?.termsOfServiceUrl}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="sub-form-fields-container">
            <b>Receipt Customization </b>
            <div className="list-container">
              <small>
                Customize the memo that appears in the footer of the receipt that prints
                out when an order has been paid for.
              </small>
              <p className="grey-text">(300 character limit)</p>
              <div className="list-item-container">
                <TextArea
                  key={`receipt-customization-message`}
                  isInline={true}
                  label="Receipt Message"
                  className="receipt-message-area"
                  value={settings?.receiptFooterMessage}
                  maxLength={300}
                  onChange={(e) => {
                    handleReceiptCustomMessage(e.target.value);
                  }}
                  onBlur={onReceiptMessageBlur}
                  error={settingsSaveError?.receiptFooterMessage}
                />
                {settingsSaveError?.receiptFooterMessage ? (
                  <p className="error-message">
                    {settingsSaveError?.receiptFooterMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <p className={"sub-head"}>In Store Tipping</p>
          <div className="toggle-container">
            <small>
              Give your customers the opportunity to add a tip to their full service
              laundry order{" "}
            </small>
            <ToggleSwitch checked={settings.allowInStoreTip} onChange={onInStoreChange} />
          </div>
          {settings.allowInStoreTip && (
            <>
              <RoundedTabSwitcher
                roundedTabs={[
                  {label: "%", value: "PERCENTAGE"},
                  {label: "$", value: "DOLLAR_AMOUNT"},
                ]}
                activeRoundedTab={settings.tipSettings?.tipType}
                setActiveRoundedTab={(value) => {
                  updateTipping(
                    {
                      tipType: value,
                    },
                    true
                  );
                }}
                className={"tipping-switcher"}
              />
              <div className="in-line-container">
                <TextField
                  key={`tip-option-1-${settings.tipSettings?.tipType}`}
                  className={`tip-option ${
                    settings.tipSettings?.tipType === "PERCENTAGE" && "align-right"
                  }`}
                  label={"Option 1"}
                  suffix={settings.tipSettings?.tipType === "PERCENTAGE" && "%"}
                  prefix={settings.tipSettings?.tipType === "DOLLAR_AMOUNT" && "$"}
                  isInline={true}
                  value={getOptionValue(1)}
                  onChange={(e) =>
                    updateTipOptionValue(
                      1,
                      settings.tipSettings?.tipType === "PERCENTAGE"
                        ? e.target.value.replace(/[^0-9]+/g, "")
                        : e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1"),
                      false
                    )
                  }
                  onBlur={(e) =>
                    updateTipOptionValue(
                      1,
                      Math.round(Number(e.target.value) * 100) / 100 || 0,
                      true
                    )
                  }
                  maxLength={5}
                  error={
                    settings.tipSettings?.tipType === "DOLLAR_AMOUNT"
                      ? settingsSaveError?.tipDollars?.option1
                      : settingsSaveError?.tipPercentage?.option1
                  }
                />
                <TextField
                  key={`tip-option-2-${settings.tipSettings?.tipType}`}
                  className={`tip-option ${
                    settings.tipSettings?.tipType === "PERCENTAGE" && "align-right"
                  }`}
                  label={"Option 2"}
                  suffix={settings.tipSettings?.tipType === "PERCENTAGE" && "%"}
                  prefix={settings.tipSettings?.tipType === "DOLLAR_AMOUNT" && "$"}
                  isInline={true}
                  value={getOptionValue(2)}
                  onChange={(e) =>
                    updateTipOptionValue(
                      2,
                      settings.tipSettings?.tipType === "PERCENTAGE"
                        ? e.target.value.replace(/[^0-9]+/g, "")
                        : e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1"),
                      false
                    )
                  }
                  onBlur={(e) =>
                    updateTipOptionValue(
                      2,
                      Math.round(Number(e.target.value) * 100) / 100 || 0,
                      true
                    )
                  }
                  maxLength={5}
                  error={
                    settings.tipSettings?.tipType === "DOLLAR_AMOUNT"
                      ? settingsSaveError?.tipDollars?.option2
                      : settingsSaveError?.tipPercentage?.option2
                  }
                />
                <TextField
                  key={`tip-option-3-${settings.tipSettings?.tipType}`}
                  className={`tip-option ${
                    settings.tipSettings?.tipType === "PERCENTAGE" && "align-right"
                  }`}
                  label={"Option 3"}
                  suffix={settings.tipSettings?.tipType === "PERCENTAGE" && "%"}
                  prefix={settings.tipSettings?.tipType === "DOLLAR_AMOUNT" && "$"}
                  isInline={true}
                  value={getOptionValue(3)}
                  onChange={(e) =>
                    updateTipOptionValue(
                      3,
                      settings.tipSettings?.tipType === "PERCENTAGE"
                        ? e.target.value.replace(/[^0-9]+/g, "")
                        : e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1"),
                      false
                    )
                  }
                  onBlur={(e) =>
                    updateTipOptionValue(
                      3,
                      Math.round(Number(e.target.value) * 100) / 100 || 0,
                      true
                    )
                  }
                  maxLength={5}
                  error={
                    settings.tipSettings?.tipType === "DOLLAR_AMOUNT"
                      ? settingsSaveError?.tipDollars?.option3
                      : settingsSaveError?.tipPercentage?.option3
                  }
                />
              </div>
              {getTipError()}
            </>
          )}

          <p className={"sub-head"}>Service Fee</p>
          <div className="toggle-container">
            <small>Charge customers a service fee on every POS sale </small>
            <ToggleSwitch
              checked={settings?.hasConvenienceFee}
              onChange={onServiceFeeChange}
            />
          </div>
          {settings.hasConvenienceFee && (
            <>
              <div className="in-line-container">
                <TextField
                  key={`convenience-fee-1-${settings.convenienceFee?.feeType}`}
                  className={`convenience-fee ${
                    settings.convenienceFee?.feeType === "PERCENTAGE" && "align-right"
                  }`}
                  label={"Fee Amount"}
                  suffix={"%"}
                  isInline={true}
                  value={settings.convenienceFee?.fee}
                  onChange={(event) => {
                    updateConvenienceFeeValue(event.target.value, false);
                  }}
                  onBlur={(event) => {
                    const fee = Math.round(Number(event.target.value) * 100) / 100 || 0;
                    updateConvenienceFeeValue(fee, true);
                  }}
                  maxLength={5}
                />
                <p className="disclaimer">
                  The service fee can be removed at the point of sale.
                </p>
              </div>
              {settingsSaveError?.fee ? (
                <p className="error-message">{settingsSaveError?.fee}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
      <div className="form-section settings-section">
        <img alt="icon" src={Key}></img>
        <div className="form-fields-container">
          <b>Hub Settings</b>
          <div className="toggle-container">
            <small>Bag tracking</small>
            <ToggleSwitch
              checked={settings?.isBagTrackingEnabled}
              onChange={(value) => {
                UpdateAccountSettings({isBagTrackingEnabled: value});
              }}
            />
          </div>
          <div className="list-container">
            <br />
            <small>Add additional weigh for Hub orders:</small>
            {additionalWeighHub.map((item) => (
              <div key={item.name}>
                <small className="list-selection-item">
                  <Checkbox
                    checked={settings[item.field]}
                    onChange={() => {
                      UpdateAccountSettings({
                        [item.field]: !settings[item.field],
                      });
                    }}
                  />
                  {"  "}
                  {item.name}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
