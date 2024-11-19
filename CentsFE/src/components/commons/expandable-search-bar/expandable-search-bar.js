import React, {useEffect, useRef} from "react";
import searchIcon from "../../../assets/images/Icon_Search_List.svg";
import closeIcon from "../../../assets/images/Icon_Exit_Side_Panel.svg";

const ExpandableSearchBar = ({
  className,
  setSearchInProgress,
  searchInProgress,
  handleSearch,
  value,
  dontSearchOnClose,
  includeArchived,
}) => {
  const inputRef = useRef();
  useEffect(() => {
    if (searchInProgress) inputRef.current.focus();
  }, [searchInProgress]);

  return (
    <div className={`searchbar-container ${className}`}>
      <div className={` ${searchInProgress ? "expand" : "contract"}`}>
        <img
          src={searchIcon}
          className="search-icon"
          alt="icon"
          onClick={() => {
            setSearchInProgress(true);
          }}
        />
        <input
          type="text"
          className="searchbar-input"
          onChange={(evt) => {
            handleSearch(evt.target.value, includeArchived);
          }}
          value={value}
          ref={inputRef}
        />
        {searchInProgress && (
          <img
            src={closeIcon}
            className="close-icon"
            alt="icon"
            onClick={() => {
              setSearchInProgress(false);
              if (!dontSearchOnClose) {
                handleSearch("", includeArchived);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

ExpandableSearchBar.defaultProps = {
  dontSearchOnClose: false,
};

export default ExpandableSearchBar;
