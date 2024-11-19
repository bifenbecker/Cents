require('../../../../testHelper');
const moment = require('moment-timezone');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const generateDeliveriesReportDataUow = require('../../../../../uow/reports/deliveries/generateDeliveriesReportDataUow');

const StoreSettings = require('../../../../../models/storeSettings');
const OrderDelivery = require('../../../../../models/orderDelivery');
const RecurringSubscription = require('../../../../../models/recurringSubscription');

const RRuleService = require('../../../../../services/rruleService');

describe('tests generateDeliveriesReportDataUow', () => {
    let business,
        user,
        store,
        store2,
        shift,
        timing,
        storeCustomer,
        storeCustomer2,
        serviceOrder,
        order,
        order2,
        shift2,
        serviceOrder2,
        timing2,
        options;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.create('store', {
            businessId: business.id,
        });
        store2 = await factory.create('store', { businessId: business.id });
        await StoreSettings.query()
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .whereIn('storeId', [store.id, store2.id]);
        shift = await factory.create('shift', {
            name: 'North Beach Morn',
            storeId: store.id,
            type: 'OWN_DELIVERY'
        });
        timing = await factory.create('timing', {
            shiftId: shift.id,
            startTime: 'Tue May 9 2022 7:00:00',
            endTime: 'Tue May 9 2022 10:00:00',
        });
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            firstName: 'James',
            lastName: 'Pooley',
            phoneNumber: '1234567890',
        });
        storeCustomer2 = await factory.create('storeCustomer', {
            storeId: store2.id,
            firstName: 'Wood',
            lastName: 'Jeremy',
            phoneNumber: '9876543210',
        });
        serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
            status: 'COMPLETED',
            orderType: 'ONLINE',
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            orderCode: '5004',
            placedAt: '2020-05-07 16:20:.673073+00',
        });
        order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        serviceOrder2 = await factory.create('serviceOrderWithReturnMethod', {
            status: 'COMPLETED',
            orderType: 'ONLINE',
            storeId: store.id,
            storeCustomerId: storeCustomer2.id,
            orderCode: '5005',
            placedAt: '2020-05-08 16:20:.673073+00',
        });
        order2 = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder2.id,
        });

        shift2 = await factory.create('shift', {
            name: 'South Beach Morn',
            storeId: store.id,
        });
        timing2 = await factory.create('timing', {
            shiftId: shift2.id,
            startTime: 'Tue May 9 2022 10:30:00',
            endTime: 'Tue May 9 2022 15:00:00',
        });
        // May 9th
        await factory.create('orderDelivery', {
            status: 'COMPLETED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: 'OWN_DRIVER',
            deliveryWindow: [1652148000000, 1652151600000],
            timingsId: timing.id,
            address1: '11662 Mayfield Avenue',
            address2: '55G',
            city: 'Los Angeles',
            firstLevelSubdivisionCode: 'CA',
            postalCode: '90049',
            instructions: { leaveAtDoor: true, instructions: 'call upon arrival' },
        });

        // May 11th
        doordashPickup = await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            type: 'PICKUP',
            orderId: order2.id,
            storeId: serviceOrder2.storeId,
            deliveryProvider: 'DOORDASH',
            deliveryWindow: [1652241600000, 1652245200000],
            timingsId: timing2.id,
            totalDeliveryCost: 20,
            subsidyInCents: 500,
            thirdPartyDeliveryCostInCents: 2500,
            address1: '652 North Grand Avenue',
            address2: null,
            city: 'Los Angeles',
            firstLevelSubdivisionCode: 'CA',
            postalCode: '90012',
            courierTip: 2,
        });
        // May 14th
        await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: 'DOORDASH',
            deliveryWindow: [1652493600000, 1652497200000],
            timingsId: timing.id,
            thirdPartyDeliveryCostInCents: 2500,
            address1: '11696 Kiowa ave',
            address2: 'Apt 4b',
            city: 'Los Angeles',
            firstLevelSubdivisionCode: 'CA',
            postalCode: '90049',
        });

        options = {
            startDate: '05-09-2022 00:00:00',
            endDate: '05-11-2022 23:59:59',
            timeZone: 'America/Los_Angeles',
            storeIds: [store.id],
        };
    });

    describe('validate query params', () => {
        it('should fetch deliveries data', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.length).to.be.eql(2);
        });
    });

    it('should verify the report data keys', async () => {
        await factory.create('orderDelivery', {
            status: 'COMPLETED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryWindow: [1652148000000, 1652151600000],
            timingsId: timing.id,
        });

        const result = await generateDeliveriesReportDataUow({ options });
        const expected = [
            'date_with_time',
            'Date',
            'Window Name',
            'Time',
            'Order Number',
            'Submitted Time',
            'Intake Time',
            'Status',
            'Pickup or Delivery',
            'Delivery Provider',
            'Customer Name',
            'Customer Address',
            'Phone Number',
            'leave At Door',
            'Delivery Instructions',
            'Own Driver Fee',
            'On Demand Cost',
            'Subsidy',
            'Customer Paid',
            'DoorDash Tip (Customer Paid)',
            'CA Driver Fee',
            'Location',
        ];
        expect(Object.keys(result.reportData[0])).to.eql(expected);
    });

    it('verify Date column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Date'])).to.eql(['May 09', 'May 10']);
    });

    it('verify window name column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Window Name'])).to.eql([
            'North Beach Morn',
            'South Beach Morn',
        ]);
    });

    describe('verify Time column data', () => {
        it('sort based on date and time', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.map((d) => d['Time'])).to.eql([
                '07:00pm - 08:00pm',
                '09:00pm - 10:00pm',
            ]);
        });
    });

    it('verify Order Number column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Order Number'])).to.eql(['5004', '5005']);
    });

    it('verify Order Submitted Time column data', async () => {
        // Intake activity log entry
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        const result = await generateDeliveriesReportDataUow({ options });
        expect(
            result.reportData.map((d) => d['Submitted Time']),
        ).to.eql(['2020-05-07 09:20am', '2020-05-08 09:20am']);
    });

    it('verify Intake Time column data', async () => {
        // Intake activity log entry
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
            businessId: business.id,
        });
        await factory.create('orderActivityLog', {
            orderId: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            teamMemberId: teamMember.id,
            updatedAt: '2020-05-10 03:35:56.673073+00',
        });
        const result = await generateDeliveriesReportDataUow({ options });
        expect(
            result.reportData.map((d) => d['Intake Time']),
        ).to.eql(['2020-05-09 08:35pm', 'Intake not Complete']);
    });

    it('verify Status column data - exlcude cancelled deliveries', async () => {
        await factory.create('orderDelivery', {
            status: 'CANCELLED',
            orderId: order2.id,
            storeId: serviceOrder2.storeId,
            deliveryProvider: 'ONDEMAND',
            deliveryWindow: [1652241600000, 1652245200000],
            timingsId: timing2.id,
        });
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Status'])).to.eql(['COMPLETED', 'SCHEDULED']);
    });

    it('verify Pickup Or Delivery column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Pickup or Delivery'])).to.eql(['Return', 'Pickup']);
    });

    it('verify Delivery provider column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql([
            'Standard',
            'On Demand',
        ]);
    });

    it('verify Customer Name column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Customer Name'])).to.eql([
            'James Pooley',
            'Wood Jeremy',
        ]);
    });

    it('verify Address column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Customer Address'])).to.eql([
            '11662 Mayfield Avenue\n55G\nLos Angeles,CA\n90049,US',
            '652 North Grand Avenue\nLos Angeles,CA\n90012,US',
        ]);
    });

    it('verify Phonenumber column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Phone Number'])).to.eql([
            '1234567890',
            '9876543210',
        ]);
    });

    it('verify leaveAtDoor column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['leave At Door'])).to.eql(['true', null]);
    });

    it('verify instructions column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Delivery Instructions'])).to.eql([
            'call upon arrival',
            null,
        ]);
    });

    it('verify Own Driver Fee column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Own Driver Fee'])).to.eql(['$20.00', null]);
    });

    describe('verify On Demand Cost column data', () => {
        it('should fetch only for doordash deliveries', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.map((d) => d['On Demand Cost'])).to.eql([null, '$25.00']);
        });
        describe('when thirdPartyDeliveryCostInCents is NULL', () => {
            beforeEach(async () => {
                await OrderDelivery.query()
                    .patch({
                        thirdPartyDeliveryCostInCents: null, // due to code issue
                    })
                    .findById(doordashPickup.id);
            });
            it('should return as 0', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['On Demand Cost'])).to.eql([null, '$0.00']);
            });
        });
    });

    it('verify Subsidy column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['Subsidy'])).to.eql([null, '$5.00']);
    });

    describe('verify Customer Paid column data', () => {
        it('should return only for doordash deliveries', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.map((d) => d['Customer Paid'])).to.eql([null, '$20.00']);
        });
        describe('when subsidy is more than delivery cost', () => {
            beforeEach(async () => {
                await OrderDelivery.query()
                    .patch({
                        subsidyInCents: 3500,
                    })
                    .findById(doordashPickup.id);
            });
            it('should return as 0', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Customer Paid'])).to.eql([null, '$0.00']);
            });
        });
    });

    it('verify DoorDash Tip (Customer Paid) column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['DoorDash Tip (Customer Paid)'])).to.eql([
            null,
            '$2.00',
        ]);
    });

    it('verify CA Driver Fee column data', async () => {
        const serviceOrder3 = await factory.create('serviceOrderWithReturnMethod', {
            status: 'COMPLETED',
            orderType: 'ONLINE',
            storeId: store.id,
            storeCustomerId: storeCustomer2.id,
            orderCode: '5005',
            placedAt: '2020-05-08 16:20:.673073+00',
        });
        const order3 = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder2.id,
        });
        await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order3.id,
            storeId: serviceOrder3.storeId,
            deliveryProvider: 'DOORDASH',
            deliveryWindow: [1652148000000, 1652151600000],
            timingsId: timing.id,
            address1: '400 Broome Street',
            address2: 'C-208',
            city: 'Manhattan',
            firstLevelSubdivisionCode: 'NY',
            postalCode: '10013',
        });
        const result = await generateDeliveriesReportDataUow({ options });
        expect(result.reportData.map((d) => d['CA Driver Fee'])).to.eql([null, null, '$2.00']);
    });

    it('verify location column data', async () => {
        const result = await generateDeliveriesReportDataUow({ options });
        result.reportData.forEach((d) => expect(d['Location']).to.eql(store.name));
    });

    describe('with OWN_DRIVER as delivery provider', () => {
        beforeEach(async () => {
            options = {
                ...options,
                ownDriver: true,
            };
        });
        it('fetch only standard deliveries', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['Standard']);
        });
    });

    describe('with DOORDASH as delivery provider', () => {
        beforeEach(async () => {
            options = {
                ...options,
                doordash: true,
            };
        });
        it('fetch only ondemand deliveries', async () => {
            const result = await generateDeliveriesReportDataUow({ options });
            expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['On Demand']);
        });
    });

    describe('with subscriptions', () => {
        let pickuDate, deliveryDate, pickupDay, returnDay, recurringSubscription;

        describe('when pickup day is greater than today', () => { 
            beforeEach(async () => {
                pickuDate = moment.tz('America/Los_Angeles').add(1, 'day')
                deliveryDate = moment.tz('America/Los_Angeles').add(4, 'days')
                pickupDay = pickuDate.get('day')
                returnDay = deliveryDate.get('day')
                ondemand_shift = await factory.create('shift', {
                    name: 'South Beach Morn',
                    storeId: store.id,
                    type: 'CENTS_DELIVERY'
                });
                const pickupTiming = await factory.create('timing', { shiftId: shift.id, day: pickupDay })
                const returnTiming = await factory.create('timing', { shiftId: ondemand_shift.id, day: returnDay })
                const pickupWindow = [
                    pickuDate
                        .set('hour', 10)
                        .set('minute', 00)
                        .valueOf(),
                    pickuDate
                        .set('hour', 11)
                        .set('minute', 00)
                        .valueOf(),
                ];
    
                const returnWindow = [
                    deliveryDate
                        .set('hour', 11)
                        .set('minute', 00)
                        .valueOf(),
                    deliveryDate
                        .set('hour', 12)
                        .set('minute', 00)
                        .valueOf(),
                ];
                const centsCustomerAddress = await factory.create('centsCustomerAddress', {
                    address1: '399 Drake Avenue',
                    city: 'Monterey',
                    firstLevelSubdivisionCode: 'CA',
                    postalCode: '93940',
                    countryCode: 'US',
                    leaveAtDoor: true,
                    instructions: 'call upon arrival',
                    centsCustomerId: storeCustomer.centsCustomerId,
                });
                recurringSubscription = await factory.create('recurringSubscription', {
                    pickupWindow,
                    returnWindow,
                    pickupTimingsId: pickupTiming.id,
                    returnTimingsId: returnTiming.id,
                    centsCustomerId: storeCustomer.centsCustomerId,
                    centsCustomerAddressId: centsCustomerAddress.id,
                    storeId: store.id,
                    recurringRule: RRuleService.generateRule(
                        1,
                        pickupDay,
                        moment().add(-12, 'day').toDate(),
                    ),
                });
                options.startDate = moment().tz('America/Los_Angeles').format('MM-DD-YYYY HH:mm:ss');
                options.endDate = moment().tz('America/Los_Angeles').add(14, 'days').format('MM-DD-YYYY HH:mm:ss');
                options.futureStartDate = moment().tz('America/Los_Angeles').add(1, 'day').startOf('day').format('MM-DD-YYYY HH:mm:ss');
                options.futureEndDate = moment().tz('America/Los_Angeles').add(14, 'days').endOf('day').format('MM-DD-YYYY HH:mm:ss');
            })
            it('includes deliveries from subscriptions', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['Standard', 'On Demand', 'Standard', 'On Demand']);
                expect(result.reportData.map((d) => d['Pickup or Delivery'])).to.eql(['Pickup', 'Return', 'Pickup', 'Return']);
            });
    
            describe('when skipping next pickup', () => {
                beforeEach(async () => {
                    await RecurringSubscription.query().patch({ cancelledPickupWindows: [pickuDate.valueOf()] }).findById(recurringSubscription.id)
                });
                it('includes exclude pickup and delivery for cancelled day', async () => {
                    const result = await generateDeliveriesReportDataUow({ options });
                    expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['Standard', 'On Demand']);
                    expect(result.reportData.map((d) => d['Pickup or Delivery'])).to.eql(['Pickup', 'Return']);
                    expect(result.reportData.map((d) => d['Date'])).to.eql([
                        pickuDate.add(1, 'week').format('MMM DD'), deliveryDate.add(1, 'week').format('MMM DD')
                    ]);
                });
            })
            it('verify Date column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Date'])).to.eql([pickuDate.format('MMM DD'), deliveryDate.format('MMM DD'),
                pickuDate.add(1, 'week').format('MMM DD'), deliveryDate.add(1, 'week').format('MMM DD')]);
            });
    
            it('verify window name column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Window Name'])).to.eql([
                    'North Beach Morn',
                    'South Beach Morn',
                    'North Beach Morn',
                    'South Beach Morn',
                ]);
            });
    
            describe('verify Time column data', () => {
                it('sort based on date and time', async () => {
                    const result = await generateDeliveriesReportDataUow({ options });
                    expect(result.reportData.map((d) => d['Time'])).to.eql([
                        '10:00am - 11:00am',
                        '11:00am - 12:00pm',
                        '10:00am - 11:00am',
                        '11:00am - 12:00pm',
                    ]);
                });
            });
    
            it('verify Order Number column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Order Number'])).to.eql([
                    'Future Order - No Value Yet',
                    'Future Order - No Value Yet',
                    'Future Order - No Value Yet',
                    'Future Order - No Value Yet',
                ]);
            });
    
            ['Submitted Time', 'Intake Time', 'Status', 'Own Driver Fee',
                'On Demand Cost', 'Subsidy', 'Customer Paid', 'DoorDash Tip (Customer Paid)', 'CA Driver Fee'].forEach((columnName) => {
                    it(`verify ${columnName} column data`, async () => {
                        const result = await generateDeliveriesReportDataUow({ options });
                        expect(result.reportData.map((d) => d[columnName])).to.eql(['--', '--', '--', '--']);
                    });
                });
    
            it('verify Address column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Customer Address'])).to.eql([
                    '399 Drake Avenue\nMonterey,CA\n93940,US',
                    '399 Drake Avenue\nMonterey,CA\n93940,US',
                    '399 Drake Avenue\nMonterey,CA\n93940,US',
                    '399 Drake Avenue\nMonterey,CA\n93940,US',
                ]);
            });
    
            it('verify leaveAtDoor column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['leave At Door'])).to.eql(['true', 'true', 'true', 'true']);
            });
    
            it('verify instructions column data', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Delivery Instructions'])).to.eql([
                    'call upon arrival',
                    'call upon arrival',
                    'call upon arrival',
                    'call upon arrival',
                ]);
            });

            it('verify location column data for future subscriptions', async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                result.reportData.forEach((d) => expect(d['Location']).to.eql(store.name));
            });
    
            describe('with OWN_DRIVER as delivery provider', () => {
                beforeEach(async () => {
                    options = {
                        ...options,
                        ownDriver: true,
                    };
                });
                it('fetch only standard deliveries', async () => {
                    const result = await generateDeliveriesReportDataUow({ options });
                    expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['Standard', 'Standard']);
                });
            });
    
            describe('with DOORDASH as delivery provider', () => {
                beforeEach(async () => {
                    options = {
                        ...options,
                        doordash: true,
                    };
                });
                it('fetch only ondemand deliveries', async () => {
                    const result = await generateDeliveriesReportDataUow({ options });
                    expect(result.reportData.map((d) => d['Delivery Provider'])).to.eql(['On Demand', 'On Demand']);
                });
            });
        })

        describe('when pickup day is today', () => { 
            beforeEach(async () => {
                pickuDate = moment.tz('America/Los_Angeles')
                pickupDay = pickuDate.get('day')
                ondemand_shift = await factory.create('shift', {
                    name: 'South Beach Morn',
                    storeId: store.id,
                    type: 'CENTS_DELIVERY'
                });
                const pickupTiming = await factory.create('timing', { shiftId: shift.id, day: pickupDay })
                const pickupWindow = [
                    pickuDate
                        .set('hour', 10)
                        .set('minute', 00)
                        .valueOf(),
                    pickuDate
                        .set('hour', 11)
                        .set('minute', 00)
                        .valueOf(),
                ];
    
                const centsCustomerAddress = await factory.create('centsCustomerAddress', {
                    address1: '399 Drake Avenue',
                    city: 'Monterey',
                    firstLevelSubdivisionCode: 'CA',
                    postalCode: '93940',
                    countryCode: 'US',
                    leaveAtDoor: true,
                    instructions: 'call upon arrival',
                    centsCustomerId: storeCustomer.centsCustomerId,
                });
                recurringSubscription = await factory.create('recurringSubscription', {
                    pickupWindow,
                    returnWindow: [],
                    pickupTimingsId: pickupTiming.id,
                    returnTimingsId: null,
                    centsCustomerId: storeCustomer.centsCustomerId,
                    centsCustomerAddressId: centsCustomerAddress.id,
                    storeId: store.id,
                    recurringRule: RRuleService.generateRule(
                        1,
                        pickupDay,
                        moment().add(-12, 'day').toDate(),
                    ),
                });
                options.startDate = moment().tz('America/Los_Angeles').format('MM-DD-YYYY HH:mm:ss');
                options.endDate = moment().tz('America/Los_Angeles').add(14, 'days').format('MM-DD-YYYY HH:mm:ss');
                options.futureStartDate = moment().tz('America/Los_Angeles').add(1, 'day').startOf('day').format('MM-DD-YYYY HH:mm:ss');
                options.futureEndDate = moment().tz('America/Los_Angeles').add(14, 'days').endOf('day').format('MM-DD-YYYY HH:mm:ss');
            })

            it("should exclude today's delivery", async () => {
                const result = await generateDeliveriesReportDataUow({ options });
                expect(result.reportData.map((d) => d['Date'])).to.eql([
                    pickuDate.add(1, 'week').format('MMM DD'),
                    pickuDate.add(1, 'week').format('MMM DD')
                ]);
            
            })
        })
    })
});
