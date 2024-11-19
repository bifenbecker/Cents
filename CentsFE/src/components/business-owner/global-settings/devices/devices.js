import React, {Component, Fragment} from "react";
import Card from "../../../commons/card/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowCircleDown} from "@fortawesome/free-solid-svg-icons";
import batchIcon from "../../../../assets/images/batch.svg";
import locationIcon from "../../../../assets/images/location.svg";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import Select from "react-select";
import StatusIndicator from "../../../commons/statusIndicator/statusIndicator.js";
import Accordion from "../../../commons/accordion/accordion.js";
import Checkbox from "../../../commons/checkbox/checkbox.js";
import _ from "lodash";

class Devices extends Component {
  deviceStatusColors = {
    paired: "#3790F4",
    unpaired: "#FF9900",
  };

  componentDidMount() {
    this.props.fetchAllBatches();
    this.props.fetchDropdownLocations();
    this.props.fetchLocations();
  }

  componentDidUpdate() {
    if (this.props.devices.refreshAllLists) {
      this.props.resetRefreshAllLists();
      this.props.fetchAllBatches();
      this.props.fetchLocations();
    }
  }

  componentWillUnmount() {
    this.props.resetFullState();
  }

  _render_batches(batchList) {
    if (this.props.devices.batchListCallInProgess) {
      return <BlockingLoader className="loader" />;
    } else if (this.props.devices.batchListError) {
      return (
        <div className="devices-batch-list-item">{this.props.devices.batchListError}</div>
      );
    } else if (batchList.length === 0) {
      return (
        <div className="devices-batch-list-item">
          No batches are assigned to you. Please contact admin
        </div>
      );
    } else {
      return batchList.map((batch) => {
        let activeClass =
          this.props.devices.selectedItemType === "batch" &&
          this.props.devices.selectedItem.id === batch.id
            ? "active"
            : "";

        return (
          <div
            key={`batch-${batch.id}`}
            className={`devices-batch-list-item ${activeClass}`}
            onClick={() => {
              this.props.setSelectedItem("batch", batch);
            }}
          >
            <img src={batchIcon} alt="batch" />
            <div>
              <p>Batch {batch.id}</p>
              <p>({batch.deviceCount} devices)</p>
            </div>
            {batch.storeId ? (
              <span className={"active"}>Assigned</span>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        );
      });
    }
  }

  _render_locations(locationList) {
    if (this.props.devices.locationListCallInProgess) {
      return <BlockingLoader className="loader" />;
    } else if (this.props.devices.locationListError) {
      return (
        <div className={"device-location-accordion-header"}>
          {this.props.devices.locationListError}
        </div>
      );
    } else {
      let accordionData;

      accordionData = locationList.map((location) => {
        return {
          header: (
            <div className={"device-location-accordion-header"}>
              <div>
                <p>{location.address}</p>
                <p>({location.deviceCount} devices)</p>
              </div>
              <FontAwesomeIcon
                icon={faArrowCircleDown}
                className="arrow-circle-down-icon accordion-indicator-icon"
              />
            </div>
          ),
          body: <div>{this._render_devices(location)}</div>,
          onExpand: () => {
            this.props.fetchDevices(location.id);
          },
        };
      });

      return <Accordion data={accordionData} />;
    }
  }

  _render_devices(location) {
    let address = location.address;
    let deviceList = this.props.devices.devicesList[location.id];

    if (this.props.devices.devicesCallInProgress[location.id] && !deviceList) {
      return (
        <div className={`bo-gs-devices-list-item common-list-item no-border`}>
          <BlockingLoader />
        </div>
      );
    } else if (!deviceList) {
      return null;
    } else if (deviceList && deviceList.length === 0) {
      // Very unlikely to happen
      return "No devices to show";
    } else {
      return deviceList.map((device) => {
        device.location = address;
        return (
          <div
            key={`device-${device.id}`}
            className={`bo-gs-devices-list-item common-list-item ${
              this.props.devices.selectedItemType === "device" &&
              _.get(this.props.devices, "selectedItem.id") === device.id
                ? "active"
                : ""
            }`}
            onClick={() => {
              this.props.setSelectedItem("device", device);
            }}
          >
            <Checkbox
              checked={
                this.props.devices.selectedItemType === "device" &&
                _.get(this.props.devices, "selectedItem.id") === device.id
                  ? true
                  : false
              }
            />
            <p>{device.name}</p>
            <StatusIndicator
              className={"status-indicator"}
              statusColors={this.deviceStatusColors}
              status={device.status}
            />
          </div>
        );
      });
    }
  }

  _render_info_card() {
    //Switch between device info and batch info based on flags in state
    const localProps = this.props.devices;
    if (localProps.selectedItemType === "device") {
      return this._render_device_info(localProps.selectedItem);
    } else if (localProps.selectedItemType === "batch" && localProps.selectedItem) {
      return this._render_batch_info(localProps.selectedItem);
    } else if (
      localProps.batchListCallInProgess ||
      localProps.locationListCallInProgess
    ) {
      return <BlockingLoader />;
    } else {
      return (
        <div className="batch-info-container">
          <p>Select a batch or a device to see info</p>
        </div>
      );
    }
  }

  _render_batch_info(batch) {
    // Switch between batch assigned and not assigned states
    if (batch.storeId) {
      let assignedToStore = this.props.devices.locationDropDownList.find((store) => {
        return store.id === batch.storeId;
      });
      return (
        <div className="batch-info-container">
          <p>{`Batch ${batch.id} has been assigned to store at ${_.get(
            assignedToStore,
            "address"
          )}`}</p>
        </div>
      );
    } else {
      return (
        <div className="batch-info-container">
          {this.props.devices.isAssignLocationInProgress ? <BlockingLoader /> : null}
          <p>{`Assign ${batch.deviceCount} devices to location:`}</p>
          <div className="location-image-dropdown-container">
            <img src={locationIcon} className={"dropdown-icon"} alt="locations"></img>
            <Select
              options={this.getLocationDropdownOptions(
                this.props.devices.locationDropDownList
              )}
              value={this.props.devices.chosenLocationItem}
              onChange={this.props.locationDropdownChangeHandler}
              className="locations-dropdown"
              classNamePrefix="react-select"
              placeholder="Choose Location"
            />
          </div>
          <p className="error-message">{this.props.devices.assignLocationError}</p>
          <button
            className="btn-theme btn-rounded save-button"
            onClick={() => {
              this.props.submitSetLocation(
                this.props.devices.selectedItem.id,
                this.props.devices.chosenLocationItem.value
              );
            }}
          >
            SAVE
          </button>
        </div>
      );
    }
  }

  _render_device_info(device) {
    return (
      <Fragment>
        <div className="locations-card-header">
          <p>{device.id}</p>
        </div>
        <div className="locations-card-content">
          <div className="location-info-container">
            <div className="row1">
              <div>
                <div className="address-container">
                  <img src={locationIcon} alt="locations" />
                  <div>
                    <p>{device.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  getLocationDropdownOptions(locations) {
    return locations.map((location) => {
      return {
        value: location.id,
        label: location.address,
      };
    });
  }

  render() {
    return (
      <Card>
        <div className={"bo-global-settings-content-2-column-layout"}>
          <div className={"bo-global-settings-content-left-column"}>
            <div className="locations-card-container">
              <div className="locations-card-header">
                <p>Devices</p>
                {/* <FontAwesomeIcon icon={faPlus} onClick={this.props.showCreateScreen}/> */}
              </div>
              <div className="locations-card-content devices-card-content">
                <div className="batch-list">
                  {this._render_batches(this.props.devices.batchList)}
                </div>
                <div className="location-accordions-list">
                  {this._render_locations(this.props.devices.locationList)}
                </div>
              </div>
            </div>
          </div>
          <div className={"bo-global-settings-content-right-column"}>
            <div className="locations-card-container info-card-container">
              {this._render_info_card()}
            </div>
          </div>
        </div>
      </Card>
    );
  }
}

export default Devices;
