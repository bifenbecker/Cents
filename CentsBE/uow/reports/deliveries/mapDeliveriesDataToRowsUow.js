/**
 * Map the retrieved deliveries report data to proper columns
 *
 * @param {Object} payload
 */
async function mapDeliveriesDataToRows(payload) {
    try {
        const newPayload = payload;
        const { reportData, reportTimeFrame } = newPayload;

        newPayload.reportHeaders = [
            { id: 'Date', title: 'Date' },
            { id: 'Window Name', title: 'Window Name' },
            { id: 'Time', title: 'Time' },
            { id: 'Order Number', title: 'Order Number' },
            {
                id: 'Submitted Time',
                title: 'Submitted Time',
            },
            {
                id: 'Intake Time',
                title: 'Intake Time',
            },
            { id: 'Pickup or Delivery', title: 'Pickup or Delivery' },
            { id: 'Customer Name', title: 'Customer Name' },
            { id: 'Customer Address', title: 'Customer Address' },
            { id: 'Phone Number', title: 'Phone Number' },
            { id: 'Delivery Provider', title: 'Delivery Provider' },
            { id: 'On Demand Cost', title: 'On Demand Cost' },
            { id: 'Own Driver Fee', title: 'Own Driver Fee' },
            { id: 'Subsidy', title: 'Subsidy' },
            { id: 'Customer Paid', title: 'Customer Paid' },
            { id: 'DoorDash Tip (Customer Paid)', title: 'DoorDash Tip (Customer Paid)' },
            { id: 'CA Driver Fee', title: 'CA Driver Fee' },
            { id: 'Delivery Instructions', title: 'Delivery Instructions' },
            { id: 'leave At Door', title: 'leave At Door' },
            { id: 'Status', title: 'Status' },
            { id: 'Location', title: 'Location' },
        ];

        newPayload.finalReportData = reportData;
        newPayload.reportName = `Cents_Deliveries_${reportTimeFrame}.csv`;
        newPayload.reportObjectType = 'object';
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = mapDeliveriesDataToRows;
