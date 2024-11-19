import React, {useReducer, useCallback, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import Card from "../../../commons/card/card";
import RoundedTabSwitcher from "../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import TierDetails from "./tier-details";
import TiersList from "./tiers-list";
import {TIER_TABS, TIER_TYPE} from "./constants";
import reducer, {initialState} from "./reducer";
import get from "lodash/get";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import {fetchServiceCategories} from "../../../../api/business-owner/services";
import {fetchTiersList} from "../../../../api/business-owner/tiers";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

const PricingTiers = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  });
  const [searchInProgress, setSearchInProgress] = useState(false);

  const onSearchTextChange = async (searchText) => {
    dispatch({
      type: "SET_FILTERED_TIERS_LIST",
      payload: {searchText},
    });
  };

  const fetchPricingTiers = useCallback(
    async (type) => {
      try {
        dispatch({
          type: "SET_LOADER",
          payload: true,
        });

        const res = await fetchTiersList({type: TIER_TYPE[type]});

        dispatch({
          type: "SET_TIERS_LIST",
          payload: res?.data?.tiers,
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: get(error, "response.data.error", "Could not get tiers list!"),
        });
      } finally {
        dispatch({
          type: "SET_LOADER",
          payload: false,
        });
      }
    },
    [dispatch]
  );

  const fetchNewServices = useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });
      const catList = await fetchServiceCategories();
      dispatch({
        type: "SET_NEW_SERVICES",
        payload: catList?.data,
      });
      dispatch({
        type: "SET_ERROR",
        payload: "",
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: get(error, "response.data.error", "Could not get tiers list!"),
      });
    } finally {
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPricingTiers(state.activeRoundedTab);
  }, [fetchPricingTiers, state.activeRoundedTab]);

  const onPlusIconClick = () => {
    setShowHideNewTierWizard(true);
  };

  const setShowHideNewTierWizard = (value) => {
    dispatch({
      type: "TOGGLE_NEW_TIER_CREATION_WIZARD",
      payload: value,
    });
  };

  const setActiveRoundedTab = (value) => {
    setSearchInProgress(false);
    dispatch({
      type: "SET_ACTIVE_ROUNDED_TAB",
      payload: value,
    });
  };

  return (
    <Card>
      <div
        className={"bo-global-settings-content-2-column-layout"}
        style={{gridTemplateColumns: "minmax(420px, 520px) minmax(525px, 625px)"}}
      >
        <div className={"bo-global-settings-content-left-column"}>
          <div className="locations-card-container">
            <div className="locations-card-header">
              <p>Pricing Tiers</p>
              <FontAwesomeIcon icon={faPlus} onClick={onPlusIconClick} />
            </div>
            <div className="services-tab-search-container">
              <RoundedTabSwitcher
                className="tiers-categories"
                roundedTabs={TIER_TABS}
                activeRoundedTab={state?.activeRoundedTab}
                setActiveRoundedTab={setActiveRoundedTab}
              />

              <SearchBar
                setSearchInProgress={setSearchInProgress}
                searchInProgress={searchInProgress}
                handleSearch={onSearchTextChange}
                value={state?.searchText}
              />
            </div>
            <div className="locations-card-content">
              <TiersList
                setShowHideNewTierWizard={setShowHideNewTierWizard}
                state={state}
                dispatch={dispatch}
              />
            </div>
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            <TierDetails
              setShowHideNewTierWizard={setShowHideNewTierWizard}
              state={state}
              dispatch={dispatch}
              fetchPricingTiers={fetchPricingTiers}
              fetchNewServices={fetchNewServices}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default withLDConsumer()(PricingTiers);
