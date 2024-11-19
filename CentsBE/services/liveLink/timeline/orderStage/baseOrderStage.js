const { livelinkImageKeys, orderDeliveryStatuses } = require('../../../../constants/constants');
const { dateFormat } = require('../../../../helpers/dateFormatHelper');

const getDoorDashDeliveryDetails = require('../../../../uow/doorDash/getDoorDashDeliveryDetails');

class BaseOrderStage {
    constructor(serviceOrder, stage = 2) {
        this.serviceOrder = serviceOrder;
        this.stage = stage;
    }

    goingToPickupFromCustomer() {
        return this.pickup && this.pickup.status === orderDeliveryStatuses.EN_ROUTE_TO_PICKUP;
    }

    deliveryStarted() {
        return (
            this.delivery &&
            [
                orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF,
                orderDeliveryStatuses.EN_ROUTE_TO_PICKUP,
            ].includes(this.delivery.status)
        );
    }

    async setupThirdPartyDetails() {
        if (
            this.pickup &&
            this.pickup.isOnDemand &&
            this.stage === 2 &&
            this.goingToPickupFromCustomer()
        ) {
            await this.setDoorDashDeliveryPickupDetails();
        }
        if (
            this.delivery &&
            this.delivery.isOnDemand &&
            this.stage === 4 &&
            this.deliveryStarted()
        ) {
            await this.setDoorDashDeliveryReturnDetails();
        }
    }

    async setDoorDashDeliveryPickupDetails() {
        const { doorDashDelivery } = await getDoorDashDeliveryDetails({ id: this.pickup.id });
        this.doorDashDeliveryPickupTime = doorDashDelivery.estimated_pickup_time || '';
        this.doorDashDeliveryPickupDriverName = doorDashDelivery.dasher
            ? `${doorDashDelivery.dasher.first_name} ${doorDashDelivery.dasher.last_name}`
            : 'Driver';
        this.doorDashDeliveryPickupDriverPhone = doorDashDelivery.dasher?.phone_number;
    }

    async setDoorDashDeliveryReturnDetails() {
        const { doorDashDelivery } = await getDoorDashDeliveryDetails({ id: this.delivery.id });
        this.doorDashDeliveryReturnTime = doorDashDelivery.estimated_pickup_time || '';
        this.doorDashDeliveryReturnDriverName = doorDashDelivery.dasher
            ? `${doorDashDelivery.dasher.first_name} ${doorDashDelivery.dasher.last_name}`
            : 'Driver';
        this.doorDashDeliveryReturnDriverPhone = doorDashDelivery.dasher?.phone_number;
    }

    getImageKey() {
        switch (this.stage) {
            case 2:
                return this.getStageTwoImageKey();
            case 3:
                return this.getStageThreeImageKey();
            case 4:
                return this.getStageFourImageKey();
            case 5:
                return this.getStageFiveImageKey();
            default:
                return '';
        }
    }

    getHeaderDetails() {
        switch (this.stage) {
            case 2:
                return this.getStageTwoHeaderDetails();
            case 3:
                return this.getStageThreeHeaderDetails();
            case 4:
                return this.getStageFourHeaderDetails();
            case 5:
                return this.getStageFiveHeaderDetails();
            default:
                return this.getDefaultHeaderOrFooter();
        }
    }

    getFooterDetails() {
        switch (this.stage) {
            case 2:
                return this.getStageTwoFooterDetails();
            case 3:
                return this.getStageThreeFooterDetails();
            case 4:
                return this.getStageFourFooterDetails();
            case 5:
                return this.getStageFiveFooterDetails();
            default:
                return this.getDefaultFooterOrFooter();
        }
    }

    getStageThreeImageKey() {
        return livelinkImageKeys.PROCESSING;
    }

    getDefaultHeaderOrFooter() {
        return {
            name: '',
            description: '',
        };
    }

    get formattedOrderCompletedTime() {
        return dateFormat(this.serviceOrder.completedAt, this.timeZone, 'hh:mma, ddd, MMMM Do');
    }

    get timeZone() {
        return this.serviceOrder.store.settings.timeZone || 'America/Los_Angeles';
    }

    get pickup() {
        return this.serviceOrder.order ? this.serviceOrder.order.pickup || null : null;
    }

    get delivery() {
        return this.serviceOrder.order ? this.serviceOrder.order.delivery || null : null;
    }

    get deliveryRouteDeliveryDetails() {
        return this.delivery.routeDelivery[0];
    }

    get pickupRouteDeliveryDetails() {
        return this.pickup.routeDelivery[0];
    }

    get isDoorDashPickup() {
        return this.pickup && this.pickup.deliveryProvider === 'DOORDASH';
    }

    get isDoorDashDelivery() {
        return this.delivery && this.delivery.deliveryProvider === 'DOORDASH';
    }

    get isOwnDriverPickup() {
        return this.pickup && this.pickup.deliveryProvider === 'OWN_DRIVER';
    }

    get isOwnDriverDelivery() {
        return this.delivery && this.delivery.deliveryProvider === 'OWN_DRIVER';
    }

    get deliveryDriverDetails() {
        return this.delivery.routeDelivery[0].route.driver.user;
    }

    get pickupDriverDetails() {
        return this.pickup.routeDelivery[0].route.driver.user;
    }

    get storeRouteDelivery() {
        return this.serviceOrder.serviceOrderRouteDeliveries[0].routeDelivery;
    }

    get storeRouteDeliveryDriver() {
        return this.serviceOrder.serviceOrderRouteDeliveries[0].routeDelivery.route.driver.user;
    }

    get returnMethod() {
        if (this.serviceOrder.returnMethod) {
            if (this.serviceOrder.returnMethod === 'DELIVERY' && !this.delivery) {
                return 'IN_STORE_PICKUP';
            }
            if (this.serviceOrder.returnMethod === 'DELIVERY' && this.delivery) {
                return this.serviceOrder.returnMethod;
            }
            return this.serviceOrder.returnMethod;
        }
        if (!this.serviceOrder.returnMethod && !this.delivery) {
            return 'IN_STORE_PICKUP';
        }

        return 'DELIVERY';
    }
}

module.exports = BaseOrderStage;
