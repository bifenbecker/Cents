import React, {useEffect, useRef, useState} from "react";
import {FixedSizeList} from "react-window";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import InfiniteLoader from "react-window-infinite-loader";
import debounce from "lodash/debounce";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";

import addNewBlueIcon from "../../../../assets/images/Icon_Add_New_Blue.svg";

import {getLocationString} from "../../../../utils/businessOwnerUtils";
import {MACHINE_TYPES, WIZARD_TYPES} from "../constants";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import RoundedTabSwitcher from "../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import MachineListItem from "./machine-list-item";

const updateSearchState = debounce(
  (dispatch, payload) =>
    dispatch({
      type: "MACHINES_SET_KEYWORD",
      payload,
    }),
  500
);

const MachinesList = (props) => {
  const {locations, dispatch, machines, stats, selectedMachineId, onReload} = props;

  const [listHeight, setListHeight] = useState(0);
  const [listWidth, setListWidth] = useState(0);
  const [searchText, setSearchText] = useState(machines?.keyword);

  const listContentRef = useRef();

  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    let listHeight = listContentRef?.current?.clientHeight;
    let listWidth = listContentRef?.current?.clientWidth;
    setListHeight(listHeight || 0);
    setListWidth(listWidth || 0);
  }, []);

  const handleMachineClick = (machine) => {
    dispatch({type: "SET_SELECTED_MACHINE_ID", payload: machine?.id});
  };

  const hasNoMachines =
    machines?.page === 1 &&
    !machines?.loading &&
    !machines?.list?.length &&
    !machines?.error;

  const onAddMachineClick = () => {
    trackEvent(
      INTERCOM_EVENTS.machineWizard,
      INTERCOM_EVENTS_TEMPLATES.machineWizard.addingNew,
      {
        "Button name": "Add",
      }
    );

    dispatch({
      type: "OPEN_WIZARD",
      payload: WIZARD_TYPES.addMachine,
    });
  };

  const onSearchTextChange = (value) => {
    // sets the search keyword as the value.
    setSearchText(value);
    // this is a debounced set search keyword func for state value.
    updateSearchState(dispatch, value);
    if (!value && machines?.showSearchBar) {
      dispatch({
        type: "SET_SELECTED_MACHINE_ID",
        payload: null,
      });
    }
  };

  return (
    <div className="machines-list-container">
      <div className="machine-list-header">
        <p>Showing machines in {getLocationString(locations.selected, locations.all)}</p>
        <img
          src={addNewBlueIcon}
          alt="+"
          className="add-new-machine-icon"
          onClick={onAddMachineClick}
        />
      </div>
      <div className="card-content-container">
        <div className="machine-list-content-header">
          {!machines?.showSearchBar && (
            <div className="left-content">
              <RoundedTabSwitcher
                roundedTabs={[
                  {label: "Washers", value: MACHINE_TYPES.washer},
                  {label: "Dryers", value: MACHINE_TYPES.dryer},
                ]}
                setActiveRoundedTab={(type) => {
                  dispatch({
                    type: "SET_MACHINE_TYPE_TAB",
                    payload: type,
                  });
                }}
                activeRoundedTab={machines?.type}
                className="machine-type-tab-selector"
              />
              {stats?.data?.unpairedDevices ? (
                <div
                  className="unpaired-devices-link"
                  onClick={() => dispatch({type: "TOGGLE_DEVICE_LIST"})}
                >
                  <div className="unpaired-devices-icon">!</div>
                  {stats?.data?.unpairedDevices} unpaired <br /> devices
                </div>
              ) : null}
              {machines?.newMachinesCount ? (
                <button
                  className="btn-theme btn-transparent btn-rounded btn-reload"
                  onClick={onReload}
                >
                  <FontAwesomeIcon icon={faSyncAlt} className="sync-icon" />
                  Refresh
                </button>
              ) : null}
            </div>
          )}
          <SearchBar
            dontSearchOnClose
            className="machines-list-search"
            setSearchInProgress={(payload) => {
              // This will set the global search keyword as empty.
              dispatch({
                type: "MACHINE_TOGGLE_SEARCH_BAR",
                payload,
              });
              // This will set the local search keyword as empty.
              setSearchText("");
            }}
            searchInProgress={machines?.showSearchBar}
            handleSearch={onSearchTextChange}
            value={searchText || ""}
          />
        </div>
        <div className="machines-list-content" ref={listContentRef}>
          {machines?.loading ? (
            <BlockingLoader />
          ) : (
            <>
              {machines?.error ? (
                <p className="error-message">{machines?.error}</p>
              ) : null}
              {hasNoMachines ? (
                <div className="no-machines-text">
                  {machines?.showSearchBar ? (
                    <>
                      {machines?.keyword
                        ? "No results for this search"
                        : "Please enter search text"}
                    </>
                  ) : (
                    <>
                      <p>
                        No {machines?.type?.toLowerCase()}s have been added for the
                        selected location(s).
                      </p>
                      <div>
                        <button className="btn btn-text" onClick={onAddMachineClick}>
                          Click here
                        </button>{" "}
                        to add a {machines?.type?.toLowerCase()}.
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <InfiniteLoader
                  isItemLoaded={(index) =>
                    !machines?.hasMore || index < machines?.list?.length
                  }
                  itemCount={
                    machines?.hasMore
                      ? machines?.list?.length + 1
                      : machines?.list?.length
                  }
                  loadMoreItems={(() => {
                    return machines?.loading
                      ? () => {}
                      : () => {
                          dispatch({type: "INCREMENT_MACHINES_PAGE"});
                        };
                  })()}
                  threshold={4}
                >
                  {({onItemsRendered, ref}) => {
                    return (
                      <FixedSizeList
                        height={listHeight}
                        width={listWidth}
                        itemCount={
                          machines?.hasMore
                            ? machines?.list?.length + 1
                            : machines?.list?.length
                        }
                        itemSize={67}
                        ref={ref}
                        onItemsRendered={onItemsRendered}
                        itemData={{
                          machines: machines?.list,
                          handleMachineClick,
                          showInListLoader: machines?.loadingMore,
                          selectedMachineId,
                        }}
                      >
                        {MachineListItem}
                      </FixedSizeList>
                    );
                  }}
                </InfiniteLoader>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachinesList;
