require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const mapSubscriptionsDataToRows = require('../../../../../uow/reports/subscriptionsList/mapSubscriptionsDataToRows');

describe('test mapSubscriptionsDataToRows Uow', () => {
    const payload = {};
    beforeEach(async () => {
        payload.subscriptionsList = [
            {
                customerName: 'test cents',
                locationName: 'cents store',
                startedDate: '05/23/2022',
                deliveryZone: 'North east',
                frequency: '2 Weeks',
                serviceType: 'Wash and Fold',
                pickupDay: 'Monday',
                pickupWindow: '04:00 AM - 06:00 AM',
                deliveryDay: 'Friday',
                deliveryWindow: '06:00 PM - 08:00 AM',
                nextPickup: '06/06/2022',
                avgOrderValue: '$10.00',
                totalOrdersValue: '$10.00',
            },
        ];
    });
    it('should return reportName in the paylaod', async () => {
        const data = await mapSubscriptionsDataToRows(payload);
        expect(data).to.have.property('reportName').to.equal('Cents_Subscriptions_Report.csv');
    });

    it('should return reportObjectType in the payload', async () => {
        const data = await mapSubscriptionsDataToRows(payload);
        expect(data).to.have.property('reportObjectType').to.equal('object');
    });

    it('should return reportHeaders in the payload', async () => {
        const data = await mapSubscriptionsDataToRows(payload);
        expect(data).to.have.property('reportHeaders').to.be.an('array');
        const expectedkeys = [
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
        expect(data.reportHeaders).to.eql(expectedkeys);
    });
});
