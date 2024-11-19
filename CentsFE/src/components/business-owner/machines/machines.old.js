import React, {Component, Fragment} from "react";
import {Link} from "react-router-dom";
import Card from "../../commons/card/card";
import Select, {components} from "react-select";
import locationIcon from "../../../assets/images/location.svg";
import playIcon from "../../../assets/images/play_circle.svg";
import checkbox_selected from "../../../assets/images/checkbox_selected.svg";
import washerIcon from "../../../assets/images/washer.svg";
import dryerIcon from "../../../assets/images/dryer.svg";
import selectedRadio from "../../../assets/images/selected_radio.svg";
import unSelectedRadio from "../../../assets/images/unselected_radio.svg";
import machineSmall from "../../../assets/images/machine_small.svg";
import dollarIcon from "../../../assets/images/dollar.svg";
import hashIcon from "../../../assets/images/hash.svg";
import barcodeIcon from "../../../assets/images/barcode.svg";
import menuIcon from "../../../assets/images/menu_icon_side_panel.svg";
import menuIconSelected from "../../../assets/images/menu_icon_side_panel_selected.svg";
import technicalIcon from "../../../assets/images/technical.svg";
import technicalGrayIcon from "../../../assets/images/technical_gray.svg";
import personIcon from "../../../assets/images/person.svg";
import personGrayIcon from "../../../assets/images/person_gray.svg";
import pencilIcon from "../../../assets/images/pencil.svg";
import emailIcon from "../../../assets/images/email.svg";
import phoneIcon from "../../../assets/images/phone.svg";
import reasonIcon from "../../../assets/images/question_circle.svg";
import TextField from "../../commons/textField/textField.js";
import _ from "lodash";
import StatusIndicator from "../../commons/statusIndicator/statusIndicator";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {run_machine_wash_type} from "../../../constants";
import WizardRadioSelector from "../../commons/wizardRadioSelector/wizardRadioSelector";
import MaterialWrapper from "../../commons/material-input-wrapper/materialInputWrapper";
import AsyncSelect from "react-select/async";
import {searchCustomers} from "../../../api/business-owner/customers";
import PlusMinusButtons from "../../commons/plus-minus-buttons/plusMinusButtons";
import {getLocationString} from "../../../utils/businessOwnerUtils";

let TextArea = MaterialWrapper("textarea");
let MaterialAsyncSelect = MaterialWrapper(AsyncSelect);

class Machines extends Component {
  machineStatusColors = {
    paired: "#3790F4",
    unpaired: "#BBBBBB",
    offline: "#B00020",
  };

  deviceStatusColors = {
    paired: "#3790F4",
    unpaired: "#FF9900",
    offline: "#B00020",
  };

  handleSelectMachineType(machineType) {
    if (machineType === "washer") {
      if (_.isNull(this.props.machines.wizardData.machineModels.washer)) {
        this.props.fetchMachineModels("washer");
      }
    } else if (machineType === "dryer") {
      if (_.isNull(this.props.machines.wizardData.machineModels.dryer)) {
        this.props.fetchMachineModels("dryer");
      }
    }

    this.props.updateWizard(1, "selectedMachineType", machineType);
  }

  handleMachineModelTypeChange(modelId) {
    if (!this.props.machines.wizardData.loadTypes[modelId]) {
      this.props.fetchLoadTypes(modelId);
    }

    this.props.updateWizard(2, "selectedMachineModel", modelId);
  }

  // A Subcomponent of react select - Used this inorder to have the Add new button within menu list
  MenuListComponent = (props) => {
    return (
      <components.MenuList {...props}>
        <button
          className="add-customer-dropdown-option"
          onClick={() => {
            this.props.updateRunMachineWizardStep(3);
          }}
        >
          {props.selectProps.inputValue ? "+ Add" : "+ Add New Customer"}{" "}
          <span className="customer-name">{props.selectProps.inputValue}</span>
        </button>
        {props.children}
      </components.MenuList>
    );
  };

  createMachineModelOptions() {
    let models = this.props.machines.wizardData.machineModels[
      this.props.machines.wizardData.selectedMachineType
    ];

    if (_.isNull(models)) {
      return [];
    } else {
      return this.props.machines.wizardData.machineModels[
        this.props.machines.wizardData.selectedMachineType
      ].map((model) => {
        return {
          label: `${model.modelname} - ${model.manufacturer}, ${model.capacity} `,
          value: model.id,
        };
      });
    }
  }

  loadCustSearchOptions = async (keyword) => {
    let searchResp = await searchCustomers(keyword);
    return this.prepareCustomerOptions(_.get(searchResp, "data.details", []));
  };

  prepareCustomerOptions = (list) => {
    if (!list) {
      return [];
    }
    return list.map((cust) => {
      return this.getCustReactSelectOptionFromCustomer(cust);
    });
  };

  getCustReactSelectOptionFromCustomer = (cust) => {
    return {
      value: cust.id,
      label: `${cust.fullName} \xa0 \xa0 \xa0 \xa0 ${cust.phoneNumber}`,
    };
  };

  validateMachinePricing() {
    // Check if all the prices are given a value;

    let supportedLoadTypes = this.props.machines.wizardData.loadTypes[
      this.props.machines.wizardData.selectedMachineModel
    ];
    let pricePerLoad = this.props.machines.wizardData.pricePerLoad;

    if (supportedLoadTypes.length !== Object.keys(pricePerLoad).length) {
      return false;
    } else {
      let isValid = true;
      for (let i = 0; i < supportedLoadTypes.length; i++) {
        let loadType = supportedLoadTypes[i];
        if (!pricePerLoad[loadType.id]) {
          isValid = false;
          break;
        }
      }
      return isValid;
    }
  }

  handleSubmitPairing = () => {
    let payload = {};
    payload.storeId = this.props.machines.selectedItem.storeId;
    let wizardData = this.props.machines.wizardData;
    payload.modelId = wizardData.selectedMachineModel;
    payload.deviceId = this.props.machines.selectedItem.id;
    payload.pricing = wizardData.pricePerLoad;

    this.props.submitPairing(payload);
  };

  handleMachineUpdatedSocketEvent = (data) => {
    // Update status according to message
    let machineInState = this.props.machines.machineList.find(
      (machine) => machine.id === data.id
    );

    if (machineInState && machineInState.status !== data.status) {
      this.props.updateMachineStatus(data);
    }
  };

  handleDeviceUpdatedSocketEvent = (data) => {
    // Update status according to message
    let deviceInState = this.props.machines.deviceList.find(
      (device) => device.id === data.id
    );

    if (deviceInState && deviceInState.status !== data.status) {
      this.props.updateDeviceStatus(data);
    }
  };

  getMachineDisplayName = (machine) => {
    let title =
      machine.type.toLowerCase() === "washer"
        ? "W"
        : machine.type.toLowerCase() === "dryer"
        ? "D"
        : "";
    let displayName = `#${title}${machine.id}`;
    return displayName;
  };

  componentDidMount() {
    if (_.get(this.props, "dashboard.selectedLocations.length")) {
      this.props.getDeviceList(_.get(this.props, "dashboard.selectedLocations"));
      this.props.getMachineList(_.get(this.props, "dashboard.selectedLocations"));
    }

    this.props.attachSocketHandlers();
  }

  componentDidUpdate(prevProps) {
    // Refreshing machines and devices lists when needs
    if (_.get(this.props, "dashboard.selectedLocations")) {
      if (
        this.props.dashboard.refreshData ||
        _.get(prevProps, "dashboard.selectedLocations") !==
          _.get(this.props, "dashboard.selectedLocations")
      ) {
        // When there is a location change reset entire machines data and fetch new lists
        this.props.resetMachines();
        if (_.get(this.props, "dashboard.selectedLocations.length")) {
          this.props.getDeviceList(_.get(this.props, "dashboard.selectedLocations"));
          this.props.getMachineList(_.get(this.props, "dashboard.selectedLocations"));
        }
      } else if (this.props.machines.refreshData) {
        // Just fetch new lists and update state
        this.props.getDeviceList(_.get(this.props, "dashboard.selectedLocations"));
        this.props.getMachineList(_.get(this.props, "dashboard.selectedLocations"));
      }
    }

    // Selecting a device or machine based if it is not already selected
    if (
      !this.props.machines.isDevicesCallInProgress &&
      !this.props.machines.isMachinesCallInProgress
    ) {
      if (
        !this.props.machines.selectedItem &&
        (this.props.machines.deviceList.length > 0 ||
          this.props.machines.machineList.length > 0)
      ) {
        this.props.autoSelectItem();
      }
    }
  }

  componentWillUnmount() {
    this.props.resetMachines();

    // Removing socket listeners
    this.props.removeSocketHandlers();
  }

  _render_devices() {
    if (this.props.machines.devicesError) {
      return this.props.machines.devicesError;
    }
    return this.props.machines.deviceList.map((device, index) => {
      return (
        <div
          key={`${index}${device.name}`}
          className={`common-list-item 
                        ${
                          this.props.machines.selectedItemType === "device" &&
                          device.id === _.get(this.props.machines, "selectedItem.id")
                            ? "active"
                            : ""
                        } 
                        ${
                          index === this.props.machines.deviceList.length - 1
                            ? "no-border"
                            : ""
                        }
                        `}
          onClick={() => this.props.deviceClickHandler(device)}
        >
          {this.props.machines.selectedItemType === "device" &&
          device.id === _.get(this.props.machines, "selectedItem.id") ? (
            <img alt="" className="circle-icon" src={checkbox_selected} />
          ) : (
            <span className="circle-icon"></span>
          )}

          <p className="device-display-name">{device.name}</p>
          <p title={device.storeAddress} className="rounded-border">
            {device.storeAddress}
          </p>
          <StatusIndicator
            className={"status-indicator"}
            statusColors={this.deviceStatusColors}
            status={device.status}
          />
        </div>
      );
    });
  }

  _render_machines() {
    if (this.props.machines.machinesError) {
      return this.props.machines.machinesError;
    }
    return this.props.machines.machineList.map((machine, index) => {
      let displayName = this.getMachineDisplayName(machine);
      return (
        <div
          key={`${index}${machine.name}`}
          className={`common-list-item 
                        ${
                          this.props.machines.selectedItemType === "machine" &&
                          machine.id === _.get(this.props.machines, "selectedItem.id")
                            ? "active"
                            : ""
                        } 
                        ${
                          index === this.props.machines.machineList.length - 1
                            ? "no-border"
                            : ""
                        }
                        `}
          onClick={() => this.props.machineClickHandler(machine)}
        >
          {this.props.machines.selectedItemType === "machine" &&
          machine.id === _.get(this.props.machines, "selectedItem.id") ? (
            <img alt="" className="circle-icon" src={checkbox_selected} />
          ) : (
            <span className="circle-icon"></span>
          )}

          <p className="machine-display-name">{displayName}</p>
          <p className="machine-capacity">{machine.capacity}</p>
          <p title={machine.storeAddress} className="rounded-border machine-location">
            {machine.storeAddress}
          </p>
          <StatusIndicator
            className={"status-indicator"}
            statusColors={this.machineStatusColors}
            status={machine.status}
          />
        </div>
      );
    });
  }

  _render_load_types() {
    let list = this.props.machines.wizardData.loadTypes[
      this.props.machines.wizardData.selectedMachineModel
    ];

    let textFields;
    if (list) {
      textFields = list.map((loadType) => {
        return (
          <TextField
            key={loadType.machineLoad}
            label={loadType.machineLoad}
            type="number"
            className="load-type-text-field"
            suffix="/load"
            onChange={(evt) => {
              this.props.updateWizard(3, "pricePerLoad", {
                type: loadType.id,
                value: evt.target.value,
              });
            }}
          />
        );
      });
    }

    return (
      <div className="loads-container">
        <img src={dollarIcon} alt="dollar"></img>
        <div className="loads-textfields-container">{textFields}</div>
      </div>
    );
  }

  _render_wizard_step() {
    switch (this.props.machines.wizardData.step) {
      case 0:
        return (
          <Fragment>
            <div className={"device-info-header"}>
              <p>{this.props.machines.selectedItem.name}</p>
            </div>
            <div className="step0-content">
              <div>
                <img src={locationIcon} alt="location" />
                {this.props.machines.selectedItem.storeAddress}
              </div>
              <button
                className="btn-theme btn-rounded"
                onClick={() => this.props.updateWizard(1)}
              >
                SET UP MACHINE
              </button>
            </div>
          </Fragment>
        );
      case 1:
        return (
          <Fragment>
            <div className="step1-container">
              Which type of machine?
              <div className="machine-type-selectors-container">
                <div
                  onClick={() => this.handleSelectMachineType("washer")}
                  className={`machine-type-selector ${
                    this.props.machines.wizardData.selectedMachineType === "washer"
                      ? "active"
                      : ""
                  }`}
                >
                  <img src={washerIcon} alt="washer"></img>
                  Washer
                  <img
                    alt=""
                    className="checkbox-icon"
                    src={
                      this.props.machines.wizardData.selectedMachineType === "washer"
                        ? selectedRadio
                        : unSelectedRadio
                    }
                  />
                </div>
                <div
                  onClick={() => this.handleSelectMachineType("dryer")}
                  className={`machine-type-selector disabled ${
                    this.props.machines.wizardData.selectedMachineType === "dryer"
                      ? "active"
                      : ""
                  }`}
                >
                  <img src={dryerIcon} alt="dryer"></img>
                  Dryer
                  <img
                    alt=""
                    className="checkbox-icon"
                    src={
                      this.props.machines.wizardData.selectedMachineType === "dryer"
                        ? selectedRadio
                        : unSelectedRadio
                    }
                  ></img>
                </div>
              </div>
              <button
                className="btn-theme btn-rounded"
                onClick={() => this.props.updateWizard(2)}
              >
                NEXT
              </button>
              <p className="cancel-button" onClick={this.props.resetWizard}>
                cancel
              </p>
            </div>
          </Fragment>
        );
      case 2:
        if (
          _.isNull(
            this.props.machines.wizardData.machineModels[
              this.props.machines.wizardData.selectedMachineType
            ]
          )
        ) {
          this.props.fetchMachineModels(
            this.props.machines.wizardData.selectedMachineType
          );
        }
        return (
          <Fragment>
            <div className="step2-container">
              <div className="top-group">
                Which type of {this.props.machines.wizardData.selectedMachineType}?
                <div className="location-image-dropdown-container">
                  <img src={machineSmall} className={"dropdown-icon"} alt="machine" />
                  <Select
                    options={this.createMachineModelOptions()}
                    onChange={(data) => {
                      this.handleMachineModelTypeChange(data.value);
                    }}
                    className="locations-dropdown"
                    classNamePrefix="react-select"
                  />
                  {this.props.machines.wizardData.machineModelsError}
                </div>
              </div>
              <div className="bottom-group">
                <button
                  className="btn-theme btn-rounded"
                  onClick={() => this.props.updateWizard(3)}
                  disabled={!this.props.machines.wizardData.selectedMachineModel}
                >
                  NEXT
                </button>
                <p className="cancel-button" onClick={this.props.resetWizard}>
                  cancel
                </p>
              </div>
            </div>
          </Fragment>
        );
      case 3:
        return (
          <Fragment>
            <div className="step3-container">
              <div className="top-group">
                What is the price per load?
                <div>{this._render_load_types()}</div>
                {this.props.machines.wizardData.loadTypesError}
              </div>

              <div className="bottom-group">
                {this.props.machines.wizardData.pairingError}
                <button
                  className="btn-theme btn-rounded"
                  onClick={this.handleSubmitPairing}
                  disabled={!this.validateMachinePricing()}
                >
                  SAVE
                </button>
                <p className="cancel-button" onClick={this.props.resetWizard}>
                  cancel
                </p>
              </div>
            </div>
          </Fragment>
        );
      default:
        return "";
    }
  }

  _render_device_info() {
    return (
      <div className="machines-wizard-step-container">{this._render_wizard_step()}</div>
    );
  }

  _render_price_per_load(prices) {
    if (!prices) {
      return;
    }
    return prices.map((price) => {
      return (
        <div key={price.loadType} className="price-container">
          <p className={"price-load-type-label"}>{price.loadType}</p>
          <p className={"price-value"}>
            ${price.price}
            <span> / load</span>
          </p>
        </div>
      );
    });
  }

  _format_running_state(runningState) {
    if (runningState) {
      let formatted = runningState.replace("_", " ");
      formatted = formatted.toLowerCase();
      return formatted;
    } else {
      return runningState;
    }
  }

  _render_machine_info() {
    let machine = this.props.machines.selectedItem;
    let displayName = this.getMachineDisplayName(machine);
    return (
      <div className="machine-info-container">
        <div className="device-info-header">
          <p>{displayName}</p>
          {this.props.machines.runMachineStatus[machine.id] === "RUN_REQUESTED" ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : null}
          <div className="machine-info-right-menu">
            <div
              onClick={this.props.toggleMachineMenu}
              className="machine-menu-icon-container"
            >
              <img
                alt=""
                className="machine-menu-icon"
                src={this.props.machines.showMachineMenu ? menuIconSelected : menuIcon}
              />
              {this.props.machines.showMachineMenu ? (
                <Fragment>
                  <div className="machine-context-menu-background-click-area"></div>
                  <div className="machine-context-menu">
                    <div
                      className={`machine-context-menu-item ${
                        (machine.runningStatus && machine.runningStatus.toUpperCase()) ===
                          "FINISHED" ||
                        (machine.runningStatus && machine.runningStatus.toUpperCase()) ===
                          "IDLE"
                          ? ""
                          : " disabled"
                      }`}
                      onClick={() => this.props.handleRunMachineOption()}
                    >
                      Run Machine
                    </div>
                  </div>
                </Fragment>
              ) : null}
            </div>
          </div>
        </div>
        <div className="machine-general-info">
          <div className="machine-single-info-container col-span-2">
            <img src={hashIcon} alt="number"></img>
            <p>{machine.id}</p>
          </div>
          <div className="machine-single-info-container">
            <img src={machineSmall} alt="machine"></img>
            <p>
              {`${machine.modelname} - `}{" "}
              <span>{`${machine.manufacturer} - ${machine.capacity}`}</span>
            </p>
          </div>
          <div className="machine-single-info-container">
            <img src={barcodeIcon} alt="serial"></img>
            <p>{machine.serialNumber}</p>
          </div>
          <div className="machine-single-info-container prices-info-container">
            <img src={dollarIcon} alt="price"></img>
            <div className={"prices-list"}>
              {this._render_price_per_load(machine.prices)}
            </div>
          </div>
          <div className="machine-single-info-container">
            <img src={locationIcon} alt="location"></img>
            <p>{machine.storeAddress}</p>
          </div>
          <div className="machine-single-info-container">
            <img src={playIcon} alt="location"></img>
            <p className={"running-state"}>
              {this._format_running_state(machine.runningStatus) || "Idle"}
            </p>
          </div>
        </div>
        <div
          className="machine-status-info"
          style={{background: this.machineStatusColors[machine.status]}}
        >
          {machine.status}
        </div>
      </div>
    );
  }

  _render_run_machine_wizard() {
    let stepData;
    switch (this.props.machines.runMachineWizardStep) {
      case 1:
        stepData = (
          <div className="wizard-step-container">
            <div className="wizard-step-section top-section">
              <button className="btn-text-only btn" onClick={this.props.resetRunWizard}>
                <FontAwesomeIcon icon={faChevronLeft} /> Back
              </button>
            </div>

            <div className="wizard-step-section middle-section">
              <p className="machine-name">
                {this.getMachineDisplayName(this.props.machines.selectedItem)}
              </p>
              Which type of wash?
              <div className="wizard-radio-selectors-container">
                <WizardRadioSelector
                  activeImage={technicalIcon}
                  inactiveImage={technicalGrayIcon}
                  label="Technical"
                  onClick={() =>
                    this.props.handleRunMachineDataChange(
                      "washType",
                      run_machine_wash_type.TECHNICAL
                    )
                  }
                  isActive={
                    this.props.machines.runMachineWizardData.washType ===
                    run_machine_wash_type.TECHNICAL
                  }
                  className="wash-type-selector"
                />

                <WizardRadioSelector
                  activeImage={personIcon}
                  inactiveImage={personGrayIcon}
                  label="Customer Service"
                  onClick={() =>
                    this.props.handleRunMachineDataChange(
                      "washType",
                      run_machine_wash_type.CUSTOMER_SERVICE
                    )
                  }
                  isActive={
                    this.props.machines.runMachineWizardData.washType ===
                    run_machine_wash_type.CUSTOMER_SERVICE
                  }
                  className="wash-type-selector"
                />
              </div>
            </div>

            <div className="wizard-step-section bottom-section">
              <button
                className="btn-theme btn-rounded"
                onClick={() =>
                  this.props.updateRunMachineWizardStep(
                    2,
                    this.props.machines.runMachineWizardData.washType
                  )
                }
              >
                NEXT
              </button>
              <p className="cancel-button" onClick={this.props.resetRunWizard}>
                cancel
              </p>
            </div>
          </div>
        );
        break;
      case 2:
        stepData = (
          <div className="wizard-step-container">
            <div className="wizard-step-section top-section">
              <button
                className="btn-text-only btn"
                onClick={() => this.props.updateRunMachineWizardStep(1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Back
              </button>
            </div>

            <div className="wizard-step-section middle-section">
              <p className="machine-name">
                {this.getMachineDisplayName(this.props.machines.selectedItem)}
              </p>
              Cycle Details
              <div className="wizard-text-fields-container">
                <div className="icon-text-container">
                  <img src={personIcon} alt="icon"></img>
                  {this.props.machines.runMachineWizardData.washType ===
                  run_machine_wash_type.TECHNICAL ? (
                    <TextField
                      type="text"
                      label="Technician Name"
                      onChange={(e) => {
                        this.props.handleRunMachineDataChange(
                          "technicianName",
                          e.target.value
                        );
                      }}
                      value={this.props.machines.runMachineWizardData.technicianName}
                    />
                  ) : (
                    <MaterialAsyncSelect
                      label="Customer Name"
                      defaultOptions={this.prepareCustomerOptions(
                        this.props.machines.runWizardCustomerSearchList
                      )}
                      loadOptions={this.loadCustSearchOptions}
                      smallHeight
                      value={this.props.machines.runMachineWizardData.customer}
                      onChange={(option) => {
                        this.props.handleRunMachineDataChange("customer", option);
                      }}
                      className="cust-search-select"
                      components={{MenuList: this.MenuListComponent}}
                    />
                  )}
                </div>
                <div className="icon-text-container">
                  <img src={reasonIcon} alt="icon"></img>
                  <TextField
                    type="text"
                    label="Reason"
                    onChange={(e) => {
                      this.props.handleRunMachineDataChange("reason", e.target.value);
                    }}
                    value={this.props.machines.runMachineWizardData.reason}
                  />
                </div>
                <div className="icon-text-container">
                  <img src={pencilIcon} alt="icon"></img>
                  <TextArea
                    label="Notes"
                    onChange={(e) => {
                      this.props.handleRunMachineDataChange("notes", e.target.value);
                    }}
                    value={this.props.machines.runMachineWizardData.notes}
                    className="text-area"
                  />
                </div>
              </div>
            </div>

            <div className="wizard-step-section bottom-section">
              <button
                className="btn-theme btn-rounded"
                onClick={() =>
                  this.props.handleRunMachineCommand({
                    ...this.props.machines.runMachineWizardData,
                    machineId: this.props.machines.selectedItem.id,
                  })
                }
              >
                RUN MACHINE
              </button>
              <p className="cancel-button" onClick={this.props.resetRunWizard}>
                cancel
              </p>
              <div className="cycle-details-container">
                {this.props.machines.selectedItem.type === "dryer" ? (
                  <div className="details-group">
                    <p>
                      <span>Dry Time:</span> 0:08
                    </p>
                    <PlusMinusButtons />
                  </div>
                ) : null}
                <p>
                  <span>Settings:</span> Brights/cold
                </p>
                <p>
                  <span>Value:</span> $4.25
                </p>
              </div>
            </div>
          </div>
        );
        break;
      case 3:
        // Create customer Step
        stepData = (
          <div className="wizard-step-container">
            {this.props.machines.runMachineWizardData.createCustomerCallInProgress ? (
              <BlockingLoader />
            ) : null}
            <div className="wizard-step-section top-section">
              <button
                className="btn-text-only btn"
                onClick={() => this.props.updateRunMachineWizardStep(2)}
              >
                X
              </button>
            </div>

            <div className="wizard-step-section middle-section">
              <p className="machine-name"></p>
              Add New Customer
              <div className="wizard-text-fields-container">
                <div className="icon-text-container">
                  <img src={personIcon} alt="icon"></img>
                  <div className="fields-column-group">
                    <TextField
                      error={
                        this.props.machines.runMachineWizardData.newCustomerError
                          .firstName
                      }
                      type="text"
                      label="First Name"
                      onChange={(e) => {
                        this.props.handleRunMachineDataChange("newCustomer", {
                          firstName: e.target.value,
                        });
                      }}
                      value={
                        this.props.machines.runMachineWizardData.newCustomer.firstName
                      }
                    />
                    <TextField
                      error={
                        this.props.machines.runMachineWizardData.newCustomerError.lastName
                      }
                      type="text"
                      label="Last Name"
                      onChange={(e) => {
                        this.props.handleRunMachineDataChange("newCustomer", {
                          lastName: e.target.value,
                        });
                      }}
                      value={
                        this.props.machines.runMachineWizardData.newCustomer.lastName
                      }
                    />
                  </div>
                </div>
                <div className="icon-text-container">
                  <img src={emailIcon} alt="icon"></img>
                  <TextField
                    error={
                      this.props.machines.runMachineWizardData.newCustomerError.email
                    }
                    type="text"
                    label="Email"
                    onChange={(e) => {
                      this.props.handleRunMachineDataChange("newCustomer", {
                        email: e.target.value,
                      });
                    }}
                    value={this.props.machines.runMachineWizardData.newCustomer.email}
                  />
                </div>
                <div className="icon-text-container">
                  <img src={phoneIcon} alt="icon"></img>
                  <TextField
                    error={
                      this.props.machines.runMachineWizardData.newCustomerError
                        .phoneNumber
                    }
                    type="text"
                    label="Phone"
                    onChange={(e) => {
                      this.props.handleRunMachineDataChange("newCustomer", {
                        phoneNumber: e.target.value,
                      });
                    }}
                    value={
                      this.props.machines.runMachineWizardData.newCustomer.phoneNumber
                    }
                  />
                </div>
                <p className="error-message">
                  {this.props.machines.runMachineWizardData.createCustomerFullPageError}
                </p>
              </div>
            </div>

            <div className="wizard-step-section bottom-section">
              <button
                className="btn-theme btn-rounded"
                disabled={
                  !this.props.isNewCustomerValid(
                    this.props.machines.runMachineWizardData.newCustomer
                  )
                }
                onClick={() => {
                  this.props.createCustomer(
                    this.props.machines.runMachineWizardData.newCustomer
                  );
                }}
              >
                SAVE
              </button>
              <p className="cancel-button" onClick={this.props.resetRunWizard}>
                cancel
              </p>
            </div>
          </div>
        );
        break;
      default:
        console.log("Invalid run machine wizard step");
    }

    return (
      <div className="machines-wizard-step-container">
        {this.props.machines.runMachineStatus[this.props.machines.selectedItem.id] ===
        "RUN_REQUEST_IN_PROGRESS" ? (
          <BlockingLoader />
        ) : null}
        {stepData}
      </div>
    );
  }

  _render_ui() {
    if (
      this.props.machines.isDevicesCallInProgress ||
      this.props.machines.isMachinesCallInProgress
    ) {
      return <BlockingLoader />;
    } else if (
      this.props.machines.machineList.length === 0 &&
      this.props.machines.deviceList.length === 0 &&
      !(this.props.machines.devicesError || this.props.machines.machinesError)
    ) {
      return (
        <div className="dashboard-full-page-error-container">
          <p>No devices mapped to this location</p>
          <img src={machineSmall} alt="machine"></img>
          <Link to="/global-settings/devices">
            <button className="btn-theme btn-corner-rounded">Go To Devices</button>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="machines-container">
          <Card className="store-info-card"></Card>
          <Card className="machine-list-card">
            <div className="device-list-header">
              <p>
                Showing machines in{" "}
                {getLocationString(
                  this.props.dashboard.selectedLocations,
                  this.props.dashboard.allLocations?.locations
                )}
              </p>
            </div>
            <div className="card-content-container">
              <div className="device-list-container">{this._render_devices()}</div>
              <div className="machine-list-container">{this._render_machines()}</div>
            </div>
          </Card>
          <Card className="machine-info-card">
            {this.props.machines.selectedItemType === "device"
              ? this._render_device_info()
              : this.props.machines.selectedItemType === "machine"
              ? this.props.machines.showRunMachineWizard
                ? this._render_run_machine_wizard()
                : this._render_machine_info()
              : "Please select a device or a machine to see info"}
          </Card>
        </div>
      );
    }
  }

  render() {
    return this._render_ui();
  }
}

export default Machines;
