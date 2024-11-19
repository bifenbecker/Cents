import React, {Component, memo} from "react";
import moment from "moment-timezone";
import ExcelJS from "exceljs/dist/es5/exceljs.browser.js";
import * as FileSaver from "file-saver";
import {FixedSizeList} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import toast from "react-hot-toast";
import {SESSION_ENV_KEY, REACT_APP_LIVE_LINK_URL} from "../../../utils/config";

import * as ordersApi from "../../../api/business-owner/orders";
import Select from "../../commons/select/select";
import DateRangePicker from "../../commons/date-range/date-range";
import calendarSidePanelImg from "../../../assets/images/calendarSidePanel.svg";
import reportTypeImg from "../../../assets/images/reportType.svg";
import orderStatusImg from "../../../assets/images/orderStatus.svg";
import closeImg from "../../../assets/images/close.svg";
import Checkbox from "../../commons/checkbox/checkbox";
import plusIcon from "../../../assets/images/Icon_Add_New_Blue.svg";
import downloadImg from "../../../assets/images/download.svg";

import {Modal, ModalBody} from "reactstrap";
import ThreeCardLayout from "../three-card-layout/three-card-layout";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import RoundedTabSwitcher from "../../commons/rounder-tab-switcher/rounded-tab-switcher";
import OrderDetails from "./order-details";
import {getLocationString} from "../../../utils/businessOwnerUtils";
import SearchBar from "../../commons/expandable-search-bar/expandable-search-bar";
import {formatToThousandRoundedNumber, getParsedLocalStorageData} from "utils/functions";

const OrderExportModalContent = (props) => {
  const reportOptions = [
    {
      label: "(Legacy) Payments by Order",
      value: "PAYMENT_BY_ORDER",
    },
    {
      label: "Sales Report - Detail",
      value: "SALES_DETAILS",
    },
  ];
  const orderStatusOptions = [
    {
      label: "Completed",
      value: "COMPLETED",
    },
    {
      label: "Active",
      value: "ACTIVE",
    },
    {
      label: "Complete & Active",
      value: "COMPLETED_AND_ACTIVE",
    },
  ];
  const isValid = () => {
    let valid = true;
    if (!props.reportType) {
      valid = false;
    } else if (!props.daterange.startDate || !props.daterange.endDate) {
      valid = false;
    } else if (!props.statuses) {
      valid = false;
    }
    return valid;
  };
  const onSubmit = () => {
    if (!isValid()) {
      return null;
    }
    props.downloadReport();
  };
  return (
    <Modal
      isOpen={true}
      toggle={props.onExportClose}
      backdrop="static"
      className="orders-report"
    >
      <ModalBody>
        <div className="export-order-popup-content">
          <div className="close-icon">
            <img alt="icon" src={closeImg} onClick={props.onExportClose} />
          </div>
          <div className="input-row modal-title">
            <span className="title">Select your report</span>
          </div>
          <div className="input-row">
            <img alt="icon" src={reportTypeImg} />
            <Select
              classNamePrefix="locations-dropdown"
              label="Report Type"
              options={reportOptions}
              value={props.reportType}
              isSearchable={false}
              onChange={(val) => props.handleSelectBoxchange("reportType", val)}
            />
          </div>
          <div className="input-row">
            <img alt="icon" src={calendarSidePanelImg} />
            <DateRangePicker
              startDate={props.daterange.startDate}
              endDate={props.daterange.endDate}
              classNamePrefix="locations-dropdown"
              label="Order Date"
              endDateId="endDateId"
              startDateId="startDateId"
              isOutsideRange={(day) => moment().diff(day.startOf("day")) < 0}
              onDatesChange={({startDate, endDate}) =>
                props.handleSelectBoxchange("daterange", {startDate, endDate})
              }
              onFocusChange={props.onDateFocusChange}
              focusedInput={props.focusedInput}
              readOnly={true}
            />
          </div>
          <div className="input-row">
            <img alt="icon" src={orderStatusImg} />
            <Select
              classNamePrefix="locations-dropdown"
              label="Order Status"
              options={orderStatusOptions}
              value={props.statuses}
              isSearchable={false}
              onChange={(val) => props.handleSelectBoxchange("statuses", val)}
            />
          </div>
          <div className="checkbox-input-row">
            <Checkbox
              onChange={() =>
                props.handleAllStoreCheck(
                  "allStoresCheck",
                  props.allStoresCheck ? false : true
                )
              }
              checked={props.allStoresCheck}
            />
            <span className="checkbox-label-padding">Download data for all stores</span>
          </div>
          <button
            className="btn-theme form-save-button"
            disabled={!isValid() || props.downloading}
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {props.downloading ? "Downloading..." : "DOWNLOAD REPORT"}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};
class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openReportModal: false,
      downloading: false,
      reportType: {
        label: "(Legacy) Payments by Order",
        value: "PAYMENT_BY_ORDER",
      },
      statuses: {
        label: "Complete & Active",
        value: "COMPLETED_AND_ACTIVE",
      },
      focusedInput: null,
      daterange: {
        startDate: moment(moment().subtract(30, "days")),
        endDate: moment(),
      },
      allStoresCheck: false,
      listHeight: 0,
      listWidth: 0,
      createNewOrder: false,
      createNewOrderUrl: "",
    };

    this.listContentRef = React.createRef();
  }

  pillTabs = [
    {label: "Active", value: "active"},
    {label: "Complete", value: "completed"},
  ];

  componentDidMount() {
    this.props.fetchOrders({
      stores: this.props.filteredLocations,
      page: 1,
      status: this.props.activeStatus,
    });
    this.props.fetchInsights(this.props.filteredLocations);

    let listHeight = this.listContentRef.current.clientHeight;
    let listWidth = this.listContentRef.current.clientWidth;
    this.setState({
      listHeight: listHeight - 15, //TODO handle changes to height and width on resize
      listWidth,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      (!this.props.searchInProgress &&
        this.props.searchInProgress !== prevProps.searchInProgress) ||
      this.props.filteredLocations !== prevProps.filteredLocations ||
      this.props.activeStatus !== prevProps.activeStatus
    ) {
      this.props.fetchOrders({
        stores: this.props.filteredLocations,
        status: this.props.activeStatus,
        keyword: this.props.searchText || null,
        page: 1,
      });
      this.props.fetchInsights(this.props.filteredLocations);
    }

    if (
      this.props.ordersCurrentPage === 1 &&
      this.props.showListLoader === false &&
      this.props.showListLoader !== prevProps.showListLoader
    ) {
      // Can't find a better way to deal with this
      // This code is resets scroll position to top
      // Fixed list provides a method to do this, but we need to grab a ref to the list inorder to use it.
      // Since I am using infinite loader, which takes ref of the list, I couldn't get the ref
      // So falling back to old school way
      let scrollView = document.getElementsByClassName("orders-list")[0];
      if (scrollView) {
        scrollView.scrollTop = 0;
      }
    }

    if (this.props.activeOrder !== prevProps.activeOrder) {
      this.props.fetchOrderDetails(this.props.activeOrder);
    }
  }

  componentWillUnmount() {
    this.props.resetOrdersData();
  }

  reloadOrder = () => {
    this.props.fetchOrderDetails(this.props.activeOrder);
  };

  mapOrderData = (type) => {
    let formattedOrders = [];
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

    for (let i = 0; i < this.props.orders.length; i++) {
      let orderObj = {};
      let orderTotal =
        type === "datatable"
          ? formatter.format(Number(this.props.orders[i].totalAmount.toFixed(2)))
          : Number(this.props.orders[i].totalAmount.toFixed(2));
      let addOns = this.getAddOns(this.props.orders[i].orderItems);
      let fixedPriceItems =
        addOns === "N"
          ? "--"
          : this.getFixedPriceServices(this.props.orders[i].orderItems);

      orderObj["orderId"] = this.props.orders[i].id;
      orderObj["customerName"] = this.props.orders[i].customerName;
      orderObj["orderTotal"] = orderTotal;
      orderObj["serviceTypeName"] = this.getServiceTypeOfOrder(
        this.props.orders[i].orderItems
      );
      orderObj["totalWeight"] = this.getTotalWeight(this.props.orders[i].orderItems);
      orderObj["fixedPriceServices"] = fixedPriceItems;
      orderObj["date"] = moment(this.props.orders[i].placedAt)
        .tz("America/New_York")
        .format("MM-DD-YYYY hh:mm A z");
      orderObj["orderStatus"] = this.props.orders[i].status;
      orderObj["paymentStatus"] = this.props.orders[i].paymentStatus
        ? this.props.orders[i].paymentStatus
        : "BALANCE_DUE";
      orderObj["employeeCode"] = this.props.orders[i].employeeCode;
      orderObj["paymentProcessor"] =
        this.props.orders[i].paymentStatus === "PAID"
          ? this.getPaymentProcessor(this.props.orders[i].payments)
          : "--";
      orderObj["esdReceiptNumber"] =
        this.props.orders[i].paymentStatus === "PAID"
          ? this.getCashCardReceipt(this.props.orders[i].payments)
          : "--";

      formattedOrders.push(orderObj);
    }

    return formattedOrders;
  };

  getServiceTypeOfOrder = (orderItems) => {
    let serviceType;

    for (let i = 0; i < orderItems.length; i++) {
      if (orderItems[i].category === "PER_POUND") {
        serviceType = orderItems[i].laundryType;
      }
    }

    return serviceType ? serviceType : "--";
  };

  getTotalWeight = (orderItems) => {
    let totalWeight;

    for (let i = 0; i < orderItems.length; i++) {
      if (orderItems[i].category === "PER_POUND") {
        totalWeight = orderItems[i].totalWeight;
      }
    }

    return totalWeight ? totalWeight : 0;
  };

  getAddOns = (orderItems) => {
    let addOnBoolean;

    for (let i = 0; i < orderItems.length; i++) {
      if (orderItems[i].category === "FIXED_PRICE") {
        addOnBoolean = true;
      }
    }

    return addOnBoolean ? "Y" : "N";
  };

  getFixedPriceServices = (orderItems) => {
    let fixedPriceArray = [];

    for (let i = 0; i < orderItems.length; i++) {
      let fixedPriceObj = {};
      if (orderItems[i].category === "FIXED_PRICE") {
        fixedPriceObj[i] = orderItems[i].laundryType;
        fixedPriceArray.push(fixedPriceObj[i]);
      }
    }

    return fixedPriceArray.toString();
  };

  getPaymentProcessor = (payments) => {
    if (payments.length === 0) {
      return "--";
    }

    const index = payments.findIndex(({status}) => status === "succeeded");

    return payments[index].paymentProcessor;
  };

  handleSelectBoxchange = (key, val) => {
    this.setState({[key]: val});
  };

  onDateFocusChange = (fi) => {
    this.setState({focusedInput: fi});
  };

  onExportClick = () => {
    this.setState({
      openReportModal: true,
    });
  };

  createNewOrder = () => {
    const sessionInfo = JSON.parse(localStorage.getItem(SESSION_ENV_KEY));
    const {token, business} = sessionInfo;
    const url =
      REACT_APP_LIVE_LINK_URL + `order/business/${business.id}?access_token=${token}`;
    window.open(url, "_blank", "noopener,noreferrer");
    this.setState({
      ...this.state,
      createNewOrder: true,
      createNewOrderUrl: url,
    });
  };

  handleAllStoreCheck = (key, val) => {
    this.setState({[key]: val});
  };

  onExportClose = () => {
    this.setState({
      openReportModal: false,
      allStoresCheck: false,
      reportType: {
        label: "(Legacy) Payments by Order",
        value: "PAYMENT_BY_ORDER",
      },
      statuses: {
        label: "Complete & Active",
        value: "COMPLETED_AND_ACTIVE",
      },
      daterange: {
        startDate: moment(moment().subtract(30, "days")),
        endDate: moment(),
      },
    });
  };

  getCashCardReceipt = (payments) => {
    if (payments.length === 0) {
      return "--";
    }

    const index = payments.findIndex(({paymentProcessor}) => paymentProcessor === "ESD");

    return index !== -1 ? payments[index].esdReceiptNumber : "--";
  };

  exportToCsv = () => {
    return (
      <button onClick={this.onExportClick} className="btn-theme btn-corner-rounded">
        EXPORT TO EXCEL
      </button>
    );
  };

  downloadReport = async () => {
    const params = {
      ...this.state.daterange,
      status: this.state.statuses ? this.state.statuses.value : null,
      tz: moment.tz.guess(),
      stores: this.props.filteredLocations,
      allStoresCheck: this.state.allStoresCheck,
    };
    const timezone = moment.tz.guess();
    if (params.startDate) {
      params.startDate = moment(params.startDate)
        .startOf("day")
        .utc(timezone)
        .toISOString();
    }
    if (params.endDate) {
      params.endDate = moment(params.endDate).endOf("day").utc(timezone).toISOString();
    }
    if (this.state.reportType.value === "SALES_DETAILS") {
      let localStorageData = getParsedLocalStorageData(SESSION_ENV_KEY);
      params.userId = localStorageData.userId;
    }
    this.setState({
      downloading: true,
    });
    let resp;
    try {
      resp =
        this.state.reportType.value === "PAYMENT_BY_ORDER"
          ? await ordersApi.downloadReport(params)
          : await ordersApi.downloadSalesDetailsReport(params);
    } catch (err) {}

    this.setState({
      downloading: false,
    });
    if (!resp) return;
    if (this.state.reportType.value === "SALES_DETAILS" && resp?.data?.success) {
      toast("Your Sales Detail Report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });
      this.onExportClose();
      return;
    }
    this.onExportClose();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet();
    ws.properties.defaultColWidth = 17;
    ws.getColumn(6).numFmt = "$#,##0.00;[Red]-$#,##0.00";
    resp.data.forEach((a, i) => {
      const row = ws.addRow(a);
      if (i === 0) {
        row.font = {bold: true};
      }
    });
    const buf = await wb.xlsx.writeBuffer();
    FileSaver.saveAs(new Blob([buf]), "Cents_Payments_By_Order_Report.xlsx");
  };

  MiniOrderListItem = memo(({data, style, index}) => {
    const {orders, showInListLoader, handleOrderClick, activeOrder} = data;

    if (index === orders.length) {
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

    const order = orders[index];
    if (!order) {
      return null;
    }
    return (
      <div
        className={`order-short-row-item ${
          activeOrder?.orderId === order.orderId ? "active" : ""
        }`}
        style={style}
        onClick={() => handleOrderClick(order)}
      >
        <div className="two-row-text-container orderNumber">
          <p className="main-text order-id">{order?.orderCodeWithPrefix}</p>
          <p className="sub-text">{`$${order.netOrderTotal?.toFixed(2)}`}</p>
        </div>
        <div className="two-row-text-container">
          <p className="main-text">{order.boFullName || "Guest"}</p>
          <p className="sub-text"></p>
        </div>

        <div className="two-row-text-container">
          <p className="main-text">{order.storeName}</p>
          <p className="sub-text">
            {moment(order.placedAt).format("MM/DD/YYYY hh:mm a")}
          </p>
        </div>
        <div
          className={`canceled-order-alert ${
            order?.status === "CANCELLED" ? "alert-bg" : ""
          }`}
        >
          {order?.status === "CANCELLED" ? "!" : ""}
        </div>
      </div>
    );
  });

  createItemData = (orders, handleOrderClick, showInListLoader, activeOrder) => ({
    orders,
    handleOrderClick,
    showInListLoader,
    activeOrder,
  });

  render() {
    return (
      <>
        {this.state.openReportModal && (
          <OrderExportModalContent
            downloadReport={this.downloadReport}
            onExportClose={this.onExportClose}
            handleSelectBoxchange={this.handleSelectBoxchange}
            onDateFocusChange={this.onDateFocusChange}
            handleAllStoreCheck={this.handleAllStoreCheck}
            {...this.state}
          />
        )}

        <ThreeCardLayout
          topCardContent={
            <div className="orders-top-card-content">
              {this.props.insightsLoading && <BlockingLoader />}
              <div className="label">Orders</div>
              <div className="insight-item">
                <p className="number">{this.props.insights.totalOrders}</p>
                <p className="description">Total orders this month</p>
              </div>
              <div className="insight-item">
                <p className="number">
                  ${formatToThousandRoundedNumber(this.props.insights.totalOrdersValue)}
                </p>
                <p className="description">Total order value this month</p>
              </div>
              <div className="insight-item">
                <p className="number">
                  ${formatToThousandRoundedNumber(this.props.insights.averageOrderValue)}
                </p>
                <p className="description">Average order value this month</p>
              </div>
            </div>
          }
          leftCardContent={
            <>
              {this.props.showListLoader && !this.props.showInListLoader && (
                <BlockingLoader />
              )}
              <div className="cents-card-header small-padding orders-list-header">
                <p>
                  Showing orders in{" "}
                  {getLocationString(
                    this.props.filteredLocations,
                    this.props.allLocations?.locations
                  )}
                </p>
                <div>
                  <img
                    src={plusIcon}
                    style={{paddingRight: 16}}
                    alt="Add New Order"
                    onClick={this.createNewOrder}
                  />
                  <img src={downloadImg} alt="download" onClick={this.onExportClick} />
                </div>
              </div>
              <div className="pills-container order-list-pills">
                <RoundedTabSwitcher
                  roundedTabs={this.pillTabs}
                  activeRoundedTab={this.props.activeStatus}
                  setActiveRoundedTab={this.props.setActivePill}
                  className="orders-status-switcher"
                />
                <SearchBar
                  className="services-list"
                  setSearchInProgress={this.props.setSearchInProgress}
                  searchInProgress={this.props.searchInProgress}
                  handleSearch={(searchText) =>
                    this.props.handleOrderSearch({
                      keyword: searchText || null,
                      status: this.props.activeStatus,
                      stores: this.props.filteredLocations,
                      page: 1,
                    })
                  }
                  value={this.props.searchText}
                  dontSearchOnClose
                />
              </div>
              <div className="orders-list-content" ref={this.listContentRef}>
                {!this.props.showListLoader && this.props.orders.length === 0 ? (
                  <p className="no-orders-text">
                    {this.props.searchText
                      ? "No search results."
                      : "No orders for this location"}
                  </p>
                ) : (
                  <InfiniteLoader
                    isItemLoaded={(index) =>
                      !(this.props.totalOrders > this.props.orders?.length) ||
                      index < this.props.orders?.length
                    }
                    itemCount={
                      this.props.totalOrders > this.props.orders?.length
                        ? this.props.orders?.length + 1
                        : this.props.orders?.length
                    }
                    loadMoreItems={(() => {
                      return this.props.showListLoader
                        ? () => {}
                        : () =>
                            this.props.fetchOrders({
                              keyword: this.props.searchText,
                              stores: this.props.filteredLocations,
                              page: Number(this.props.ordersCurrentPage) + 1,
                              status: this.props.activeStatus,
                            });
                    })()}
                    threshold={4}
                  >
                    {({onItemsRendered, ref}) => {
                      return (
                        <FixedSizeList
                          height={this.state.listHeight}
                          itemCount={
                            this.props.totalOrders > this.props.orders?.length
                              ? this.props.orders?.length + 1
                              : this.props.orders?.length
                          }
                          itemSize={67}
                          width={this.state.listWidth}
                          ref={ref}
                          onItemsRendered={onItemsRendered}
                          itemData={this.createItemData(
                            this.props.orders,
                            this.props.handleOrderClick,
                            this.props.showInListLoader,
                            this.props.activeOrder
                          )}
                          className="orders-list"
                        >
                          {this.MiniOrderListItem}
                        </FixedSizeList>
                      );
                    }}
                  </InfiniteLoader>
                )}
              </div>
            </>
          }
          rightCardContent={
            <OrderDetails
              order={this.props.activeOrderDetails}
              businessSettings={this.props.businessSettings}
              isLoading={
                this.props.detailsLoading ||
                // This loader is entire order list loader and not the infinite search one.
                (!this.props.showInListLoader && this.props.showListLoader)
              }
              error={this.props.activeOrderError}
              hasNoOrdersToDisplay={this.props.orders.length === 0}
              searchText={this.props.searchText}
              setActiveTab={() =>
                this.props.handleOrderSearch({
                  keyword: null,
                  status: "active",
                  stores: this.props.filteredLocations,
                  page: 1,
                })
              }
              reloadOrder={this.reloadOrder}
            />
          }
        />
      </>
    );
  }
}

export default Orders;
