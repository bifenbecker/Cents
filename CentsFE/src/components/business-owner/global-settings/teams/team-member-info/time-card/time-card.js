import React, {useRef, useState, useEffect, useCallback} from "react";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import momentTz from "moment-timezone";
import get from "lodash/get";

import {
  fetchTeamMemberInsights,
  getTimeLog,
} from "../../../../../../api/business-owner/teams";
import {getTimeDifference} from "../../../../../../utils/businessOwnerUtils";

import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader";

const TimeLogListItem = React.memo(({data, style, index}) => {
  const {timeLogs, showInListLoader, handleTimeLogClick, activeLog, onEditClick} = data;

  if (index === timeLogs.length) {
    if (showInListLoader) {
      return (
        <div
          className="order-short-row-item"
          style={{...style, ...{borderBottom: "0px"}}}
        >
          <BlockingLoader />
        </div>
      );
    } else {
      return <div className="order-short-row-item" style={style}></div>;
    }
  }
  const timeLog = timeLogs[index];
  if (!timeLog) {
    return null;
  }

  return (
    <div
      className={`time-log-short-row-item ${
        activeLog?.id === timeLog.id ? "active" : ""
      }`}
      style={style}
      onMouseEnter={() => handleTimeLogClick(timeLog)}
      onMouseLeave={() => handleTimeLogClick()}
    >
      <div className="text-container date">
        <p className="main-text">{momentTz(timeLog.checkInTime).format("MM/DD/YY")}</p>
      </div>
      <div className="text-container checkIn-Checkout">
        <p className="main-text">
          {momentTz(timeLog.checkInTime).tz(momentTz.tz.guess()).format("hh:mm a z")}
        </p>
      </div>
      <div className="text-container checkIn-Checkout">
        <p className="main-text">
          {timeLog.checkOutTime
            ? momentTz(timeLog.checkOutTime).tz(momentTz.tz.guess()).format("hh:mm a z")
            : "-"}
        </p>
      </div>
      <div className="text-container hours">
        <p className="main-text">{getTimeDifference(timeLog)}</p>
      </div>
      <div className="text-container spacer">
        <p className="edit-text" onClick={() => onEditClick(timeLog)}>
          edit &gt;
        </p>
      </div>
    </div>
  );
});

const initialState = {
  timeLogs: [],
  totalLogs: 0,
  currentPage: 1,
};

const TimeCard = (props) => {
  let activeTeamMemberId = props.activeTeamMemberId;
  const [state, setState] = useState(initialState);
  const [showInListLoader, setShowInLoader] = useState(false);
  const [showListLoader, setShowLoader] = useState(false);
  const [activeLog, setActiveLog] = useState(state?.timeLogs[0]);
  const [insights, setInsights] = useState({});
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);

  const [listHeight, setListHeight] = useState(0);
  const [listWidth, setListWidth] = useState(0);

  const listContentRef = useRef();

  const handleTimeLogClick = (timeLog) => {
    setActiveLog(timeLog);
  };

  const getInsights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTeamMemberInsights(activeTeamMemberId, {
        timeZone: momentTz.tz.guess(),
      });
      setInsights(res.data);
    } catch (error) {
      setError(get(error, "response.data.error", "Error while fetching insights"));
    } finally {
      setLoading(false);
    }
  }, [activeTeamMemberId]);

  const fetchTimeLogs = useCallback(async (activeTeamMemberId, page) => {
    try {
      setShowInLoader(page === 1 ? false : true);
      setShowLoader(page === 1 ? true : false);
      const res = await getTimeLog(activeTeamMemberId, {page});
      setState((prevState) => ({
        ...prevState,
        timeLogs: [...prevState.timeLogs, ...res.data.logs],
        totalLogs: res.data.totalCount,
        currentPage: Number(res.data.currentPage),
      }));
    } catch (error) {
      setError(get(error, "response.data.error", "Error while fetching timelogs"));
    } finally {
      setShowInLoader(false);
      setShowLoader(false);
    }
  }, []);

  useEffect(() => {
    getInsights();
  }, [getInsights]);

  useEffect(() => {
    fetchTimeLogs(activeTeamMemberId, state.currentPage);
  }, [activeTeamMemberId, state.currentPage, fetchTimeLogs]);

  useEffect(() => {
    let listHeight = listContentRef.current.clientHeight;
    let listWidth = listContentRef.current.clientWidth;
    setListHeight(listHeight);
    setListWidth(listWidth);
  }, []);

  useEffect(() => {
    if (state.currentPage === 1 && showInListLoader === false) {
      let scrollView = document.getElementsByClassName("time-logs-list")[0];
      if (scrollView) {
        scrollView.scrollTop = 0;
      }
    }
  }, [state.currentPage, showInListLoader]);

  return (
    <div className="timecard-container">
      {loading && showListLoader && <BlockingLoader />}
      <div className="timecard-content">
        <div className="insights-container">
          <div className="insights-content">
            <p>Hrs worked this week:</p>
            <p className="insights-value">{insights?.thisWeek || "-"}</p>
          </div>
          <div className="insights-content">
            <p>Hrs worked this month:</p>
            <p className="insights-value">{insights?.thisMonth || "-"}</p>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {!showListLoader && !loading && state.timeLogs.length ? (
          <div className="logs-header-container">
            <div className="header-title date">
              <p>Date</p>
            </div>
            <div className="header-title checkIn-Checkout">
              <p>Check-In</p>
            </div>
            <div className="header-title checkIn-Checkout">
              <p>Checkout</p>
            </div>
            <div className="header-title hours">
              <p>Hrs</p>
            </div>
            <div className="header-title spacer"></div>
          </div>
        ) : null}
        <div className="time-logs-list-content" ref={listContentRef}>
          {!showListLoader && !loading && !state.timeLogs.length ? (
            <p className="no-time-logs-text">
              No timeLogs available for this team member
            </p>
          ) : (
            <InfiniteLoader
              isItemLoaded={(index) =>
                !(state.totalLogs > state.timeLogs?.length) ||
                index < state.timeLogs?.length
              }
              itemCount={
                state.totalLogs > state.timeLogs?.length
                  ? state.timeLogs?.length + 1
                  : state.timeLogs?.length
              }
              loadMoreItems={(() => {
                return showListLoader
                  ? () => {}
                  : () => {
                      setState((prevState) => ({
                        ...prevState,
                        currentPage: Number(prevState.currentPage) + 1,
                      }));
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
                      state.totalLogs > state.timeLogs?.length
                        ? state.timeLogs?.length + 1
                        : state.timeLogs?.length
                    }
                    itemSize={45}
                    ref={ref}
                    onItemsRendered={onItemsRendered}
                    itemData={{
                      timeLogs: state.timeLogs,
                      handleTimeLogClick: handleTimeLogClick,
                      showInListLoader: showInListLoader,
                      activeLog: activeLog,
                      onEditClick: props.onEditClick,
                    }}
                    className="time-logs-list"
                  >
                    {TimeLogListItem}
                  </FixedSizeList>
                );
              }}
            </InfiniteLoader>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeCard;
