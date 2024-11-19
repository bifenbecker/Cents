// Package Imports
import React, {useEffect, Fragment} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../../commons/checkbox/checkbox";

// Components Import
import Card from "../../../commons/card/card";
import PromotionsWizard from "../../../../containers/bo-promotions-wizard";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import RoundedTabSwitcher from "../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import PromotionDetails from "../../../../containers/bo-promotion-details";
import StatusIndicator from "../../../commons/statusIndicator/statusIndicator";

const Promotions = (props) => {
  useEffect(() => {
    props.fetchAllPromotionsList();
    props.fetchAllLocations();

    return () => {
      handleSearch("");
      props.showHideNewPromotionWizard(false);
      props.setSearchInProgress(false);
      props.setActiveRoundedTab("active");
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (searchInput) => {
    props.handlePromotionSearch(searchInput);
  };

  const renderSearchResults = () => {
    if (props.searchText && props.promotionsList.length !== 0) {
      const searchResults = [...props.promotionsList];
      return (
        <div className="service-item-list search-results">
          {searchResults.map((promotion) => {
            return (
              <div
                key={promotion.id}
                className={`common-list-item ${
                  props.activePromotionId === promotion.id ? "active" : ""
                }`}
                onClick={() => {
                  props.setActivePromotion(promotion.id);
                }}
              >
                <Checkbox checked={props.activePromotionId === promotion.id} />
                <span style={{marginRight: "8px"}}>
                  <StatusIndicator status={promotion.active ? "paired" : "inactive"} />{" "}
                </span>
                <p className="service-item-type">{promotion.name}</p>
                <p className="service-item-dollar-amount">
                  {promotion.balanceRule.explanation}
                </p>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="service-item-list search-results">
          <div key={"No search results"} className={`common-list-item`}>
            <p style={{fontStyle: "italic"}}>{`No Search Results.`}</p>
          </div>
        </div>
      );
    }
  };

  const renderActivePromotions = () => {
    if (props.promotionsListError) {
      return (
        <div className="service-item-list">
          <div key={"error-item"} className={`common-list-item`}>
            <p className="error-message">{props.promotionsListError}</p>
          </div>
        </div>
      );
    }

    let activePromotionsList = props.promotionsList.filter((promotion) => {
      return promotion.active;
    });

    if (
      !activePromotionsList ||
      (activePromotionsList.length === 0 && !props.getAllPromotionsCallInProgress)
    ) {
      return (
        <div className="service-item-list">
          <div key={"No items to show"} className={`common-list-item`}>
            <p>{`No active promotions items yet. Click the '+' icon to start adding.`}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="service-item-list">
        {activePromotionsList.map((promotion) => {
          return (
            <div
              key={promotion.id}
              className={`common-list-item ${
                props.activePromotionId === promotion.id ? "active" : ""
              }`}
              onClick={() => {
                props.setActivePromotion(promotion.id);
              }}
            >
              <Checkbox checked={props.activePromotionId === promotion.id} />
              <p className="service-item-type">{promotion.name}</p>
              <p className="service-item-dollar-amount">
                {promotion.balanceRule.explanation}
              </p>
            </div>
          );
        })}
        <div
          key={"new-service-list-button"}
          className={`common-list-item ${
            props.showNewPromotionWizard && !props.isInPromotionEditMode ? "active" : ""
          } plus-item`}
          onClick={() => {
            handleSearch("");
            props.setSearchInProgress(false);
            props.showHideNewPromotionWizard(true);
          }}
        >
          {!props.showNewPromotionWizard ? (
            <p>+</p>
          ) : (
            <Fragment>
              <p>+</p>
              <p className="plus-item-type">{props.newPromoAndValue.name}</p>
              <p className="plus-item-description">
                {props.newPromoAndValue.discountValue}
              </p>
            </Fragment>
          )}
        </div>
      </div>
    );
  };

  const renderInactivePromotions = () => {
    if (props.promotionsListError) {
      return (
        <div className="service-item-list">
          <div key={"error-item"} className={`common-list-item`}>
            <p className="error-message">{props.promotionsListError}</p>
          </div>
        </div>
      );
    }

    let inactivePromotionsList = props.promotionsList.filter((promotion) => {
      return !promotion.active;
    });

    if (
      !inactivePromotionsList ||
      (inactivePromotionsList.length === 0 && !props.getAllPromotionsCallInProgress)
    ) {
      return (
        <div className="service-item-list">
          <div key={"No items to show"} className={`common-list-item`}>
            <p>{`No inactive promotions.`}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="service-item-list">
        {inactivePromotionsList.map((promotion) => {
          return (
            <div
              key={promotion.id}
              className={`common-list-item ${
                props.activePromotionId === promotion.id ? "active" : ""
              }`}
              onClick={() => {
                props.setActivePromotion(promotion.id);
              }}
            >
              <Checkbox checked={props.activePromotionId === promotion.id} />
              <p className="service-item-type">{promotion.name}</p>
              <p className="service-item-dollar-amount">
                {promotion.balanceRule.explanation}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLeftPaneContent = () => {
    if (props.searchInProgress) return renderSearchResults();
    else if (props.activeRoundedTab === "active") return renderActivePromotions();
    else return renderInactivePromotions();
  };

  const renderRightPaneContent = () => {
    if (props.searchInProgress) {
      const promotionsList = [...props.promotionsList];
      if (props.searchText === "" || promotionsList.length === 0) {
        return (
          <div className="no-search-results">
            <p>No Search Results</p>
          </div>
        );
      }
    }

    if (props.showNewPromotionWizard) {
      return <PromotionsWizard />;
    }

    return (
      <>
        {!props.activePromotionId ? (
          <p className="no-details-message">Please select a promotion to view details</p>
        ) : (
          <PromotionDetails promotionId={props.activePromotionId} />
        )}
      </>
    );
  };

  return (
    <Card>
      <div className={"bo-global-settings-content-2-column-layout"}>
        <div className={"bo-global-settings-content-left-column"}>
          <div className="locations-card-container">
            <div className="locations-card-header">
              <p>Promotions</p>
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() => {
                  handleSearch("");
                  props.setSearchInProgress(false);
                  props.showHideNewPromotionWizard(true);
                }}
              />
            </div>
            <div className="services-tab-search-container">
              {!props.searchInProgress && (
                <RoundedTabSwitcher
                  className="service-categories"
                  roundedTabs={props.roundedTabs}
                  activeRoundedTab={props.activeRoundedTab}
                  setActiveRoundedTab={props.setActiveRoundedTab}
                />
              )}
              <SearchBar
                className="services-list"
                setSearchInProgress={props.setSearchInProgress}
                searchInProgress={props.searchInProgress}
                handleSearch={handleSearch}
                value={props.searchText}
              />
            </div>
            <div className="locations-card-content">{renderLeftPaneContent()}</div>
            {props.getAllPromotionsCallInProgress ? <BlockingLoader /> : null}
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            {renderRightPaneContent()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Promotions;
