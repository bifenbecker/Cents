import React, {useState, useEffect, useRef, useCallback} from "react";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

import {getLocationString} from "../../../../utils/businessOwnerUtils";
import {getDevices} from "../../../../api/business-owner/machines";

import closeIcon from "../../../../assets/images/close.svg";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import SkeletonDeviceItem from "./skeleton-device-item";

const DeviceListItem = React.memo(({data, style, index}) => {
  const {devices, handleDeviceClick, showInListLoader, activeDevice} = data;

  if (index === devices?.length) {
    return <SkeletonDeviceItem style={style} showInListLoader={showInListLoader} />;
  }
  const deviceInfo = devices[index];
  if (!deviceInfo) {
    return null;
  }

  return (
    <div
      className={`device-info-container ${
        activeDevice?.id === deviceInfo?.id ? "active" : ""
      }`}
      style={style}
      onClick={() => {
        handleDeviceClick(deviceInfo);
      }}
    >
      <p className="bold-text device-name">{deviceInfo?.name}</p>
      <p className="bold-text store-name">{deviceInfo?.store?.address}</p>
      <div className="setup-info-container">
        <div className="status-dot" />
        <p className="setup-text">Device not set up</p>
      </div>
    </div>
  );
});

const DevicesList = (props) => {
  const {devices, selectedDevice, locations, allLocations, dispatch} = props;

  const [listHeight, setListHeight] = useState(0);
  const [listWidth, setListWidth] = useState(0);

  const listContentRef = useRef();

  useEffect(() => {
    let listHeight = listContentRef?.current?.clientHeight;
    let listWidth = listContentRef?.current?.clientWidth;
    setListHeight(listHeight || 0);
    setListWidth(listWidth || 0);
  }, []);

  const fetchDevices = useCallback(
    async (params) => {
      try {
        dispatch({type: "FETCHING_DEVICES", payload: {page: params?.page || 1}});
        const res = await getDevices(params);
        dispatch({type: "FETCH_DEVICES_SUCCESS", payload: res?.data || {}});
        if ((!params?.page || params?.page === 1) && res?.data?.devices[0]) {
          dispatch({
            type: "SET_SELECTED_DEVICE",
            payload: res?.data?.devices[0],
          });
        }
      } catch (e) {
        dispatch({
          type: "FETCH_DEVICES_FAILURE",
          payload: {
            error: e?.response?.data?.error || e?.message,
          },
        });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchDevices({storeIds: locations, page: devices.page});
  }, [devices.page, fetchDevices, locations]);

  const handleDeviceClick = (deviceInfo) => {
    dispatch({type: "SET_SELECTED_DEVICE", payload: deviceInfo});
  };

  return (
    <div className="devices-popup-container">
      <div className="close-icon">
        <img
          src={closeIcon}
          alt="exit"
          onClick={() => {
            dispatch({type: "TOGGLE_DEVICE_LIST"});
            dispatch({type: "RESET_DEVICE_STATE"});
          }}
        />
      </div>
      <div className="location-name">{getLocationString(locations, allLocations)}</div>
      <div className="heading-text">Unpaired Devices</div>
      <div className="devices-list-container" ref={listContentRef}>
        {devices?.loading && <BlockingLoader />}
        {devices?.error ? (
          <p className="error-message error">{devices?.error}</p>
        ) : devices?.page === 1 && !devices?.loading && !devices?.list?.length ? (
          <p className="no-devices-text">
            No unpaired devices available in this location
          </p>
        ) : (
          <InfiniteLoader
            isItemLoaded={(index) => !devices?.hasMore || index < devices?.list?.length}
            itemCount={
              devices?.hasMore ? devices?.list?.length + 1 : devices?.list?.length
            }
            loadMoreItems={(() => {
              return devices?.loading
                ? () => {}
                : () => {
                    dispatch({type: "INCREMENT_DEVICE_PAGE"});
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
                    devices?.hasMore ? devices?.list?.length + 1 : devices?.list?.length
                  }
                  itemSize={40}
                  ref={ref}
                  onItemsRendered={onItemsRendered}
                  itemData={{
                    devices: devices?.list,
                    handleDeviceClick: handleDeviceClick,
                    showInListLoader: devices?.loadingMore,
                    activeDevice: selectedDevice,
                  }}
                  className="device-item-list"
                >
                  {DeviceListItem}
                </FixedSizeList>
              );
            }}
          </InfiniteLoader>
        )}
      </div>
    </div>
  );
};

export default DevicesList;
