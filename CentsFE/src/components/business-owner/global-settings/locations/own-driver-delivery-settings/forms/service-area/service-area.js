import React, {useState, useMemo} from "react";

import {
  validateZipCode,
  deleteZone,
  validatZipcodesRemoval,
} from "../../../../../../../api/business-owner/delivery-settings";

import TextField from "../../../../../../commons/textField/textField";
import TabBar from "../../../../../../commons/tab-bar/tabBar";
import Checkbox from "../../../../../../commons/checkbox/checkbox";
import ServiceAreaZipcodes from "../service-area/service-area-zipcodes";
import ZipcodeValidationErrorPopup from "./zipcode-validation-error-popup";

import {getNewZone} from "../../../utils/service-area";

const TabContent = (props) => {
  const {name, zipCode, hasZones, updateZones, zipCodes = []} = props;
  const [zipcode, setZipCode] = useState(zipCode);

  return (
    <>
      <TextField
        className="zone-name-input"
        label="Zone Name"
        defaultValue={name}
        maxLength={20}
        onBlur={(e) => updateZones({key: "name", value: e.target.value.trim()})}
      />
      <ServiceAreaZipcodes
        onChange={(evt) => setZipCode(evt.target.value.trim())}
        onClick={() => {
          updateZones({key: "zipCodes", value: zipcode});
          setZipCode("");
        }}
        onClose={(item, index) =>
          updateZones({key: "zipCodes", removeZipindex: index, removeItem: item})
        }
        zipCodeList={zipCodes}
        value={zipcode}
        className="zone-input-container"
        hasZones={hasZones}
      />
    </>
  );
};

const ServiceArea = (props) => {
  const {
    setError,
    zipCodeList,
    setZipCodeList,
    setLoading,
    storeId,
    setZones,
    zones,
    hasZones,
    setHasZones,
    editForm,
  } = props;
  const [currentZip, setCurrentZip] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const currentZone = useMemo(() => zones[tabIndex], [tabIndex, zones]);
  const [showZipcodeValidationPopup, setShowZipcodeValidationPopup] = useState(false);
  const [zipcodeValidationResp, setZipcodeValidationResp] = useState();

  const onAddNewClick = () => {
    setError();
    setTabIndex(zones?.length);
    setZones((prev) => {
      prev.push(getNewZone(prev.length + 1));
      return [...prev];
    });
  };

  const handleValidateZipCode = async (value, afterApiSuccess) => {
    try {
      setLoading(true);
      await validateZipCode({zipcode: value, storeId});
      afterApiSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || "Zip code not valid.");
    } finally {
      setLoading(false);
    }
  };

  const updateZones = async ({key, value, removeZipindex, removeItem}) => {
    setError();
    if (zones[tabIndex]) {
      if (removeZipindex > -1) {
        const validateZipcodesData = await validateZoneOrZipcodesRemoval([removeItem]);
        if (validateZipcodesData?.success) {
          zones[tabIndex].zipCodes.splice(removeZipindex, 1);
          setZones([...zones]);
          return;
        } else {
          onZipcodesValidationFail(validateZipcodesData);
        }
      } else {
        if (key === "name") {
          zones[tabIndex][key] = value;
          setZones([...zones]);
          return;
        } else {
          if (!value) {
            return setError("Please enter a zip code.");
          }
          const isDup = zones.some((tab) => tab.zipCodes.some((zip) => zip === value));
          if (isDup) {
            return setError("Zip code has been added already");
          } else {
            handleValidateZipCode(value, () => {
              zones[tabIndex].zipCodes.push(value);
              zones[tabIndex].zipCodes = [...new Set(zones[tabIndex].zipCodes)];
              setZones([...zones]);
            });
          }
        }
      }
    }
  };

  const validateZoneOrZipcodesRemoval = async (zipCodes) => {
    if (editForm) {
      try {
        setLoading(true);
        setError();
        const resp = await validatZipcodesRemoval(storeId, {zipCodes});
        return resp?.data;
      } catch (error) {
        setLoading(false);
        setError(error?.response?.data?.error || "Could not remove zipcode(s)");
      } finally {
        setLoading(false);
      }
    } else {
      return {success: true};
    }
  };

  const onZipcodesValidationFail = (data) => {
    setZipcodeValidationResp(data);
    setShowZipcodeValidationPopup(true);
  };

  // Validates and adds or removes a zip code from the list.

  const updateZipCodeList = async (removeItem = "") => {
    setError();
    if (removeItem) {
      const validateZipcodesData = await validateZoneOrZipcodesRemoval([removeItem]);
      if (validateZipcodesData?.success) {
        setZipCodeList(zipCodeList.filter((item) => item !== removeItem));
      } else {
        onZipcodesValidationFail(validateZipcodesData);
      }
    } else {
      if (!currentZip) {
        return setError("Please enter a zip code.");
      }
      if (zipCodeList.indexOf(currentZip) > -1) {
        return setError("Zip code has been added already.");
      }
      handleValidateZipCode(currentZip, () => {
        setZipCodeList((oldZipList) => [...oldZipList, currentZip]);
        setCurrentZip("");
      });
    }
  };

  const removeZone = async (zoneIndex) => {
    try {
      const validateZipcodesData =
        zones[zoneIndex]?.id && !!zones[zoneIndex]?.zipCodes.length
          ? await validateZoneOrZipcodesRemoval(zones[zoneIndex]?.zipCodes)
          : {success: true};
      if (validateZipcodesData?.success) {
        setLoading(true);
        const zoneToDelete = zones[zoneIndex];
        // if already existing zone remove it from server
        if (zoneToDelete?.id) {
          await deleteZone(storeId, zones[zoneIndex]["id"]);
        }
        if (zones.length === zoneIndex + 1) {
          setTabIndex(zoneIndex - 1);
        } else {
          setTabIndex(zoneIndex);
        }
        let updatedZones = JSON.parse(JSON.stringify(zones));
        updatedZones.splice(zoneIndex, 1);
        setZones(updatedZones);
      } else {
        onZipcodesValidationFail(validateZipcodesData);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Cannot remove zone.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBtwZonesAndZipcodes = async () => {
    let zipCodes = [];
    if (hasZones) {
      zones.forEach((item) => {
        zipCodes = [...zipCodes, ...item?.zipCodes];
      });
    } else {
      zipCodes = [...zipCodeList];
    }
    const validateZipcodesData = await validateZoneOrZipcodesRemoval(zipCodes);

    if (validateZipcodesData?.success) {
      setHasZones(!hasZones);
    } else {
      onZipcodesValidationFail(validateZipcodesData);
    }
  };

  return (
    <div className="setting-container service-area-container">
      {showZipcodeValidationPopup ? (
        <ZipcodeValidationErrorPopup
          zipCodesForDelivery={zipcodeValidationResp?.zipCodesForDelivery}
          zipCodesForRecurringSubscription={
            zipcodeValidationResp?.zipCodesForRecurringSubscription
          }
          setShowZipcodeValidationPopup={setShowZipcodeValidationPopup}
        />
      ) : null}
      <span className="setting-content-header">
        Which zip codes are serviced by this location?
      </span>
      <span className="setting-content-description">
        Type in a zip code and click the <span className="bolded">+</span> button to add
        it to your service area.
      </span>
      <div className="delivery-checkbox-container">
        <Checkbox
          checked={hasZones}
          name="administrator"
          onChange={toggleBtwZonesAndZipcodes}
        />
        <span className="delivery-checkbox-margin">Set up pickup/ delivery zones </span>
      </div>
      {hasZones ? (
        <>
          <div className="TabBar-content">
            <TabBar
              showAddNewButton={true}
              onAddNewClick={onAddNewClick}
              tabs={zones?.map((zone) => zone.name)}
              activeIndex={tabIndex}
              tabChangeHandler={setTabIndex}
              tabRemoveHandler={zones?.length > 1 ? removeZone : null}
              label={"+ Add a Zone"}
              removeTabConfirmationMessage="Are you sure you want to remove this zone?"
            />
          </div>
          <div className="zone-tab-content">
            {currentZone ? (
              <TabContent
                key={currentZone.name + tabIndex}
                name={currentZone.name}
                zipCodes={currentZone.zipCodes}
                updateZones={updateZones}
                setZones={setZones}
                hasZones={hasZones}
              />
            ) : null}
          </div>
        </>
      ) : (
        <ServiceAreaZipcodes
          zipCodeList={zipCodeList}
          onChange={(evt) => setCurrentZip(evt.target.value)}
          onClose={(item, index) => updateZipCodeList(item)}
          onClick={() => {
            updateZipCodeList();
            setCurrentZip("");
          }}
          value={currentZip}
          className="zip-input-container"
        />
      )}
    </div>
  );
};

export default ServiceArea;
