require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const isOrderCanBeCanceled = require('../../../utils/isOrderCanBeCanceled');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { statuses } = require('../../../constants/constants');

/**
 * @param {string} status
 * @param {string} orderType
 * @returns {Promise} factory.create returns Promise object
 */
const createServiceOrder = (status, orderType) =>
    factory.create(FN.serviceOrder, {
        orderType,
        status,
    });

const testIsOrderCanBeCanceled = async ({
    expectedResult,
    status = statuses.SUBMITTED,
    orderType = 'SERVICE',
    isFromLiveLink = false,
}) => {
    it(`orderType:${orderType} with status:${status} and isFromLiveLink:${isFromLiveLink} should return ${expectedResult}`, async () => {
        const serviceOrder = await createServiceOrder(status, orderType);
        const canCancel = isOrderCanBeCanceled(serviceOrder, isFromLiveLink);
        expect(canCancel).to.equal(expectedResult);
    });
};

describe('test isOrderCanBeCanceled', () => {
    let isFromLiveLink = false;
    // orderType = SERVICE
    testIsOrderCanBeCanceled({ expectedResult: false });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.READY_FOR_PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.IN_TRANSIT_TO_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.DROPPED_OFF_AT_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        status: statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    // orderType = ONLINE
    testIsOrderCanBeCanceled({ expectedResult: true, orderType: 'ONLINE' });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.READY_FOR_PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.IN_TRANSIT_TO_HUB,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.READY_FOR_INTAKE,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.DRIVER_PICKED_UP_FROM_CUSTOMER,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: true,
        orderType: 'ONLINE',
        status: statuses.DROPPED_OFF_AT_HUB,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.COMPLETED,
    });

    // orderType = ONLINE
    testIsOrderCanBeCanceled({ expectedResult: false, orderType: 'RESIDENTIAL' });

    // When isFromLiveLink = true
    isFromLiveLink = true;
    // orderType = SERVICE
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.READY_FOR_PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.IN_TRANSIT_TO_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.DROPPED_OFF_AT_HUB,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        status: statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
        orderType: 'SERVICE',
        isFromLiveLink,
    });
    // orderType = ONLINE
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.READY_FOR_PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.IN_TRANSIT_TO_HUB,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.READY_FOR_INTAKE,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.DRIVER_PICKED_UP_FROM_CUSTOMER,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
        isFromLiveLink,
    });
    testIsOrderCanBeCanceled({
        expectedResult: false,
        orderType: 'ONLINE',
        status: statuses.DROPPED_OFF_AT_HUB,
        isFromLiveLink,
    });

    // orderType = ANOTHER_TYPE
    it(`should return false when order is not provided`, async () => {
        const canCancel = isOrderCanBeCanceled({
            orderType: 'ANOTHER_TYPE',
            status: statuses.SUBMITTED,
        });
        expect(canCancel).to.equal(false);
    });

    it(`should return false when order is not provided`, async () => {
        const canCancel = isOrderCanBeCanceled();
        expect(canCancel).to.equal(false);
    });
});
