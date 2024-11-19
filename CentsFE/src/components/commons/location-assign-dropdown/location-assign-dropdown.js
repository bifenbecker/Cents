import React, {useState, Fragment, useEffect, useCallback} from "react";
import _ from "lodash";
import LabelDropdown from "../label-dropdown/label-dropdown";
import locationIcon from "../../../assets/images/location.svg";
import Checkbox from "../../commons/checkbox/checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {useFlags} from "launchdarkly-react-client-sdk";
import {useIntercom} from "react-use-intercom";
import {INTERCOM_EVENTS, INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";
import useTrackEvent from "hooks/useTrackEvent";

const ListItem = React.memo((props) => {
  const {
    item,
    level,
    clickHandler,
    checkboxHandler,
    countsObj,
    selectedLocations,
  } = props;

  return (
    <div
      key={`${level}-${item.id}`}
      title={item.name}
      className={`common-list-item ${level !== "location" ? "hover-arrow" : ""}`}
      onClick={() => {
        if (clickHandler) clickHandler(item.id);
      }}
    >
      <Checkbox
        checked={
          level === "location"
            ? selectedLocations?.indexOf(item.id) > -1
            : countsObj.assignedCount > 0
        }
        onChange={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          if (checkboxHandler) checkboxHandler(item.id);
        }}
        disabled={props?.disabled}
      />
      <p>
        {level === "location" ? (
          <Fragment>{item.address}</Fragment>
        ) : (
          <Fragment>
            {item.name}{" "}
            <span>
              ({countsObj.assignedCount}/{countsObj.total})
            </span>
          </Fragment>
        )}{" "}
      </p>
    </div>
  );
});

const LocationAssignDropdown = (props) => {
  const [selectedRegion, setSelectedRegion] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [resetLocalSelectedLocations, setResetLocalSelectedLocations] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  const {trackEvent} = useTrackEvent();

  const {selectedLocations: selectedLocationsProp, totalLocations} = props;

  useEffect(() => {
    setSelectedLocations(selectedLocationsProp);
    setResetLocalSelectedLocations(false);
  }, [selectedLocationsProp, resetLocalSelectedLocations]);

  const getRenderLevelValue = useCallback(() => {
    if (selectedRegion) {
      if (selectedDistrict) {
        return "location";
      } else {
        return "district";
      }
    } else {
      return "region";
    }
  }, [selectedRegion, selectedDistrict]);

  const updateSelectAllCheckbox = () => {
    if (selectedRegion) {
      if (selectedDistrict) {
        handleDistrictCheckboxClick(selectedDistrict, "selectAll");
      } else {
        handleRegionCheckboxClick(selectedRegion, "selectAll");
      }
    } else {
      if (selectAll) {
        setSelectedLocations([]);
      } else {
        setSelectedLocations(totalLocations);
      }
    }
    setSelectAll(!selectAll);
  };

  const handleLocationCheckboxClick = (locationId) => {
    let newSelectedLocations = selectedLocations.slice();
    const itemIndex = newSelectedLocations.indexOf(locationId);
    if (itemIndex === -1) {
      newSelectedLocations.push(locationId);
    } else {
      newSelectedLocations.splice(itemIndex, 1);
    }

    if (props.onChange && !props.withDetails) {
      props.onChange(newSelectedLocations);
    } else {
      setSelectedLocations(newSelectedLocations);
    }
  };

  const handleRegionCheckboxClick = (regionId, type) => {
    let countsObj = getCounts("region", regionId);
    let newSelectedLocations = selectedLocations.slice();
    let region = props.allLocations.regions.find((region) => region.id === regionId);
    if (!region) {
      return;
    }

    if (
      (countsObj.assignedCount > 0 && type !== "selectAll") ||
      (type === "selectAll" &&
        countsObj.assignedCount &&
        countsObj.assignedCount === countsObj.total)
    ) {
      for (let district of region.districts) {
        for (let location of district.stores) {
          let locIndex = newSelectedLocations.indexOf(location.id);
          if (locIndex !== -1) {
            newSelectedLocations.splice(locIndex, 1);
          }
        }
      }
    } else {
      for (let district of region.districts) {
        for (let location of district.stores) {
          let locIndex = newSelectedLocations.indexOf(location.id);
          if (locIndex === -1) {
            newSelectedLocations.push(location.id);
          }
        }
      }
    }

    if (props.onChange && !props.withDetails) {
      props.onChange(newSelectedLocations);
    } else {
      setSelectedLocations(newSelectedLocations);
    }
  };

  const handleDistrictCheckboxClick = (districtId, type) => {
    let countsObj = getCounts("district", districtId);
    let newSelectedLocations = selectedLocations.slice();
    let region = props.allLocations.regions.find(
      (region) => region.id === selectedRegion
    );
    if (!region) {
      return;
    }
    let district = region.districts.find((district) => district.id === districtId);
    if (!district) {
      return;
    }

    if (
      (countsObj.assignedCount > 0 && type !== "selectAll") ||
      (type === "selectAll" &&
        countsObj.assignedCount &&
        countsObj.assignedCount === countsObj.total)
    ) {
      for (let location of district.stores) {
        let locIndex = newSelectedLocations.indexOf(location.id);
        if (locIndex !== -1) {
          newSelectedLocations.splice(locIndex, 1);
        }
      }
    } else {
      for (let location of district.stores) {
        let locIndex = newSelectedLocations.indexOf(location.id);
        if (locIndex === -1) {
          newSelectedLocations.push(location.id);
        }
      }
    }

    if (props.onChange && !props.withDetails) {
      props.onChange(newSelectedLocations);
    } else {
      setSelectedLocations(newSelectedLocations);
    }
  };

  const handleOnApply = () => {
    void props.onChange?.(selectedLocations);

    trackEvent(
      INTERCOM_EVENTS.laundromatDropdown,
      INTERCOM_EVENTS_TEMPLATES.laundromatLocationsDropdown
    );
  };

  const getCounts = useCallback(
    (level, itemId) => {
      const regions = _.get(props, "allLocations.regions", []);
      const storesWithoutRegions = _.get(props, "allLocations.storesWithoutRegions", []);

      if (!props.needsRegions) {
        return {
          assignedCount: selectedLocations?.length || 0,
          total: _.get(props, "allLocations.locations.length", 0),
        };
      }

      if (!regions) {
        if (storesWithoutRegions?.length) {
          return {
            assignedCount: selectedLocations?.length || 0,
            total: storesWithoutRegions?.length || 0,
          };
        }
        return {assignedCount: 0, total: 0};
      }
      let assignedLocations = selectedLocations;
      if (!assignedLocations) {
        assignedLocations = [];
      }
      let totalLocations = 0;
      if (level === "overall") {
        let count = 0;

        for (let region of regions) {
          for (let district of region.districts) {
            totalLocations += district.stores.length;
            for (let location of district.stores) {
              if (assignedLocations.includes(location.id)) {
                count += 1;
              }
            }
          }
        }
        if (storesWithoutRegions?.length) {
          totalLocations += storesWithoutRegions?.length;
          let selectedStores = storesWithoutRegions?.reduce((acc, store) => {
            if (assignedLocations.includes(store.id)) {
              acc += 1;
            }
            return acc;
          }, 0);
          count += selectedStores;
        }

        return {assignedCount: count, total: totalLocations};
      } else if (level === "region") {
        let regionId = itemId;
        if (!regionId) {
          return {assignedCount: 0, total: 0};
        }

        let region = regions.find((region) => region.id === regionId);

        if (!region) {
          return {assignedCount: 0, total: 0};
        }

        let assignedCount = 0;
        let total = 0;

        for (let district of region.districts) {
          total += district.stores.length;
          for (let location of district.stores) {
            if (assignedLocations.includes(location.id)) {
              assignedCount += 1;
            }
          }
        }

        return {assignedCount, total};
      } else if (level === "district") {
        let regionId = selectedRegion;
        let districtId = itemId;

        if (!regionId || !districtId) {
          return {assignedCount: 0, total: 0};
        }

        let region = regions.find((region) => region.id === regionId);
        if (!region) {
          return {assignedCount: 0, total: 0};
        }
        let district = region.districts.find((district) => district.id === districtId);
        if (!district) {
          return {assignedCount: 0, total: 0};
        }

        let total = district.stores.length;
        let assignedCount = 0;

        for (let location of district.stores) {
          if (assignedLocations.includes(location.id)) {
            assignedCount += 1;
          }
        }
        return {assignedCount, total};
      }
    },
    [props, selectedLocations, selectedRegion]
  );

  const _get_header_label = (level) => {
    if (level === "region") {
      return "Regions";
    } else if (level === "district") {
      const regions = props.allLocations.regions;
      if (!regions) {
        return "Districts";
      }
      const region = regions.find((region) => region.id === selectedRegion);
      return region.name;
    } else if (level === "location") {
      const regions = props.allLocations.regions;
      const region = regions.find((region) => region.id === selectedRegion);
      if (!region) {
        return "Locations";
      }
      const district = region.districts.find((dist) => dist.id === selectedDistrict);
      return district.name;
    }
  };

  useEffect(() => {
    const renderLevel = getRenderLevelValue();
    let headerCounts;

    if (renderLevel === "region") {
      if (selectedLocations?.length < totalLocations?.length) {
        setSelectAll(false);
      } else {
        setSelectAll(true);
      }
    } else if (renderLevel === "district") {
      headerCounts = getCounts("region", selectedRegion);
      setSelectAll(headerCounts?.assignedCount === headerCounts?.total);
    } else {
      headerCounts = getCounts("district", selectedDistrict);
      setSelectAll(headerCounts?.assignedCount === headerCounts?.total);
    }
  }, [
    selectedLocations,
    totalLocations,
    getRenderLevelValue,
    selectedDistrict,
    selectedRegion,
    getCounts,
  ]);

  const _render_list_items = (level, list, otherStores = []) => {
    let clickHandler;
    let checkboxHandler;
    let headerCounts;
    if (level === "region") {
      clickHandler = setSelectedRegion;
      checkboxHandler = handleRegionCheckboxClick;
      headerCounts = getCounts("overall");
    } else if (level === "district") {
      clickHandler = setSelectedDistrict;
      checkboxHandler = handleDistrictCheckboxClick;
      headerCounts = getCounts("region", selectedRegion);
    } else {
      clickHandler = () => {};
      checkboxHandler = handleLocationCheckboxClick;
      headerCounts = getCounts("district", selectedDistrict);
    }

    let data = [];
    data = [
      ...list?.map((item) => (
        <ListItem
          item={item}
          level={level}
          clickHandler={clickHandler}
          checkboxHandler={checkboxHandler}
          countsObj={getCounts(level, item.id)}
          selectedLocations={selectedLocations}
          disabled={props.disabled}
        />
      )),
      ...otherStores?.map((store) => (
        <ListItem
          item={store}
          level="location"
          checkboxHandler={handleLocationCheckboxClick}
          countsObj={getCounts("location", store.id)}
          selectedLocations={selectedLocations}
          disabled={props.disabled}
        />
      )),
    ];

    data.unshift(
      <>
        <div
          className={
            props.withDetails && !selectedRegion && !selectedDistrict && false
              ? `header withArchievedLocation`
              : `header`
          }
          key={`${level}-HEADER`}
        >
          {" "}
          {/* Hardcoding false to hide `show arrchived locations` */}
          <div style={{display: "flex"}}>
            {selectedRegion ? (
              selectedDistrict ? (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="back"
                  onClick={() => {
                    setSelectedDistrict();
                  }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="back"
                  onClick={() => {
                    setSelectedRegion();
                  }}
                />
              )
            ) : null}
            <p>
              {_get_header_label(
                level === "region" && otherStores?.length ? "location" : level
              ).toUpperCase()}{" "}
              <span>
                ({headerCounts.assignedCount}/{headerCounts.total})
              </span>
            </p>
          </div>
          {props.withDetails && !selectedRegion && !selectedDistrict && false ? ( // Hardcoding false to hide `show arrchived locations`
            <div className="common-list-item">
              <Checkbox />
              <p style={{color: "#000"}}>
                <Fragment>Show archived locations</Fragment>
              </p>
            </div>
          ) : null}
        </div>
        {props.withDetails && (
          <div className="common-list-item sub-heading">
            <Checkbox
              checked={selectAll}
              onChange={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                updateSelectAllCheckbox();
              }}
              disabled={props?.disabled}
            />
            <p>
              <Fragment>Select All</Fragment>
            </p>
          </div>
        )}
      </>
    );

    return data;
  };

  const _render_locations = (allLocations, selectedLocations, needsRegions) => {
    if (!allLocations || !selectedLocations) {
      return;
    }
    if (needsRegions) {
      if (!allLocations.regions) {
        return null;
      }

      const renderLevel = getRenderLevelValue();
      let data = [];

      if (renderLevel === "region") {
        data = _render_list_items(
          "region",
          allLocations?.regions || [],
          allLocations?.storesWithoutRegions || []
        );
      } else if (renderLevel === "district") {
        let region = allLocations.regions.find((region) => region.id === selectedRegion);
        if (!region) {
          return null;
        }

        data = _render_list_items("district", region?.districts || []);
      } else {
        let region = allLocations?.regions.find((region) => region.id === selectedRegion);
        if (!region) {
          return null;
        }
        let district = region.districts.find(
          (district) => district.id === selectedDistrict
        );
        if (!district) {
          return null;
        }
        data = _render_list_items("location", district?.stores || []);
      }

      return data;
    } else {
      // No regions in data trying to render locations
      if (!allLocations.locations) {
        return null;
      }
      return _render_list_items("location", allLocations?.locations || []);
    }
  };
  const _get_label = () => {
    const counts = getCounts("overall");
    if (counts.assignedCount) {
      return (
        <p className={props.className ? `${props.className}` : null}>{`${
          counts.assignedCount === counts.total ? "All" : counts.assignedCount
        } Location${counts.assignedCount !== 1 ? "s" : ""}`}</p>
      );
    } else {
      return (
        <p className="grey-text">
          {counts.total === 0 ? "No locations" : props?.label || "Select location(s)"}
        </p>
      );
    }
  };

  const _render_location_details = () => {
    if (!props.withDetails) {
      return;
    }
    let regionData = [];
    let store = {};
    if (selectedLocations.length === 0) {
      return <div className="no-content">No Locations Selected</div>;
    }
    selectedLocations.forEach((locationId) => {
      props.allLocations.regions.forEach((region) => {
        region.districts.forEach((district) => {
          store = district.stores.find((store) => store.id === locationId);
          if (store) {
            regionData.push(`${district.name.toUpperCase()} - ${store.address}`);
          }
          store = {};
        });
      });
      if (props?.allLocations?.storesWithoutRegions?.length) {
        const selectedstore = props?.allLocations?.storesWithoutRegions?.find(
          (store) => store.id === locationId
        );
        if (selectedstore?.id) regionData.push(`${selectedstore?.address}`);
      }
    });
    return regionData.map((data, index) => {
      return (
        <div key={`region-data-${index}`} className="selectedLocation-content">
          {data}
        </div>
      );
    });
  };

  return (
    <LabelDropdown
      label={_get_label()}
      icon={locationIcon}
      isDisabled={props.disabled}
      cardContent={_render_locations(
        props.allLocations,
        selectedLocations,
        props.needsRegions
      )}
      rightPaneContent={_render_location_details()}
      withDetails={props.withDetails}
      onApply={handleOnApply}
      onClose={() => {
        setResetLocalSelectedLocations(true);
      }}
      className={props.className || ""}
      onClick={props.onClick}
    />
  );
};

export default LocationAssignDropdown;
