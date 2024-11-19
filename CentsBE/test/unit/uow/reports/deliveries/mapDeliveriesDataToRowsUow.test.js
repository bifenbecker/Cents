require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const mapDeliveriesDataToRowsUow = require('../../../../../uow/reports/deliveries/mapDeliveriesDataToRowsUow');

describe('tests mapDeliveriesDataToRowsUow', () => {
    let payload;
    beforeEach(async () => {
        payload = {
            reportTimeFrame: '05-09-2022-05-11-2022',
            reportData: [
                {
                    Date: 'Apr 21',
                    'Window Name': 'Window 1',
                    Time: '11:30pm - 11:45pm',
                    'Order Number': '1997',
                    'Submitted Time': '2022-04-20 1:04 PM',
                    'Intake Time': '2022-04-20 4:04 PM',
                    'Pickup or Delivery': 'Pickup',
                    'Customer Name': 'Sai Kiran Reddy Kudumula',
                    'Customer Address': '2020 Broadway, Manhattan,NY,10023,US',
                    'Phone Number': '9994250755',
                    'Delivery Provider': 'Standard',
                    'Own Driver Fee': '$2.00',
                    Status: 'INTENT_CREATED',
                    Location: 'Some Location',
                },
            ],
        };
    });

    it('should set report data as finalReportData', async () => {
        const result = await mapDeliveriesDataToRowsUow(payload);
        expect(result.finalReportData).to.be.eql(payload.reportData);
    });
    it('should include time frame in report title', async () => {
        const result = await mapDeliveriesDataToRowsUow(payload);
        expect(result.reportName).to.be.eql('Cents_Deliveries_05-09-2022-05-11-2022.csv');
    });

    it('should set reportObjectType as object', async () => {
        const result = await mapDeliveriesDataToRowsUow(payload);
        expect(result.reportObjectType).to.be.eql('object');
    });

    it('should set headers', async () => {
        const result = await mapDeliveriesDataToRowsUow(payload);
        const expected = [
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
            { id: 'Location', title: 'Location' }
        ];
        expect(result.reportHeaders).to.be.eql(expected);
    });
});
