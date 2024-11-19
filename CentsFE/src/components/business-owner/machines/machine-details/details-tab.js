import React, {useState, useEffect} from "react";

import IconDryer from "../../../../assets/images/Icon__Dryer Unselected_Side Panel.svg";
import BlackDollar from "../../../../assets/images/Black-Dollar.svg";
import IconBarcode from "../../../../assets/images/Icon_Barcode_Side_Panel.svg";
import IconDryerSmall from "../../../../assets/images/Icon_Machine Small Black_Side Panel.svg";
import IconHash from "../../../../assets/images/hash.svg";
import IconLocation from "../../../../assets/images/location.svg";
import IconNoDevicePaired from "../../../../assets/images/Icon_No Device Paired.svg";
import IconBlueTick from "../../../../assets/images/check_Tick.svg";
import IconCents from "../../../../assets/images/Icon_Cents Device.svg";
import capitalize from "lodash/capitalize";

import {
  DEVICE_STATUSES_DISPLAY,
  MACHINE_TYPES,
  DEVICE_STATUSES,
  SERVICE_TYPE_DISPLAY,
} from "../constants";
import {submitMachineDetails} from "../../../../api/business-owner/machines";

import TextField from "../../../commons/textField/textField";
import CentsInput from "../../../commons/currency-input/cents-input";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

const DetailsTab = ({machineDetails, dispatch}) => {
  const [machine, setMachine] = useState({...machineDetails});
  const [errorField, setErrorField] = useState();
  const [editing, setEditing] = useState(false);
  const [editingError, setEditingError] = useState("");

  useEffect(() => {
    setMachine({...machineDetails});
  }, [machineDetails]);

  const handleEditField = (field, value) => {
    let payload = {
      id: machine.id,
      body: {
        field: field,
        value: value,
      },
    };
    updateMachineDetails(payload);
  };

  const updateMachineDetails = (payload) => {
    setErrorField();
    setEditing(true);
    setEditingError();
    submitMachineDetails(payload)
      .then((res) => {
        setEditing(false);
        dispatch({
          type: "UPDATE_SELECTED_MACHINE_DATA",
          payload: machine,
        });
      })
      .catch((e) => {
        // If error, reset the machine again.
        setEditing(false);
        setEditingError(e.response?.data?.error || e.message);
        setTimeout(() => setEditingError(), 2000);
        setMachine({...machineDetails});
        setErrorField(payload.body.field);
        setTimeout(() => setErrorField(), 3000);
      });
  };
  const isWasherSelected = machine?.model?.type === MACHINE_TYPES.washer;

  const renderDeviceStatusInfo = () => {
    switch (machine?.device?.status) {
      case DEVICE_STATUSES.OFFLINE:
        return (
          <div className="icon-insight machine-insight offline">
            <span style={{color: "#B00020", fontSize: "20px", fontWeight: "500"}}>x</span>
            <div>
              <p>
                Device not <br /> found
              </p>
            </div>
          </div>
        );
      case DEVICE_STATUSES.IN_USE:
      case DEVICE_STATUSES.ONLINE:
        return (
          <div className="icon-insight machine-insight in-use">
            <img src={IconBlueTick} alt="icon" />
            <div>
              <p>
                {DEVICE_STATUSES_DISPLAY[machine?.device?.status?.toUpperCase()] || "NA"}
              </p>
              {machine?.device?.status === DEVICE_STATUSES.IN_USE &&
              machineDetails?.activeTurn?.id ? (
                <>
                  <p>{SERVICE_TYPE_DISPLAY[machineDetails?.activeTurn?.serviceType]}</p>
                  {/* <p>
                    <button
                      className="btn button-text view-turn"
                      onClick={() => {
                        // open turn
                      }}
                    >
                      View turn {">"}
                    </button>
                  </p> */}
                </>
              ) : null}
            </div>
          </div>
        );
      default:
        return (
          <div className="icon-insight machine-insight disabled">
            <div>
              <img src={IconNoDevicePaired} alt="icon" />
              <p>
                No device <br /> paired
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="machine-info-content">
      {editing || editingError ? <BlockingLoader error={editingError} /> : null}
      <div className="scroll-area">
        <div className="section">
          <div className="machine-insights-container">
            {machine?.device?.status ||
            machine?.avgSelfServeRevenuePerDay ||
            machine?.avgTurnsPerDay ? (
              <>
                <div className="icon-insight machine-insight">
                  <img src={BlackDollar} alt="icon" />
                  <div>
                    <p>${((machine?.avgSelfServeRevenuePerDay || 0) / 100).toFixed(2)}</p>
                    <p>Avg. self-serve</p>
                    <p>revenue per day</p>
                  </div>
                </div>
                <div className="machine-insight icon-insight">
                  <img src={IconDryer} alt="icon" />
                  <div>
                    <p>{(machine?.avgTurnsPerDay || 0).toFixed(1)}</p>
                    <p>Avg. turns</p>
                    <p>per day</p>
                  </div>
                </div>
                <div className="machine-insight icon-insight">
                  <img src={IconDryer} alt="icon" />
                  <div>
                    <p>${(machine?.totalCoinsUsed || 0).toFixed(2)}</p>
                    <p>Coin revenue since</p>
                    <p>last collection</p>
                  </div>
                </div>
                {renderDeviceStatusInfo()}
              </>
            ) : (
              <div className="icon-insight machine-insight disabled">
                <div>
                  <img src={IconNoDevicePaired} alt="icon" />
                  <p>
                    No device <br /> paired
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="section section-two machine-form last-section">
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={IconHash} />
              <TextField
                prefix={`${machine.prefix || ""} -`}
                isInline={true}
                label={`${capitalize(machine?.model?.type)} #`}
                className="machine-text-field"
                value={machine.name}
                maxLength={8}
                onChange={(event) => {
                  const name = event?.target?.value?.replace(/[^0-9a-zA-Z]/g, "");
                  setMachine((state) => ({...state, name}));
                }}
                onBlur={() => {
                  if (machine.name !== machineDetails.name) {
                    handleEditField("name", machine.name);
                  }
                }}
                error={errorField === "name"}
              />
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={IconDryerSmall} />
              <span className="machine-name">
                {machine.model?.modelName} {"-"}{" "}
                <i>
                  <small>
                    {machine.model?.manufacturer}, {machine.model?.capacity.toLowerCase()}
                  </small>
                </i>
              </span>
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={BlackDollar} />
              {isWasherSelected ? (
                <CentsInput
                  // prefix="$"
                  suffix="/turn"
                  isInline={true}
                  label="Price"
                  maxLimit={1000}
                  className="machine-text-field pricing-input"
                  value={machine.pricePerTurnInCents}
                  onCentsChange={(pricePerTurnInCents) =>
                    setMachine((state) => ({...state, pricePerTurnInCents}))
                  }
                  onBlur={() => {
                    if (
                      machine.pricePerTurnInCents !== machineDetails.pricePerTurnInCents
                    ) {
                      handleEditField("pricePerTurnInCents", machine.pricePerTurnInCents);
                    }
                  }}
                />
              ) : (
                <TextField
                  suffix="mins / $0.25"
                  isInline={true}
                  label="Time"
                  maxLength={2}
                  className="machine-text-field pricing-input turn-time-input"
                  value={machine?.turnTimeInMinutes}
                  onChange={(event) => {
                    const value = event?.target?.value.replace(/[^0-9]/g, "");
                    setMachine((state) => ({
                      ...state,
                      turnTimeInMinutes: value ? Math.floor(Number(value)) : null,
                    }));
                  }}
                  onBlur={() => {
                    if (machine.turnTimeInMinutes !== machineDetails.turnTimeInMinutes) {
                      handleEditField("turnTimeInMinutes", machine.turnTimeInMinutes);
                    }
                  }}
                  error={errorField === "turnTimeInMinutes"}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={IconBarcode} />
              <TextField
                isInline={true}
                label="Barcode"
                className="machine-text-field"
                value={machine.serialNumber || ""}
                onChange={(event) => {
                  const serialNumber = event?.target?.value.trim();
                  setMachine((state) => ({
                    ...state,
                    serialNumber,
                  }));
                }}
                onBlur={() => {
                  if (machine.serialNumber !== machineDetails.serialNumber) {
                    handleEditField("serialNumber", machine.serialNumber);
                  }
                }}
                error={errorField === "serialNumber"}
              />
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={IconLocation} />
              <span className="location">{machine.store?.name}</span>
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={IconCents} />
              <span className="machine-name">
                {machine.device?.id ? machine.device?.name : "No device paired"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
