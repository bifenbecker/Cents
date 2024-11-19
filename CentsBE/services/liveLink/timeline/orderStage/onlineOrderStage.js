const momenttz = require('moment-timezone');

const ServiceOrderStage = require('./serviceOrderStage');

const {
    dateFormat,
    formatDateTimeWindow,
    unixDateFormat,
    dateFormatInRange,
} = require('../../../../helpers/dateFormatHelper');
const { livelinkImageKeys, orderDeliveryStatuses } = require('../../../../constants/constants');

class OnlineOrderStage extends ServiceOrderStage {
    pickupDidNotStart() {
        return this.pickup.status === orderDeliveryStatuses.SCHEDULED;
    }

    didOwnDriverPickupStartWithoutETA() {
        return (
            this.isOwnDriverPickup &&
            this.goingToPickupFromCustomer() &&
            (!this.pickupRouteDeliveryDetails || !this.pickupRouteDeliveryDetails.eta)
        );
    }

    getStageTwoImageKey() {
        if (!this.pickup) {
            return '';
        }

        if (this.pickup.isStandard) {
            switch (true) {
                case this.pickupDidNotStart() || this.didOwnDriverPickupStartWithoutETA():
                    return livelinkImageKeys.STD_PICKUP_SCHEDULED;
                case this.goingToPickupFromCustomer():
                    return livelinkImageKeys.STD_PICKUP_INITIATED;
                case this.pickup.isCompleted ||
                    this.pickup.status === orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF:
                    return livelinkImageKeys.STD_PICKUP_COMPLETED;
                default:
                    return '';
            }
        }
        if (this.pickup.isOnDemand) {
            switch (true) {
                case this.pickup.isScheduled:
                    return livelinkImageKeys.ON_DEMAND_PICKUP_SCHEDULED;
                case this.goingToPickupFromCustomer():
                    return livelinkImageKeys.ON_DEMAND_PICKUP_INITIATED;
                case this.pickup.isCompleted ||
                    this.pickup.status === orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF:
                    return livelinkImageKeys.ON_DEMAND_PICKUP_COMPLETED;
                default:
                    return '';
            }
        }
        return '';
    }

    getStageTwoHeaderDetails() {
        const header = { ...this.getDefaultHeaderOrFooter() };
        if (this.pickupDidNotStart() || this.didOwnDriverPickupStartWithoutETA()) {
            header.name = formatDateTimeWindow(this.pickup.deliveryWindow, this.timeZone, 'hh:mma');
            header.description = dateFormat(
                Number(this.pickup.deliveryWindow[0]),
                this.timeZone,
                'ddd, MMMM Do',
            );
        } else if (this.goingToPickupFromCustomer()) {
            header.name = 'Driver is headed your way';
        } else {
            header.name = 'Picked up';
        }
        return header;
    }

    getStageTwoFooterDetails() {
        const footer = { ...this.getDefaultHeaderOrFooter() };
        if (this.pickupDidNotStart() || this.didOwnDriverPickupStartWithoutETA()) {
            const delayBoundary = momenttz
                .unix(this.pickup.deliveryWindow[1])
                .tz(this.timeZone)
                .subtract(5, 'minutes');
            const currentTime = momenttz().tz(this.timeZone);
            const isDelayed = delayBoundary.isBefore(currentTime);

            if (isDelayed) {
                footer.name = 'Pickup Delayed';
            } else {
                footer.name = 'Pickup Scheduled';
                footer.description = `Latest arrival by ${dateFormatInRange(
                    Number(this.pickup.deliveryWindow[1]),
                    this.timeZone,
                    'hh:mma',
                    true,
                )}`;
            }
        } else if (this.goingToPickupFromCustomer()) {
            if (this.isOwnDriverPickup) {
                footer.name = `${this.pickupDriverDetails.firstname} ${this.pickupDriverDetails.lastname}`;
                footer.description = `Estimated Arrival ${unixDateFormat(
                    this.pickupRouteDeliveryDetails.eta,
                    this.timeZone,
                    'h:mma',
                )}`;
                footer.driverPhoneNumber = this.pickupDriverDetails.phone;
            }
            if (this.isDoorDashPickup) {
                footer.name = this.doorDashDeliveryPickupDriverName;
                footer.description = `Estimated Arrival ${dateFormat(
                    this.doorDashDeliveryPickupTime,
                    this.timeZone,
                    'h:mma',
                )}`;
                footer.driverPhoneNumber = this.doorDashDeliveryPickupDriverPhone;
            }
            footer.subtext = 'Your driver';
        } else {
            footer.name = 'Laundry is en route for processing';
        }
        return footer;
    }

    getStageThreeHeaderDetails() {
        return {
            name: 'Received & Processing',
            description: '',
        };
    }

    getStageThreeFooterDetails() {
        let description;
        if (this.returnMethod === 'DELIVERY' && this.delivery.status === 'INTENT_CREATED') {
            const date = dateFormat(
                Number(this.delivery.deliveryWindow[0]),
                this.timeZone,
                'ddd, MMMM Do',
            );
            description = `Delivery scheduled for ${formatDateTimeWindow(
                this.delivery.deliveryWindow,
                this.timeZone,
                'hh:mma',
            )} ${date}`;
        } else if (!this.returnMethod || this.returnMethod === 'IN_STORE_PICKUP') {
            description = "We'll notify you when your laundry is ready";
        }
        return {
            name: 'Handling your laundry with care',
            description,
        };
    }
}

module.exports = OnlineOrderStage;
