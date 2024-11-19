import {withLDConsumer} from "launchdarkly-react-client-sdk";

import React, {useState, useMemo, useEffect, useCallback} from "react";
import moment from "moment-timezone";
import ExcelJS from "exceljs/dist/es5/exceljs.browser.js";
import * as FileSaver from "file-saver";
import Loader from "react-loader-spinner";
import toast from "react-hot-toast";
import useTrackEvent from "../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../constants/intercom-events";

// APIs
import {
  getRevenueBreakdownByPaymentMethod,
  getAppliedPromotionsReport,
  getNewCustomersReport,
  getTeamMemberTotalsReport,
  getTipsPerOrderReport,
  getPayoutsReport,
  getAverageOrdersReport,
  getInventoryCountReport,
  getCashDrawerReport,
  getSalesTaxLiabilityReport,
  getSalesByServiceCategoryReport,
  getSalesByServiceSubCategoryReport,
  getEmailedReport,
  downloadDeliveriesReport,
  downloadSubscriptionsReport,
  getLaborReport,
} from "../../../api/business-owner/reports";
import {
  downloadReport,
  downloadSalesDetailsReport,
} from "../../../api/business-owner/orders";
import {
  fetchTeamMembersList,
  fetchTeamMembersReport,
} from "../../../api/business-owner/teams";
import {fetchTasksReport} from "../../../api/business-owner/taskManager";

// Common components
import Select from "../../commons/select/select";
import DateRangePicker from "../../commons/date-range/date-range";
import Card from "../../commons/card/card";
import MultiSelectWithInput from "../../commons/multi-select-with-input/multi-select-with-input";
import Checkbox from "../../commons/checkbox/checkbox";

// Assets
import CalendarIcon from "../../../assets/images/calendarSidePanel.svg";
import ReportTypeIcon from "../../../assets/images/reportType.svg";
import PersonIcon from "../../../assets/images/person.svg";
import LocationIcon from "../../../assets/images/location.svg";

// utils
import {autoWidth} from "./utils";
import {SESSION_ENV_KEY} from "../../../utils/config";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../constants";
import {
  ORDER_STATUS,
  REPORT_DESCRIPTIONS,
  REPORTS_WITHOUT_LOCATION_DROPDOWN,
  REPORTS_WITH_ORDER_STATUS_CHECKBOXES,
  REPORT_TYPE,
  REPORT_TYPE_OPTIONS,
} from "./constants";

const Reports = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportTypeId, setReportTypeId] = useState(REPORT_TYPE_OPTIONS[0].value);
  const [reportTypeName, setReportTypeName] = useState(REPORT_TYPE_OPTIONS[0].label);
  const [reportTypeObject, setReportTypeObject] = useState(REPORT_TYPE_OPTIONS[0]);
  const [startDate, setStartDate] = useState(moment(moment().subtract(30, "days")));
  const [endDate, setEndDate] = useState(moment());
  const [focusedInput, setFocusedInput] = useState(null);
  const [stores, setStores] = useState(props.filteredLocations);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [includeCompleteOrders, setIncludeCompleteOrders] = useState(true);
  const [includeActiveOrders, setIncludeActiveOrders] = useState(true);
  const [includeVoidedOrders, setIncludeVoidedOrders] = useState(true);
  const [selectedIndividualLocation, setSelectedIndividualLocation] = useState(
    props.allLocations.locations[0].id
  );
  const {trackEvent} = useTrackEvent();

  const session = useMemo(() => {
    return JSON.parse(localStorage.getItem(SESSION_ENV_KEY));
  }, []);

  const userId = useMemo(() => {
    return session?.userId;
  }, [session]);

  const timeZone = useMemo(() => {
    return moment.tz.guess();
  });

  const allLocations = useMemo(() => {
    const locations = props.allLocations.locations;
    return locations.map((location) => ({
      label: location.name,
      value: location.id,
    }));
  });

  useEffect(() => {
    setStores(props.filteredLocations);
  }, [props.filteredLocations]);

  /**
   * Retrieve a list of all team members for a given business
   */
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);

      const teamMembersData = await fetchTeamMembersList();
      const formattedTeamMembers = teamMembersData.data.teamMembers.map((team) => ({
        label: team.fullName,
        value: team.id,
      }));
      setTeamMembers(formattedTeamMembers);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Set the report type values in state
   *
   * @param {Object} selection
   */
  const selectReportType = (selection) => {
    setError(null);
    setReportTypeId(selection.value);
    setReportTypeName(selection.label);
    setReportTypeObject(selection);

    if (selection.value === REPORT_TYPE.TEAM_TIME_CARD_REPORT) {
      return fetchTeamMembers();
    }
  };

  /**
   * Store the selected date range in state
   *
   * @param {Object} range
   */
  const setDateRange = (range) => {
    setStartDate(range.startDate);

    const isSameDay = moment(range.endDate).isSame(moment(), "day");

    if (!isSameDay) {
      setEndDate(range.endDate);
    } else {
      setEndDate(moment());
    }
  };

  /**
   * Change focused input when setting date
   *
   * @param {String} fi
   */
  const onDateFocusChange = (fi) => {
    setFocusedInput(fi);
  };

  /**
   * Generate a timestamp range to be included in report titles
   *
   * @returns {String} range of date
   */
  const formatDateRangeForReportTitle = () => {
    const formattedStartDate = moment(startDate).tz(timeZone).format("MM-DD-YYYY");
    const formattedEndDate = moment(endDate).tz(timeZone).format("MM-DD-YYYY");

    return `${formattedStartDate}-${formattedEndDate}`;
  };

  const formatDateRangeForSalesByCategory = () => {
    const formattedStartDate = moment(startDate).tz(timeZone).format("MM/DD/YY");
    const formattedEndDate = moment(endDate).tz(timeZone).format("MM/DD/YY");

    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  /**
   * Determine whether to show the location dropdown in the reports section
   */
  const showLocationDropdown = () =>
    !REPORTS_WITHOUT_LOCATION_DROPDOWN.includes(reportTypeId);

  /**
   * Map report type selected to the proper function
   */
  const runReport = () => {
    switch (reportTypeId) {
      case REPORT_TYPE.AVG_ORDER_VALUE:
        return generateAverageOrdersReport();
      case REPORT_TYPE.LABOR_REPORT:
        return generateLaborReport();
      case REPORT_TYPE.SALES_BY_PAYMENT_METHOD:
        return generateRevenueBreakdownReport();
      case REPORT_TYPE.NEW_CUSTOMERS:
        return generateNewCustomersReport();
      case REPORT_TYPE.PROMOTIONS_APPLIED:
        return generateAppliedPromotionsReport();
      case REPORT_TYPE.PAYMENTS_BY_ORDER_REPORT:
        return generatePaymentsByOrderReport();
      case REPORT_TYPE.SALES_DETAIL_REPORT:
        return generateSalesDetailReport();
      case REPORT_TYPE.TEAM_MEMBER_TOTALS:
        return generateTeamMemberTotalsReport();
      case REPORT_TYPE.TIPS_PER_ORDER:
        return generateTipsPerOrderReport();
      case REPORT_TYPE.TEAM_TIME_CARD_REPORT:
        return generateTeamTimeCardReport();
      case REPORT_TYPE.TASKS_REPORT:
        return generateTasksReport();
      case REPORT_TYPE.PAYOUTS_BREAKDOWN_REPORT:
        return generatePayoutsReport();
      case REPORT_TYPE.INVENTORY_REPORT:
        return generateInventoryCountReport();
      case REPORT_TYPE.CASH_DRAWER_REPORT:
        return generateCashDrawerReport();
      case REPORT_TYPE.SALES_TAX_REPORT:
        return generateSalesTaxLiabilityReport();
      case REPORT_TYPE.SALES_BY_SERVICE_CATEGORY:
        return generateSalesByServiceCategoryReport();
      case REPORT_TYPE.INVENTORY_SALES_REPORT:
        return generateEmailedReport(reportTypeId);
      case REPORT_TYPE.DELIVERIES:
        return generateDeliveriesReport();
      case REPORT_TYPE.SUBSCRIPTIONS:
        return generateSubscriptionsReport();
      default:
        break;
    }
  };

  /**
   * Determine the proper status param to pass for sales reports;
   */
  const retrieveOrderStatusParams = () => {
    if (includeCompleteOrders && !includeActiveOrders) {
      return ORDER_STATUS.COMPLETED;
    }

    if (!includeCompleteOrders && includeActiveOrders) {
      return ORDER_STATUS.ACTIVE;
    }

    return `${ORDER_STATUS.COMPLETED}_AND_${ORDER_STATUS.ACTIVE}`;
  };

  /**
   * Determine the proper status param to pass for sales detail reports;
   */
  const retrieveSalesDetailOrderStatusParams = () => {
    const statuses = [];

    if (includeCompleteOrders) {
      statuses.push(ORDER_STATUS.COMPLETED);
    }

    if (includeActiveOrders) {
      statuses.push(ORDER_STATUS.ACTIVE);
    }

    if (includeVoidedOrders) {
      statuses.push(ORDER_STATUS.CANCELLED);
    }

    return statuses.join("_AND_");
  };

  /**
   * Retrieve the revenue breakdown report details from the backend
   */
  const generateRevenueBreakdownReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getRevenueBreakdownByPaymentMethod(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Business Name", key: "businessName"},
        {header: "Store Name", key: "storeName"},
        {header: "Cash", key: "cashRevenue"},
        {header: "Credit Card", key: "creditCardRevenue"},
        {header: "Total", key: "totalRevenue"},
        {header: "Cash Card Revenue", key: "cashCardRevenue"},
      ];
      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(4).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(5).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(6).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.revenue.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Revenue_PaymentMethod_Breakdown_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download average order totals for ServiceOrders
   */
  const generateAverageOrdersReport = async () => {
    try {
      setLoading(true);

      const status = retrieveOrderStatusParams();
      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
        status,
      };

      const reportData = await getAverageOrdersReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Store Name", key: "storeName"},
        {header: "Average Service Order Value", key: "serviceOrderTotals"},
        {header: "Average Product Order Value", key: "inventoryOrderTotals"},
      ];
      ws.getColumn(2).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.orders.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Average_Orders_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve the breakdown of new customers across selected stores
   */
  const generateNewCustomersReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getNewCustomersReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Full Name", key: "fullName"},
        {header: "Registration Date", key: "registerDate"},
        {header: "First Visit Amount", key: "firstVisitAmount"},
        {header: "Registration Location", key: "registerLocation"},
      ];
      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.newCustomers.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_New_Customers_Report_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download applied promotions data
   */
  const generateAppliedPromotionsReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getAppliedPromotionsReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Promotion Code", key: "promotionCode"},
        {header: "Promotion Discount Rule", key: "balanceRule"},
        {header: "Number of Uses", key: "promoUses"},
        {header: "Number of Customers", key: "customers"},
        {header: "Total Promotion Value", key: "totalPromotionValue"},
      ];
      ws.getColumn(5).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.promotions.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Applied_Promos_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download the order sales report
   */
  const generatePaymentsByOrderReport = async () => {
    try {
      setLoading(true);

      const status = retrieveOrderStatusParams();
      const params = {
        stores,
        startDate,
        endDate,
        tz: timeZone,
        allStoresCheck: false,
        status,
      };

      const reportData = await downloadReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.getColumn(6).numFmt = "$#,##0.00;[Red]-$#,##0.00";

      reportData.data.forEach((a, i) => {
        const row = ws.addRow(a);
        if (i === 0) {
          row.font = {bold: true};
        }
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Payments_By_Order_Report_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download the detailed order sales report
   */
  const generateSalesDetailReport = async () => {
    try {
      setLoading(true);

      const status = retrieveSalesDetailOrderStatusParams();
      const params = {
        stores,
        startDate,
        endDate,
        tz: timeZone,
        allStoresCheck: false,
        status,
        userId,
      };

      // TODO (pratik): migrate to using generateEmailedReport() function with reportType specified
      await downloadSalesDetailsReport(params);
      toast("Your Sales Detail Report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(error.response.data.error);
    }
  };

  /**
   * Generate report in a background job and email to specified user
   */
  const generateEmailedReport = async (reportType) => {
    try {
      setLoading(true);

      const params = {
        stores: [selectedIndividualLocation.value],
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
        userId,
        reportType,
      };

      await getEmailedReport(params);

      toast("Your report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });
    } catch (error) {
      setError(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retrieve and download applied promotions data
   */
  const generateTeamMemberTotalsReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getTeamMemberTotalsReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Full Name", key: "fullName"},
        {header: "Total Hours Worked", key: "totalHoursWorked"},
        {header: "Total Sales Value", key: "totalSalesValue"},
        {header: "Total Orders Processed", key: "totalOrdersProcessed"},
        {header: "Total Pounds Intaken", key: "totalPoundsIntaken"},
        {header: "Total Pounds Processed", key: "totalPoundsProcessed"},
      ];
      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.teamMembers.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Team_Member_Totals_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download applied promotions data
   */
  const generateTipsPerOrderReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getTipsPerOrderReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Order #", key: "orderCode"},
        {header: "Location", key: "name"},
        {header: "Order Total", key: "netOrderTotal"},
        {header: "Tip Value", key: "tipAmount"},
        {header: "Intake Weight(Pounds)", key: "inTakePounds"},
        {header: "Intake Employee", key: "intakeEmployee"},
        {header: "Washing Employee", key: "washingEmployee"},
        {header: "Drying Employee", key: "dryingEmployee"},
        {header: "Complete Processing Employee", key: "completeProcessingEmployee"},
        {header: "Complete / Pickup Employee", key: "completeEmployee"},
        {header: "Customer", key: "customerName"},
        {header: "Payment Date", key: "paymentDate"},
      ];
      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(4).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};

      reportData.data.tips.forEach((a) => {
        ws.addRow(a);
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Tips_Totals_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download labor data
   */
  const generateLaborReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      await getLaborReport(params);
      toast("Your Cents Labor Report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download the team time card report for selected team members
   */
  const generateTeamTimeCardReport = async () => {
    try {
      setLoading(true);

      const params = {
        team: selectedTeamMembers,
        startDate,
        endDate,
        userTz: timeZone,
      };

      const reportData = await fetchTeamMembersReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;

      reportData.data.forEach((a, i) => {
        const row = ws.addRow(a);
        if (i === 0) {
          row.font = {bold: true};
        }
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Team_Time_Cards_Report_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download the tasks report
   */
  const generateTasksReport = async () => {
    try {
      setLoading(true);

      const params = {
        startDate,
        endDate,
        userTz: timeZone,
      };

      const reportData = await fetchTasksReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;

      reportData.data.forEach((a, i) => {
        const row = ws.addRow(a);
        if (i === 0) {
          row.font = {bold: true};
        }
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Tasks_Report_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download applied promotions data
   */
  const generatePayoutsReport = async () => {
    try {
      setLoading(true);

      const params = {
        startDate,
        endDate,
        timeZone,
        userId,
      };

      await getPayoutsReport(params);
      toast("Your Cents Online Payouts Breakdown has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve and download the inventory count report
   */
  const generateInventoryCountReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const reportData = await getInventoryCountReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();

      reportData.data.inventoryItems.forEach((a, i) => {
        const row = ws.addRow(a);
        if (i === 0) {
          row.font = {bold: true};
        }
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buf]), `Cents_Inventory_Report.xlsx`);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.log(error);
    }
  };

  /**
   * Retrieve the cash drawer breakdown report
   */
  const generateCashDrawerReport = async () => {
    const {flags} = props;
    try {
      setLoading(true);

      const params = {
        stores: [selectedIndividualLocation.value],
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      if (flags.cashDrawerReportBackgroundJob) {
        await generateEmailedReport("cashDrawerReport");
      } else {
        const reportData = await getCashDrawerReport(params);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet();
        ws.columns = [
          {header: "Drawer Start", key: "formattedStartInfo"},
          {header: "Drawer End", key: "formattedEndInfo"},
          {header: "Beginning Cash", key: "startingCashAmount"},
          {header: "Cash Transactions", key: "cashTransaction"},
          {header: "Date", key: "createdAt"},
          {header: "Time", key: "createdAtTime"},
          {header: "Cash In", key: "cashIn"},
          {header: "Cash Out", key: "cashOut"},
          {header: "Employee Name", key: "employeeName"},
          {header: "Expected Ending Cash", key: "expectedInDrawer"},
          {header: "Actual Ending Cash", key: "actualInDrawer"},
        ];
        ws.properties.defaultColWidth = 17;
        ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
        ws.getColumn(7).numFmt = "$#,##0.00;[Red]-$#,##0.00";
        ws.getColumn(8).numFmt = "$#,##0.00;[Red]-$#,##0.00";
        ws.getColumn(10).numFmt = "$#,##0.00;[Red]-$#,##0.00";
        ws.getColumn(11).numFmt = "$#,##0.00;[Red]-$#,##0.00";

        reportData.data.cashDrawerEvents.forEach((event) => {
          ws.addRow({
            formattedStartInfo: event.formattedStartInfo,
            formattedEndInfo: event.formattedEndInfo,
            startingCashAmount: Number(Number(event.startingCashAmount / 100).toFixed(2)),
            cashTransaction: "--",
            createdAt: "---",
            createdAtTime: "---",
            cashIn: "--",
            cashOut: "--",
            employeeName: "--",
            expectedInDrawer: Number(Number(event.expectedInDrawer / 100).toFixed(2)),
            actualInDrawer: Number(Number(event.actualInDrawer / 100).toFixed(2)),
          });
          ws.getRow(1).font = {bold: true};
          ws.addRow(1);

          const cashTransactions = event.cashTransactions;

          cashTransactions.forEach((transaction) => {
            if (transaction.type === "cashOut") {
              ws.addRow({
                formattedStartInfo: "--",
                formattedEndInfo: "--",
                startingCashAmount: "--",
                cashTransaction: `Employee cash ${transaction.cashOutType}: ${
                  transaction.memo ? transaction.memo : ""
                }`,
                createdAt: moment(transaction.createdAt)
                  .tz(timeZone)
                  .format("MM-DD-YYYY"),
                createdAtTime: moment(transaction.createdAt)
                  .tz(timeZone)
                  .format("hh:mm A"),
                cashIn:
                  transaction.cashOutType === "IN"
                    ? Number(Number(transaction.totalCashChanged / 100).toFixed(2))
                    : "--",
                cashOut:
                  transaction.cashOutType === "OUT"
                    ? Number(Number(transaction.totalCashChanged / 100).toFixed(2))
                    : "--",
                employeeName: transaction.employeeName,
                expectedInDrawer: "--",
                actualInDrawer: "--",
              });
            }
            if (transaction.type === "Sale") {
              ws.addRow({
                formattedStartInfo: "--",
                formattedEndInfo: "--",
                startingCashAmount: "--",
                cashTransaction: transaction.type,
                createdAt: moment(transaction.createdAt)
                  .tz(timeZone)
                  .format("MM-DD-YYYY"),
                createdAtTime: moment(transaction.createdAt)
                  .tz(timeZone)
                  .format("hh:mm A"),
                cashIn: Number(Number(transaction.totalAmount).toFixed(2)),
                cashOut: "--",
                employeeName: "--",
                expectedInDrawer: "--",
                actualInDrawer: "--",
              });
            }
          });
        });
        const buf = await wb.xlsx.writeBuffer();
        FileSaver.saveAs(
          new Blob([buf]),
          `Cents_Cash_Drawer_Report_${
            reportData.data.storeName
          }_${formatDateRangeForReportTitle()}.xlsx`
        );
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
    }
  };

  /**
   * Retrieve and download the sales tax liability report
   */
  const generateSalesTaxLiabilityReport = async () => {
    try {
      setLoading(true);

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const formattedStartDate = moment(startDate).tz(timeZone).format("MM-DD");
      const formattedEndDate = moment(endDate).tz(timeZone).format("MM-DD");

      const reportData = await getSalesTaxLiabilityReport(params);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;
      ws.columns = [
        {header: "Tax Rate", key: "taxRate"},
        {header: "Location", key: "storeName"},
        {header: "Total Taxable Product Sales", key: "totalTaxableProducts"},
        {header: "Total Taxable Services", key: "totalTaxableServices"},
        {header: "Tax Amount", key: "totalTaxAmount"},
      ];

      ws.mergeCells("A1", "E1");
      ws.getCell("A1").value = `Date Range - ${formattedStartDate} - ${formattedEndDate}`;
      ws.getCell("A1").alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      ws.getColumn(3).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(4).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getColumn(5).numFmt = "$#,##0.00;[Red]-$#,##0.00";
      ws.getRow(1).font = {bold: true};
      ws.getRow(2).font = {bold: true};
      ws.getRow(2).values = [
        "Tax Rate",
        "Location",
        "Total Taxable Product Sales",
        "Total Taxable Services",
        "Tax Amount",
      ];

      reportData.data.taxRates.forEach((rate) => {
        ws.addRow({
          taxRate: `${rate.taxRateName} (${rate.taxRateRate}%)`,
          storeName: rate.storeName,
          totalTaxableProducts: Number(Number(rate.totalTaxableProducts).toFixed(2)),
          totalTaxableServices: Number(Number(rate.totalTaxableServices).toFixed(2)),
          totalTaxAmount: Number(
            Number(Number(rate.totalProductTaxAmount / 100).toFixed(2)) +
              Number(Number(rate.totalServiceTaxAmount / 100).toFixed(2))
          ),
        });
      });

      autoWidth(ws);
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Salex_Tax_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error.response.data.error);
    }
  };

  /**
   * Retrieve and download the sales tax liability report
   */
  const generateSalesByServiceCategoryReport = async () => {
    const {flags} = props;

    try {
      setLoading(true);
      const status = retrieveOrderStatusParams();

      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
      };

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet();
      ws.properties.defaultColWidth = 17;

      if (flags.cents20) {
        const reportData = await getSalesByServiceSubCategoryReport(params);

        // Title
        const titleCell = "A1";
        ws.mergeCells("A1:C1");
        ws.getCell(
          titleCell
        ).value = `Sales by Category: ${formatDateRangeForSalesByCategory()}`;

        // Table header
        const headerCells = ["B2", "C2", "D2", "E2", "F2"];
        const headerRowNum = 2;
        ws.getRow(headerRowNum).values = [
          "",
          "",
          "Credit Card",
          "Cash Card",
          "Cash",
          "Total",
        ];
        headerCells.forEach((cellKey) => {
          ws.getCell(cellKey).border = {
            bottom: {style: "thin"},
          };
        });

        ws.columns = [
          {key: "category", width: 30},
          {key: "subcategory"},
          {key: "creditCard"},
          {key: "cashCard"},
          {key: "cash"},
          {key: "total"},
        ];
        const {categories} = reportData.data.sales;

        // Custom currency format for valuable cells
        const valueCellFormat =
            '_("$"* # ##0.00_);_("$"* (# ##0.00);_("$"* "-"??_);_(@_)',
          valuableCellsCols = [3, 4, 5, 6],
          totalCol = 6,
          subcategoryCol = 2;

        // Used to calculate totals row
        let firstRowNumber = 0,
          lastRowNumber = 0;

        categories.forEach((category) => {
          const categoryRow = ws.addRow({
            category: category.name,
          });
          lastRowNumber = categoryRow.number;

          categoryRow.getCell(1).font = {
            bold: true,
          };

          category.subcategories.forEach((subcategory) => {
            const subcategoryRow = ws.addRow({
              subcategory:
                subcategory.name === WASH_AND_FOLD_SUBCATEGORY
                  ? "Wash & Fold"
                  : subcategory.name,
              creditCard: subcategory.creditCard,
              cashCard: subcategory.cashCard,
              cash: subcategory.cash,
            });

            subcategoryRow.getCell(totalCol).value = {
              formula: `SUM(C${subcategoryRow.number}:E${subcategoryRow.number})`,
            };

            subcategoryRow.getCell(subcategoryCol).font = {
              bold: true,
            };

            valuableCellsCols.forEach((cellNum) => {
              subcategoryRow.getCell(cellNum).numFmt = valueCellFormat;
            });

            if (!firstRowNumber) {
              firstRowNumber = subcategoryRow.number;
            }
            lastRowNumber = subcategoryRow.number;
          });
        });

        const totalData = {
          creditCard: 0,
          cashCard: 0,
          cash: 0,
          total: 0,
        };

        if (firstRowNumber && lastRowNumber) {
          totalData.creditCard = {
            formula: `SUM(C${firstRowNumber}:C${lastRowNumber})`,
          };
          totalData.cashCard = {
            formula: `SUM(D${firstRowNumber}:D${lastRowNumber})`,
          };
          totalData.cash = {
            formula: `SUM(E${firstRowNumber}:E${lastRowNumber})`,
          };
          totalData.total = {
            formula: `SUM(F${firstRowNumber}:F${lastRowNumber})`,
          };
        }

        const totalRow = ws.addRow({
          category: "TOTAL",
          ...totalData,
        });

        const totalCells = [1, 2, 3, 4, 5, 6];
        totalCells.forEach((num) => {
          const cell = totalRow.getCell(num);
          cell.border = {
            top: {style: "thin"},
          };
          cell.font = {
            bold: true,
          };
        });

        valuableCellsCols.forEach((colNum) => {
          totalRow.getCell(colNum).numFmt = valueCellFormat;
        });
      } else {
        params.status = status;
        const reportData = await getSalesByServiceCategoryReport(params);

        ws.columns = [
          {header: "Category Type", key: "category"},
          {header: "Sales Total", key: "amount"},
        ];
        ws.getColumn(2).numFmt = "$#,##0.00;[Red]-$#,##0.00";
        ws.getRow(1).font = {bold: true};
        ws.addRow({
          category: "Per Pound Services",
          amount: reportData.data.sales.perPoundSales,
        });
        ws.addRow({
          category: "Fixed Price Services",
          amount: reportData.data.sales.fixedPriceSales,
        });
        ws.addRow({
          category: "Products",
          amount: reportData.data.sales.totalProductSales,
        });
        ws.addRow({
          category: "Total",
          amount: reportData.data.sales.totalSales,
        });
        ws.getRow(5).font = {bold: true};
        autoWidth(ws);
      }

      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buf]),
        `Cents_Service_Category_Sales_${formatDateRangeForReportTitle()}.xlsx`
      );

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error?.response?.data?.error);
    }
  };

  /**
   * Retrieve and download Deliveries report
   */
  const generateDeliveriesReport = async () => {
    try {
      setLoading(true);
      const params = {
        stores,
        startDate,
        endDate,
        timeZone,
        allStoresCheck: false,
        userId,
      };
      await downloadDeliveriesReport(params);
      toast("Your Deliveries List Report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retrieve and download Subscriptions report
   */
  const generateSubscriptionsReport = async () => {
    try {
      setLoading(true);
      const params = {
        stores,
        allStoresCheck: false,
        userId,
      };
      await downloadSubscriptionsReport(params);
      toast("Your Subscriptions List Report has been emailed to you!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          minWidth: "500px",
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const determineIsOutSideRange = (day) => {
    return reportTypeId !== REPORT_TYPE.DELIVERIES
      ? moment().diff(day.startOf("day")) < 0
      : null;
  };

  const isVoidedOrdersCheckboxVisible = reportTypeId === REPORT_TYPE.SALES_DETAIL_REPORT;

  const hasAtLeastOneOrderStatusChosen = () => {
    const orderStatuses = [includeActiveOrders, includeCompleteOrders];

    if (reportTypeId === REPORT_TYPE.SALES_DETAIL_REPORT) {
      orderStatuses.push(includeVoidedOrders);
    }

    return orderStatuses.some(Boolean);
  };

  const areOrderStatusCheckboxesVisible =
    REPORTS_WITH_ORDER_STATUS_CHECKBOXES.includes(reportTypeId) ||
    (reportTypeId === REPORT_TYPE.SALES_BY_SERVICE_CATEGORY && !props.flags.cents20);

  const isDownloadReportButtonDisabled =
    areOrderStatusCheckboxesVisible && !hasAtLeastOneOrderStatusChosen();

  const toggleActiveOrdersCheckbox = () => {
    if (isVoidedOrdersCheckboxVisible || !includeActiveOrders || includeCompleteOrders) {
      setIncludeActiveOrders(!includeActiveOrders);
    } else {
      setIncludeCompleteOrders(!includeCompleteOrders);
      setIncludeActiveOrders(!includeActiveOrders);
    }
  };

  const toggleCompletedOrdersCheckbox = () => {
    if (isVoidedOrdersCheckboxVisible || includeActiveOrders || !includeCompleteOrders) {
      setIncludeCompleteOrders(!includeCompleteOrders);
    } else {
      setIncludeActiveOrders(!includeActiveOrders);
      setIncludeCompleteOrders(!includeCompleteOrders);
    }
  };

  const trackIntercomEvent = () => {
    const eventParams = {
      Description: "Download Report Button",
      "Button name": "Download report",
      "Order type": reportTypeObject.label,
    };
    if (reportTypeObject.value === "avgOrderValue") {
      if (includeCompleteOrders && !includeActiveOrders) {
        eventParams["Report status"] = "Complete";
      }
      if (includeActiveOrders && !includeCompleteOrders) {
        eventParams["Report status"] = "Active";
      }
      if (includeCompleteOrders && includeActiveOrders) {
        eventParams["Report status"] = "Complete & Active";
      }
    }

    trackEvent(
      INTERCOM_EVENTS.downloadReport,
      INTERCOM_EVENTS_TEMPLATES.downloadReport,
      eventParams
    );
  };

  const onDownloadClick = () => {
    runReport();
    trackIntercomEvent();
  };

  const toggleVoidedOrdersCheckbox = useCallback(() => {
    setIncludeVoidedOrders(!includeVoidedOrders);
  }, [includeVoidedOrders]);

  return (
    <div className="reports-page-container">
      <Card className={"reports-card"}>
        <div className="card-main-container">
          <div className="header">
            <p className={"main-text"}>Reports</p>
          </div>
          <div className="content">
            <div className="content-column">
              <h4>Choose the type of report you would like to generate:</h4>
            </div>
            <div className="content-column">
              <div className="content-row">
                <img alt="select-report-icon" src={ReportTypeIcon} />
                <Select
                  className="reports-dropdown"
                  label="Report Type"
                  options={REPORT_TYPE_OPTIONS}
                  value={reportTypeObject}
                  isSearchable={true}
                  onChange={(val) => selectReportType(val)}
                />
                <div className="report-description-container">
                  <h4>{reportTypeName} Report</h4>
                  <p>{REPORT_DESCRIPTIONS[reportTypeId]}</p>
                </div>
              </div>
            </div>
            {showLocationDropdown() && (
              <div className="content-column">
                <div className="content-row">
                  <img alt="select-location-icon" src={LocationIcon} />
                  <MultiSelectWithInput
                    itemName={stores.length === 1 ? "Location" : "Locations"}
                    allItemsLabel="All Locations"
                    label="Location(s)"
                    options={allLocations}
                    value={stores}
                    onChange={setStores}
                    className="team-members-dropdown"
                  />
                </div>
              </div>
            )}
            {[
              REPORT_TYPE.INVENTORY_SALES_REPORT,
              REPORT_TYPE.CASH_DRAWER_REPORT,
            ].includes(reportTypeId) && (
              <div className="content-column">
                <div className="content-row">
                  <img alt="select-report-icon" src={LocationIcon} />
                  <Select
                    className="reports-dropdown"
                    label="Location"
                    options={allLocations}
                    value={selectedIndividualLocation}
                    isSearchable={true}
                    onChange={(val) => setSelectedIndividualLocation(val)}
                  />
                </div>
              </div>
            )}
            {![REPORT_TYPE.INVENTORY_REPORT, REPORT_TYPE.SUBSCRIPTIONS].includes(
              reportTypeId
            ) && (
              <div className="content-column">
                <div className="content-row">
                  <img alt="calendar-selection-icon" src={CalendarIcon} />
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    className="reports-dropdown"
                    label="Reporting Period"
                    endDateId="endDateId"
                    startDateId="startDateId"
                    isOutsideRange={determineIsOutSideRange}
                    onDatesChange={({startDate, endDate}) => {
                      setDateRange({startDate, endDate});
                    }}
                    onFocusChange={(change) => {
                      onDateFocusChange(change);
                    }}
                    focusedInput={focusedInput}
                    readOnly
                  />
                </div>
              </div>
            )}
            {reportTypeId === REPORT_TYPE.TEAM_TIME_CARD_REPORT && (
              <div className="content-column">
                <div className="content-row">
                  <img alt="person-icon" src={PersonIcon} />
                  <MultiSelectWithInput
                    itemName={teamMembers.length === 1 ? "Team Member" : "Team Members"}
                    allItemsLabel="All Team Members"
                    label="Team Member"
                    options={teamMembers}
                    value={selectedTeamMembers}
                    onChange={setSelectedTeamMembers}
                    className="team-members-dropdown"
                  />
                </div>
              </div>
            )}
            {areOrderStatusCheckboxesVisible && (
              <>
                <div className="content-column">
                  <h4>Include:</h4>
                </div>
                <div className="content-column" style={{paddingTop: "0px"}}>
                  <div className="content-row">
                    <div className="checkbox-grouping">
                      <Checkbox
                        checked={includeCompleteOrders}
                        onChange={toggleCompletedOrdersCheckbox}
                      />
                      <p>Complete Orders</p>
                    </div>
                    <div className="checkbox-grouping">
                      <Checkbox
                        checked={includeActiveOrders}
                        onChange={toggleActiveOrdersCheckbox}
                      />
                      <p>Active Orders</p>
                    </div>
                    {isVoidedOrdersCheckboxVisible && (
                      <div className="checkbox-grouping">
                        <Checkbox
                          checked={includeVoidedOrders}
                          onChange={toggleVoidedOrdersCheckbox}
                        />
                        <p>Voided Orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="submit-button-container">
              {loading && (
                <Loader type="BallTriangle" color="#3d98ff" height={80} width={80} />
              )}
              {!loading && (
                <button
                  className="btn-theme form-save-button"
                  disabled={isDownloadReportButtonDisabled}
                  onClick={() => !isDownloadReportButtonDisabled && onDownloadClick()}
                >
                  Download Report
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default withLDConsumer()(Reports);
