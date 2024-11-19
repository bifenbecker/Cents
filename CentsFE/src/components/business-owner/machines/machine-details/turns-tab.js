import React, {useEffect, useRef, useState} from "react";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

import TurnListItem from "./turn-list-item";

const TurnsTab = (props) => {
  const {turns, dispatch} = props;
  const listContentRef = useRef();

  const [listWidth, setListWidth] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    let height = listContentRef?.current?.clientHeight;
    let width = listContentRef?.current?.clientWidth;
    setListHeight(height || 0);
    setListWidth(width || 0);
  }, []);

  const handleTurnClick = (turn) => {
    // TODO: TURN VIEW IMPLEMENTATION
    // dispatch({type: "SET_SELECTED_TURN", payload: turn?.id});
  };

  const hasNoTurns = turns?.page === 1 && !turns?.loading && !turns?.list?.length;

  return (
    <div className="turns-tab-content" ref={listContentRef}>
      {turns.loading ? (
        <BlockingLoader />
      ) : (
        <>
          {turns?.error ? (
            <div className="no-turns-text">
              <p className="error-message">{turns?.error}</p>
            </div>
          ) : hasNoTurns ? (
            <div className="no-turns-text">
              <p>No turns associated to this machine</p>
            </div>
          ) : (
            <InfiniteLoader
              isItemLoaded={(index) => !turns?.hasMore || index < turns?.list?.length}
              itemCount={turns?.hasMore ? turns?.list?.length + 1 : turns?.list?.length}
              loadMoreItems={(() => {
                return turns?.loading
                  ? () => {}
                  : () => {
                      dispatch({type: "INCREMENT_TURNS_PAGE"});
                    };
              })()}
              threshold={4}
            >
              {({onItemsRendered, ref}) => (
                <FixedSizeList
                  height={listHeight}
                  width={listWidth}
                  itemCount={
                    turns?.hasMore ? turns?.list?.length + 1 : turns?.list?.length
                  }
                  itemSize={57}
                  ref={ref}
                  onItemsRendered={onItemsRendered}
                  itemData={{
                    turns: turns?.list,
                    handleTurnClick,
                    showInListLoader: turns?.loadingMore,
                  }}
                >
                  {TurnListItem}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          )}
        </>
      )}
    </div>
  );
};

export default TurnsTab;
