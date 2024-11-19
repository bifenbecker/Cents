import React, {Component, Fragment} from "react";

import TextField from "../../../commons/textField/textField";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";
import ToggleSwitch from "../../../commons/toggle-switch/toggleSwitch";

class EsdRegistration extends Component {
  state = {
    showCashCardOptions:
      this.props.locations.selectedLocation.hasEsdEnabled ||
      this.props.locations.selectedLocation.hasCciEnabled ||
      this.props.locations.selectedLocation.hasLaundroworksEnabled ||
      this.props.locations.selectedLocation.hasSpyderWashEnabled
        ? true
        : false,
    hasEsdEnabled: this.props.locations.selectedLocation.hasEsdEnabled,
    hasCciEnabled: this.props.locations.selectedLocation.hasCciEnabled,
    hasLaundroworksEnabled: this.props.locations.selectedLocation.hasLaundroworksEnabled,
    hasSpyderWashEnabled: this.props.locations.selectedLocation.hasSpyderWashEnabled,
    esdLocationId: this.props.locations.selectedLocation?.esdReader?.esdLocationId,
    deviceSerialNumber: this.props.locations.selectedLocation?.esdReader
      ?.deviceSerialNumber,
    username: this.props.locations.selectedLocation.cciSettings?.username,
    password: this.props.locations.selectedLocation.cciSettings?.password,
    cciStoreId: this.props.locations.selectedLocation.cciSettings?.cciStoreId,
    hasCashEnabled: this.props.locations.selectedLocation.hasCashEnabled,
    hasCashDrawer: this.props.locations.selectedLocation.hasCashDrawer,
    laundroworksUsername: this.props.locations.selectedLocation.laundroworksSettings
      ?.username,
    laundroworksPassword: this.props.locations.selectedLocation.laundroworksSettings
      ?.password,
    customerKey: this.props.locations.selectedLocation.laundroworksSettings?.customerKey,
    laundroworksLocationId: this.props.locations.selectedLocation.laundroworksSettings
      ?.laundroworksLocationId,
    laundroworksPosNumber: this.props.locations.selectedLocation.laundroworksSettings
      ?.laundroworksPosNumber,
    spyderWashOperatorCode: this.props.locations.selectedLocation.spyderWashSettings
      ?.operatorCode,
    spyderWashLocationCode: this.props.locations.selectedLocation.spyderWashSettings
      ?.locationCode,
  };

  isFormDisabled() {
    return (
      (this.state.hasEsdEnabled &&
        (!this.state.esdLocationId || !this.state.deviceSerialNumber)) ||
      (this.state.hasCciEnabled &&
        (!this.state.username || !this.state.password || !this.state.cciStoreId)) ||
      (this.state.hasLaundroworksEnabled &&
        (!this.state.laundroworksUsername ||
          !this.state.laundroworksPassword ||
          !this.state.customerKey ||
          !this.state.laundroworksLocationId ||
          !this.state.laundroworksPosNumber)) ||
      (this.state.hasSpyderWashEnabled &&
        (!this.state.spyderWashOperatorCode || !this.state.spyderWashLocationCode))
    );
  }

  render() {
    let location = this.props.locations.selectedLocation;

    return (
      <Fragment>
        <div className="locations-card-content">
          <div className="registration-container">
            <div className="exit-icon-container">
              <img
                src={exitIcon}
                alt="exit icon"
                onClick={() => {
                  this.props.showEsdRegistrationScreen(false);
                }}
              />
            </div>
            <div className="registration-header">
              <div className="center-alignment">
                <p className="address-subtitle">{location.address.toUpperCase()}</p>
                <p>Configure Cash Options</p>
              </div>
            </div>
            <div className="registration-form-container">
              <p className="cash-card-payment-label">Cash Card Payments</p>
              <p>
                Cents currently integrates with ESD, CCI LaundryCard, and Laundroworks,
                enabling you to process POS orders with a cash option.
              </p>
              <div className="cash-card-toggle-container">
                <span>Accept cash card payments at this location</span>
                <ToggleSwitch
                  onChange={(v) => {
                    this.setState({
                      showCashCardOptions: !this.state.showCashCardOptions,
                      hasEsdEnabled: false,
                      hasCciEnabled: false,
                      hasLaundroworksEnabled: false,
                      hasSpyderWashEnabled: false,
                    });
                  }}
                  checked={this.state.showCashCardOptions}
                  className="inline-flex"
                />
              </div>
              <div>
                <a
                  className="hyperlink"
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://trycents.com"
                >
                  More information
                </a>
              </div>
              {this.state.showCashCardOptions && (
                <div className="registration-form">
                  <div className="cash-card-options">
                    <input
                      type="radio"
                      name="esd-option"
                      value={this.state.hasEsdEnabled}
                      checked={this.state.hasEsdEnabled}
                      onChange={() => {
                        this.setState({
                          hasEsdEnabled: true,
                          hasCciEnabled: false,
                          hasLaundroworksEnabled: false,
                          hasSpyderWashEnabled: false,
                          username: this.state.username,
                          password: this.state.password,
                          cciStoreId: this.state.cciStoreId,
                        });
                      }}
                    />
                    <p>ESD reader</p>
                    {this.state.hasEsdEnabled && (
                      <div className="cash-card-options">
                        <TextField
                          label="Device Serial Number"
                          className="device-serial-number-input tempClass"
                          value={this.state.deviceSerialNumber}
                          onChange={(evt) =>
                            this.setState({
                              deviceSerialNumber: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="ESD Location ID"
                          className="esd-location-id-input tempClass"
                          value={this.state.esdLocationId}
                          onChange={(evt) =>
                            this.setState({
                              esdLocationId: evt.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="cash-card-options">
                    <input
                      type="radio"
                      name="cci-option"
                      value={this.state.hasCciEnabled}
                      checked={this.state.hasCciEnabled}
                      onChange={() => {
                        this.setState({
                          hasEsdEnabled: false,
                          hasCciEnabled: true,
                          hasLaundroworksEnabled: false,
                          hasSpyderWashEnabled: false,
                          esdLocationId: this.state.esdLocationId,
                          deviceSerialNumber: this.state.deviceSerialNumber,
                        });
                      }}
                    />
                    <p>CCI LaundryCard</p>
                    {this.state.hasCciEnabled && (
                      <div className="cash-card-options">
                        <TextField
                          label="CCI Store Username"
                          className="device-serial-number-input tempClass"
                          value={this.state.username}
                          onChange={(evt) =>
                            this.setState({
                              username: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="CCI Store Password"
                          className="device-serial-number-input tempClass"
                          type="password"
                          value={this.state.password}
                          onChange={(evt) =>
                            this.setState({
                              password: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="CCI Store ID"
                          className="device-serial-number-input tempClass"
                          value={this.state.cciStoreId}
                          onChange={(evt) =>
                            this.setState({
                              cciStoreId: evt.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="cash-card-options">
                    <input
                      type="radio"
                      name="cci-option"
                      value={this.state.hasLaundroworksEnabled}
                      checked={this.state.hasLaundroworksEnabled}
                      onChange={() => {
                        this.setState({
                          hasEsdEnabled: false,
                          hasCciEnabled: false,
                          hasLaundroworksEnabled: true,
                          hasSpyderWashEnabled: false,
                          esdLocationId: this.state.esdLocationId,
                          deviceSerialNumber: this.state.deviceSerialNumber,
                        });
                      }}
                    />
                    <p>Laundroworks</p>
                    {this.state.hasLaundroworksEnabled && (
                      <div className="cash-card-options">
                        <TextField
                          label="Laundroworks Username"
                          className="device-serial-number-input tempClass"
                          value={this.state.laundroworksUsername}
                          onChange={(evt) =>
                            this.setState({
                              laundroworksUsername: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Laundroworks Password"
                          className="device-serial-number-input tempClass"
                          type="password"
                          value={this.state.laundroworksPassword}
                          onChange={(evt) =>
                            this.setState({
                              laundroworksPassword: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Laundroworks Customer Key"
                          className="device-serial-number-input tempClass"
                          value={this.state.customerKey}
                          onChange={(evt) =>
                            this.setState({
                              customerKey: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Laundroworks Location ID"
                          className="device-serial-number-input tempClass"
                          value={this.state.laundroworksLocationId}
                          onChange={(evt) =>
                            this.setState({
                              laundroworksLocationId: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Laundroworks POS Number"
                          className="device-serial-number-input tempClass"
                          value={this.state.laundroworksPosNumber}
                          onChange={(evt) =>
                            this.setState({
                              laundroworksPosNumber: evt.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="cash-card-options">
                    <input
                      type="radio"
                      name="spyder-wash-option"
                      value={this.state.hasSpyderWashEnabled}
                      checked={this.state.hasSpyderWashEnabled}
                      onChange={() => {
                        this.setState({
                          hasEsdEnabled: false,
                          hasCciEnabled: false,
                          hasLaundroworksEnabled: false,
                          hasSpyderWashEnabled: true,
                        });
                      }}
                    />
                    <p>SpyderWash</p>
                    {this.state.hasSpyderWashEnabled && (
                      <div className="cash-card-options">
                        <TextField
                          label="SpyderWash Operator Code"
                          className="device-serial-number-input tempClass"
                          value={this.state.spyderWashOperatorCode}
                          onChange={(evt) =>
                            this.setState({
                              spyderWashOperatorCode: evt.target.value,
                            })
                          }
                        />
                        <TextField
                          label="SpyderWash Location Code"
                          className="device-serial-number-input tempClass"
                          value={this.state.spyderWashLocationCode}
                          onChange={(evt) =>
                            this.setState({
                              spyderWashLocationCode: evt.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="esd-registration-error-message">
                {this.props.locations.esdErrorMessage}
              </p>
            </div>
            <div className="registration-form-container">
              <p className="cash-card-payment-label">Cash</p>
              <div className="cash-card-toggle-container">
                <span>Accept cash payments at this location</span>
                <ToggleSwitch
                  onChange={(v) => {
                    this.setState({
                      hasCashEnabled: !this.state.hasCashEnabled,
                    });
                  }}
                  checked={this.state.hasCashEnabled}
                  className="inline-flex"
                />
              </div>
              {this.state.hasCashEnabled && (
                <div className="cash-card-toggle-container">
                  <span>Enable cash drawer functionality at this location</span>
                  <ToggleSwitch
                    onChange={(v) => {
                      this.setState({
                        hasCashDrawer: !this.state.hasCashDrawer,
                      });
                    }}
                    checked={this.state.hasCashDrawer}
                    className="inline-flex"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="esd-registration-footer">
          <button
            className="btn btn-text-only cancel-button"
            onClick={() => {
              this.props.cancelEsdRegistration(location);
            }}
          >
            Cancel
          </button>
          <button
            className="btn-theme btn-rounded save-button"
            onClick={() => {
              this.props.updateEsdSettings(location, {
                hasEsdEnabled: this.state.hasEsdEnabled
                  ? this.state.hasEsdEnabled
                  : false,
                hasCciEnabled: this.state.hasCciEnabled
                  ? this.state.hasCciEnabled
                  : false,
                hasLaundroworksEnabled: this.state.hasLaundroworksEnabled
                  ? this.state.hasLaundroworksEnabled
                  : false,
                hasSpyderWashEnabled: this.state.hasSpyderWashEnabled
                  ? this.state.hasSpyderWashEnabled
                  : false,
                deviceSerialNumber: this.state.hasEsdEnabled
                  ? this.state.deviceSerialNumber
                  : null,
                esdLocationId: this.state.hasEsdEnabled ? this.state.esdLocationId : null,
                username: this.state.hasCciEnabled ? this.state.username : null,
                password: this.state.hasCciEnabled ? this.state.password : null,
                cciStoreId: this.state.hasCciEnabled ? this.state.cciStoreId : null,
                laundroworksUsername: this.state.hasLaundroworksEnabled
                  ? this.state.laundroworksUsername
                  : null,
                laundroworksPassword: this.state.hasLaundroworksEnabled
                  ? this.state.laundroworksPassword
                  : null,
                customerKey: this.state.hasLaundroworksEnabled
                  ? this.state.customerKey
                  : null,
                laundroworksLocationId: this.state.hasLaundroworksEnabled
                  ? this.state.laundroworksLocationId
                  : null,
                laundroworksPosNumber: this.state.hasLaundroworksEnabled
                  ? this.state.laundroworksPosNumber
                  : null,
                spyderWashOperatorCode: this.state.hasSpyderWashEnabled
                  ? this.state.spyderWashOperatorCode
                  : null,
                spyderWashLocationCode: this.state.hasSpyderWashEnabled
                  ? this.state.spyderWashLocationCode
                  : null,
                hasCashEnabled: this.state.hasCashEnabled,
                hasCashDrawer: this.state.hasCashEnabled
                  ? this.state.hasCashDrawer
                  : false,
              });
            }}
            disabled={this.isFormDisabled()}
          >
            SAVE
          </button>
        </div>
        {this.props.locations.isLocationDetailsLoading && <BlockingLoader />}
      </Fragment>
    );
  }
}

export default EsdRegistration;
