async function mapSubscriptionsDataToRows(payload) {
    const { subscriptionsList } = payload;
    const newPayload = payload;
    newPayload.reportName = 'Cents_Subscriptions_Report.csv';
    newPayload.reportHeaders = [
        { id: 'customerName', title: 'Customer Name' },
        { id: 'locationName', title: 'Location' },
        { id: 'startedDate', title: 'Start Date' },
        { id: 'deliveryZone', title: 'Delivery Zone (Name)' },
        { id: 'frequency', title: 'Frequency' },
        { id: 'serviceType', title: 'Service Type' },
        { id: 'pickupDay', title: 'Pickup Day (Day of week)' },
        { id: 'pickupWindow', title: 'Pickup Time Window' },
        { id: 'deliveryDay', title: 'Delivery Day (Day of week)' },
        { id: 'deliveryWindow', title: 'Delivery Time Window' },
        { id: 'nextPickup', title: 'Next Scheduled Pickup' },
        { id: 'avgOrderValue', title: 'Average Order Value' },
        { id: 'totalOrdersValue', title: 'Customer Lifetime Order Value' },
    ];
    newPayload.reportObjectType = 'object';
    newPayload.finalReportData = subscriptionsList;
    return newPayload;
}
module.exports = exports = mapSubscriptionsDataToRows;
