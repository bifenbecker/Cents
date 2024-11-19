import React, {useEffect, memo, useRef, useState, useMemo, useLayoutEffect} from "react";
import momentTz from "moment-timezone";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import toast from "react-hot-toast";
import SearchBar from "../../commons/expandable-search-bar/expandable-search-bar";

import {UncontrolledPopover} from "reactstrap";

import ThreeCardLayout from "../three-card-layout/three-card-layout";
import phoneIcon from "../../../assets/images/phone.svg";
import emailIcon from "../../../assets/images/email.svg";
import dollarIcon from "../../../assets/images/dollar.svg";
import basketIcon from "../../../assets/images/Icon_Basket.svg";
import locationIcon from "../../../assets/images/location.svg";
import calendarIcon from "../../../assets/images/calendar.svg";
import personIcon from "../../../assets/images/person.svg";
import globeIcon from "../../../assets/images/Icon_Globe.svg";
import downloadImg from "../../../assets/images/download.svg";
import personIconBlue from "../../../assets/images/Icon_Person_Blue.svg";
import TextField from "../../commons/textField/textField";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import {getLocationString} from "../../../utils/businessOwnerUtils";
import DashboardInsight from "../../commons/dashboard-insight/dashboardInsight";
import TabSwitcher from "../../commons/tab-switcher/tab-switcher";
import IconInsight from "../../commons/icon-insight/icon-insight";
import {
  formatToThousandRoundedNumber,
  getParsedLocalStorageData,
} from "../../../utils/functions";
import IconSelect from "../../commons/icon-select/IconSelect";
import orderBy from "lodash/orderBy";
import IssueCreditScreen from "./IssueCredit";
import CardsOnFileScreen from "./CardsOnFile";
import {SESSION_ENV_KEY} from "../../../utils/config";
import {ROLES} from "../../../constants";
import {exportCustomerList} from "../../../api/business-owner/customers";
import CommercialCustomerScreen from "./CommercialCustomerScreen";
import Subscriptions from "./Subscriptions";
import {INTERCOM_EVENTS, INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";
import useTrackEvent from "hooks/useTrackEvent";

const customerTabs = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "credits",
    label: "Credits",
  },
  {
    value: "Subscriptions",
    label: "Subscriptions",
  },
];

// Component to show each customer in the list
const CustomerListItem = memo(({data, style, index}) => {
  const {
    customers,
    showInListLoader,
    setActiveCustomer,
    activeCustomerId,
    showHideIssueCreditScreen,
    setIsPopoverOpen,
    showHideCardsOnFileScreen,
    setShowCommercialCustomerScreen,
  } = data;

  if (index === customers.length) {
    if (showInListLoader) {
      return (
        <div className="customer-list-item" style={{...style, ...{borderBottom: "0px"}}}>
          <BlockingLoader />
        </div>
      );
    } else {
      return <div className="customer-list-item" style={style}></div>;
    }
  }

  const customer = customers[index];
  if (!customer) {
    return null;
  }
  return (
    <div
      className={`customer-list-item ${activeCustomerId === customer.id ? "active" : ""}`}
      style={style}
      onClick={() => {
        setActiveCustomer(customer.id);
        showHideIssueCreditScreen(false);
        setIsPopoverOpen(false);
        showHideCardsOnFileScreen(false);
        setShowCommercialCustomerScreen(false);
      }}
    >
      <div className="two-row-text-container">
        <p className="customer-name main-text">{customer.boFullName}</p>
        <p className="customer-email sub-text">{customer.boEmail}</p>
      </div>
      <div className="two-row-text-container phone-container">
        <p className="customer-phone main-text">{customer.boPhoneNumber}</p>
      </div>
    </div>
  );
});

const Customers = (props) => {
  const {
    filteredLocations,
    fetchCustomers,
    customersCurrentPage,
    showInListLoader,
    activeCustomerId,
    fetchInsights,
    fetchCustomerDetailsAndInsights,
    fetchCustomerLanguages,
    fetchReasonsList,
    showHideIssueCreditScreen,
    showIssueCreditScreen,
    handleTabClick,
  } = props;

  const listContainerRef = useRef(null);

  const {trackEvent} = useTrackEvent();

  const [listWidth, setListWidth] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {userId} = useMemo(() => {
    return getParsedLocalStorageData(SESSION_ENV_KEY);
  }, []);

  useEffect(() => {
    fetchCustomers(filteredLocations, 1);
    fetchInsights(filteredLocations);
    fetchReasonsList();
    return () => {
      showHideIssueCreditScreen(false);
      handleTabClick("details");
      props.setSearchInProgress(false);
      props.showHideCardsOnFileScreen(false);
      props.setShowCommercialCustomerScreen(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredLocations,
    fetchCustomers,
    fetchInsights,
    fetchReasonsList,
    showHideIssueCreditScreen,
    handleTabClick,
  ]);

  // Did Mount Hook
  useLayoutEffect(() => {
    setListWidth(listContainerRef.current.clientWidth || 0);
    setListHeight(listContainerRef.current.clientHeight || 0);
    fetchCustomerLanguages();
  }, [fetchCustomerLanguages]);

  useEffect(() => {
    if (customersCurrentPage === 1 && showInListLoader === false) {
      // Can't find a better way to deal with this
      // This code is resets scroll position to top
      // Fixed list provides a method to do this, but we need to grab a ref to the list inorder to use it.
      // Since I am using infinite loader, which takes ref of the list, I couldn't get the ref
      // So falling back to old school way
      let scrollView = document.getElementsByClassName("customer-list")[0];
      if (scrollView) {
        scrollView.scrollTop = 0;
      }
    }
  }, [customersCurrentPage, showInListLoader]);

  // Effect to fetch single customer details on change of selected customer
  useEffect(() => {
    if (activeCustomerId && !showIssueCreditScreen) {
      fetchCustomerDetailsAndInsights(activeCustomerId);
    }
  }, [activeCustomerId, fetchCustomerDetailsAndInsights, showIssueCreditScreen]);

  const createItemData = (
    customers,
    setActiveCustomer,
    showInListLoader,
    activeCustomerId,
    showHideIssueCreditScreen,
    setIsPopoverOpen,
    showHideCardsOnFileScreen,
    setShowCommercialCustomerScreen
  ) => ({
    customers,
    setActiveCustomer,
    showInListLoader,
    activeCustomerId,
    showHideIssueCreditScreen,
    setIsPopoverOpen,
    showHideCardsOnFileScreen,
    setShowCommercialCustomerScreen,
  });

  const generateLanguageOptions = () => {
    if (!props.languages) {
      return [];
    }

    return props.languages.map((lang) => {
      return {value: lang.id, label: lang.language};
    });
  };

  const getActiveCustomerLanguageValue = () => {
    if (!props.activeCustomerDetails?.languageId || !props.languages) {
      return undefined;
    }

    const activeLang = props.languages.find(
      (lang) => lang.id === props.activeCustomerDetails.languageId
    );

    return {
      label: activeLang.language,
      value: activeLang.id,
    };
  };

  /**
   * Download the list of customers at the given locations
   */
  const downloadCustomersList = async () => {
    try {
      const timeZone = momentTz.tz.guess();
      const params = {
        stores: filteredLocations,
        timeZone,
        userId,
      };
      await exportCustomerList(params);
      toast("Your Customers List report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });
      handleIntercomTrackEvent(INTERCOM_EVENTS_TEMPLATES.customers.exportListReport);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIntercomTrackEvent = (template = "", metadata = {}) => {
    trackEvent(INTERCOM_EVENTS.customers, template, metadata);
  };

  //#region render
  const renderLaundromatVisits = (stores) => {
    return stores && stores.length > 0 ? (
      stores.map((store) => {
        return (
          <p
            key={`store-${store.id}`}
            className="data-text"
          >{`${store.address} (${store.visits})`}</p>
        );
      })
    ) : (
      <p className="data-text">No visits yet</p>
    );
  };

  const _render_customer_list = () => {
    if (!props.customers) {
      return null;
    }

    if (
      props.searchInProgress &&
      (props.searchText === "" || props.customers.length === 0)
    ) {
      return (
        <div className="product-list">
          <div key={"No product search results"} className={`common-list-item`}>
            <p style={{fontStyle: "italic"}}>{`No Search Results.`}</p>
          </div>
        </div>
      );
    }

    if (props.customers.length === 0) {
      return (
        <div className="common-list-item" key={"customers-list-no-data"}>
          {props.searchText ? "No Search Results Found" : "No customer records to show"}
        </div>
      );
    }

    return (
      <InfiniteLoader
        isItemLoaded={(index) =>
          !(props.totalCustomers > props.customers?.length) ||
          index < props.customers?.length
        }
        itemCount={
          props.totalCustomers > props.customers?.length
            ? props.customers?.length + 1
            : props.customers?.length
        }
        loadMoreItems={(() => {
          return props.showInListLoader
            ? () => {}
            : () =>
                props.fetchCustomers(
                  props.filteredLocations,
                  Number(props.customersCurrentPage) + 1,
                  props.searchText
                );
        })()}
        threshold={5}
      >
        {({onItemsRendered, ref}) => {
          return (
            <FixedSizeList
              height={listHeight}
              itemCount={
                props.totalCustomers > props.customers?.length
                  ? props.customers?.length + 1
                  : props.customers?.length
              }
              itemSize={67}
              width={listWidth}
              ref={ref}
              onItemsRendered={onItemsRendered}
              itemData={createItemData(
                props.customers,
                props.setActiveCustomer,
                props.showInListLoader,
                props.activeCustomerId,
                showHideIssueCreditScreen,
                setIsPopoverOpen,
                props.showHideCardsOnFileScreen,
                props.setShowCommercialCustomerScreen
              )}
              className="customer-list"
            >
              {CustomerListItem}
            </FixedSizeList>
          );
        }}
      </InfiniteLoader>
    );
  };

  const renderCustomerInfo = () => {
    const selectedCustomer = props.activeCustomerDetails;
    return (
      <>
        <div className="section">
          <div className="insights-container">
            <IconInsight
              icon={dollarIcon}
              value={`$${formatToThousandRoundedNumber(
                selectedCustomer.insights?.totalspend
              )}`}
              description={"Total Spend"}
              className="customer-insight"
            />
            <IconInsight
              icon={basketIcon}
              value={selectedCustomer.insights?.totalOrders || 0}
              description={"Total Orders"}
              className="customer-insight"
            />
            <IconInsight
              icon={calendarIcon}
              value={(() => {
                return selectedCustomer.insights?.lastOrderDate
                  ? momentTz
                      .tz(selectedCustomer.insights?.lastOrderDate, momentTz.tz.guess())
                      .format("MM/DD/YY")
                  : "NA";
              })()}
              description={"Last Order Date"}
              className="customer-insight"
            />
          </div>
        </div>
        <div className="section section-two">
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={personIcon} />
              <TextField
                key={`sec-name-${selectedCustomer.id}${selectedCustomer.name}`}
                isInline={true}
                label="Name"
                className="customer-text-field"
                value={selectedCustomer.boFullName || ""}
                onChange={(e) => {
                  props.handleCustomerDetailChange(
                    selectedCustomer.id,
                    "boFullName",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="section-item">
              <img alt="icon" className="icon" src={emailIcon} />
              <TextField
                key={`sec-email-${selectedCustomer.id}${selectedCustomer.name}`}
                isInline={true}
                label="Email"
                className="customer-text-field"
                value={selectedCustomer.boEmail || ""}
                onChange={(e) => {
                  props.handleCustomerDetailChange(
                    selectedCustomer.id,
                    "boEmail",
                    e.target.value
                  );
                }}
                error={props.customerFieldErrors.boEmail}
              />
            </div>
            <div className="section-item">
              <img alt="icon" src={phoneIcon} className="icon" />
              <TextField
                key={`sec-phone-${selectedCustomer.id}${selectedCustomer.name}`}
                isInline={true}
                label="Phone"
                className="customer-text-field"
                value={selectedCustomer.boPhoneNumber || ""}
                onChange={(e) => {
                  props.handleCustomerDetailChange(
                    selectedCustomer.id,
                    "boPhoneNumber",
                    e.target.value
                  );
                }}
                error={props.customerFieldErrors.boPhoneNumber}
                maxLength={16}
              />
            </div>
          </div>

          <IconSelect
            placeholder="language"
            className="languages-select"
            options={generateLanguageOptions()}
            value={getActiveCustomerLanguageValue()}
            onChange={(selectedOption) => {
              props.handleCustomerDetailChange(
                selectedCustomer.id,
                "languageId",
                selectedOption.value
              );
            }}
            icon={globeIcon}
            isDisabled={props.showLanguagesLoader || !props.languages}
          />
        </div>
        <div className="section last-section">
          <div className="row">
            <div className="section-item icon-section-item">
              <img alt="icon" src={locationIcon} className="icon" />
              <div className="text-container">
                <p className="head-text">Laundromat Visits</p>
                {renderLaundromatVisits(props.activeCustomerDetails?.insights?.stores)}
              </div>
            </div>
            <div className="section-item icon-section-item">
              <img alt="icon" src={basketIcon} className="icon" />
              <div className="text-container">
                <p className="head-text">Last Order</p>
                {selectedCustomer.insights.lastOrderId ? (
                  <p className="data-text">
                    {selectedCustomer.insights.lastOrderId}{" "}
                    <span className="italic">
                      (
                      {selectedCustomer.insights.lastOrderStatus === "COMPLETED"
                        ? "Completed"
                        : selectedCustomer.insights.lastOrderStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Active"}
                      )
                    </span>
                  </p>
                ) : (
                  <p className="data-text">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCustomerCredits = () => {
    const {credits: creditsList, availableCredit} = props.activeCustomerDetails;
    const sortedCreditsList = orderBy(creditsList, ["id"], ["desc"]).filter(
      (credit) => credit.amount >= 0
    );
    const isCreditButtonDisabled =
      getParsedLocalStorageData(SESSION_ENV_KEY)?.roleName === ROLES.manager;

    return (
      <div className="customer-credits-container">
        <div className="customer-credits-header">
          <p className="customer-credits-amount">
            Total available: ${availableCredit?.toFixed(2) || 0}
          </p>
          <button
            className="btn-theme btn-rounded form-save-button"
            onClick={() => {
              showHideIssueCreditScreen(true);
            }}
            disabled={isCreditButtonDisabled}
          >
            ISSUE CREDIT
          </button>
        </div>
        {!!sortedCreditsList.length && (
          <div className="customer-credits-list-container">
            {sortedCreditsList.map((credit) => (
              <div className="customer-credits-list-item">
                <p className="customer-credit-cell bold amount">
                  ${credit.amount.toFixed(2)}
                </p>
                <p className="customer-credit-cell time">
                  {momentTz
                    .tz(credit.issuedDate, momentTz.tz.guess())
                    .format("MM/DD/YYYY")}
                  ,{" "}
                  {momentTz.tz(credit.issuedDate, momentTz.tz.guess()).format("hh:mm A")}
                </p>
                <p className="customer-credit-cell bold reason">{credit.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRightCardContent = () => {
    const {
      activeTab,
      activeCustomerDetails: selectedCustomer,
      activeCustomerId,
      showCardsOnFileScreen,
      showCommercialSettingsCustomerScreen,
    } = props;

    if (!selectedCustomer || !activeCustomerId) {
      return (
        <div className="no-search-results">
          <p>No customer selected</p>
        </div>
      );
    }
    if (showIssueCreditScreen) {
      return (
        <IssueCreditScreen {...props} onIntercomEventTrack={handleIntercomTrackEvent} />
      );
    }

    if (props.searchInProgress) {
      if (props.searchText === "" || props.customers.length === 0) {
        return (
          <div className="no-search-results">
            <p>No Search Results</p>
          </div>
        );
      }
    }

    const getCustomerDetails = () => {
      fetchCustomerDetailsAndInsights(activeCustomerId);
    };

    if (showCardsOnFileScreen) {
      return (
        <CardsOnFileScreen {...props} onIntercomEventTrack={handleIntercomTrackEvent} />
      );
    }

    if (showCommercialSettingsCustomerScreen) {
      return (
        <CommercialCustomerScreen
          {...props}
          refreshCustomerDetails={getCustomerDetails}
          onIntercomEventTrack={handleIntercomTrackEvent}
        />
      );
    }

    return (
      <>
        <div
          className="cents-card-header small-padding customer-info"
          key={`cust-title-${selectedCustomer.id}-${selectedCustomer.phoneNumber}`}
        >
          <div className="commercial-name">
            <p>{selectedCustomer.boFullName}</p>
            {selectedCustomer.isCommercial && (
              <div className="commercial-label">
                <small>Commercial</small>
              </div>
            )}
          </div>
          <div
            className={`three-dot-menu ${isPopoverOpen ? "open" : ""}`}
            id="three-dot-menu-customers"
          />
        </div>
        <UncontrolledPopover
          trigger="legacy"
          placement="bottom-end"
          target="three-dot-menu-customers"
          isOpen={isPopoverOpen}
          toggle={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          <p
            onClick={() => {
              props.showHideCardsOnFileScreen(true);
              setIsPopoverOpen(false);
            }}
          >
            Cards on file
          </p>
          <p
            onClick={() => {
              props.setShowCommercialCustomerScreen(true);
              setIsPopoverOpen(false);
            }}
          >
            Commercial Settings
          </p>
        </UncontrolledPopover>
        <div className="customer-info-content">
          <div className="section tabs-section">
            <TabSwitcher
              tabs={customerTabs}
              activeTab={props.activeTab}
              onTabClick={props.handleTabClick}
            />
          </div>
          <div className="scroll-area">
            {activeTab === "details" ? (
              renderCustomerInfo()
            ) : activeTab === "credits" ? (
              renderCustomerCredits()
            ) : (
              <Subscriptions
                activeCustomerId={activeCustomerId}
                storeIds={props.filteredLocations}
              />
            )}
          </div>
          <div className="footer">
            <img src={personIconBlue} alt="icon" />
            <p>REGISTERED</p>
          </div>
        </div>
      </>
    );
  };
  //#endregion render

  return (
    <ThreeCardLayout
      topCardContent={
        <div className="customers-top-card-content">
          {props.insightsLoading && <BlockingLoader />}

          {props.insightsError ? (
            <div className="error-text">
              Failed to retrieve insights. {props.insightsError}
            </div>
          ) : (
            <>
              <div className="label">Customers</div>
              <DashboardInsight
                value={props.insights?.visitsThisMonth || 0}
                description={"Laundromat visits this month"}
                disableRoundingOff
              />
              <DashboardInsight
                value={props.insights?.newCustomers || 0}
                description={"New customers this month"}
                disableRoundingOff
              />
              <DashboardInsight
                value={props.insights?.orderAverage || 0}
                description={"Average order value this month"}
                prefix={"$"}
              />
            </>
          )}
        </div>
      }
      leftCardContent={
        <>
          <div className="cents-card-header small-padding orders-list-header">
            <p>
              Showing customers in{" "}
              {getLocationString(props.filteredLocations, props.allLocations?.locations)}
            </p>
            <img src={downloadImg} alt="download" onClick={downloadCustomersList} />
          </div>
          <div className="customers-list-content" ref={listContainerRef}>
            {(props.showListLoader || props.reasonsCallInProgress) && <BlockingLoader />}
            <SearchBar
              setSearchInProgress={(value) => {
                props.setSearchInProgress(value);
                if (!value) {
                  props.fetchCustomers(props.filteredLocations, 1);
                }
              }}
              searchInProgress={props.searchInProgress}
              handleSearch={(searchText) => {
                if (props.searchInProgress) {
                  props.handleCustomerSearch(searchText, 1, props.filteredLocations);
                }
              }}
              value={props.searchText}
            />
            {_render_customer_list()}
          </div>
        </>
      }
      rightCardContent={
        props.showDetailsLoader || props.showListLoader ? (
          <BlockingLoader />
        ) : props.detailsError ? (
          <p className="error-text">{props.detailsError}</p>
        ) : (
          renderRightCardContent()
        )
      }
    />
  );
};

export default Customers;
