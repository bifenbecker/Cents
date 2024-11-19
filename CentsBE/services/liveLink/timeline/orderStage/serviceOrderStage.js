const BaseOrderStage = require('./baseOrderStage');

const { orderDeliveryStatuses, livelinkImageKeys } = require('../../../../constants/constants');
const {
    dateFormat,
    unixDateFormat,
    formatDateTimeWindow,
    dateFormatInRange,
} = require('../../../../helpers/dateFormatHelper');

class ServiceOrderStage extends BaseOrderStage {
    getStageTwoImageKey() {
        return '';
    }

    getStageTwoHeaderDetails() {
        return this.getDefaultHeaderOrFooter();
    }

    getStageTwoFooterDetails() {
        return this.getDefaultHeaderOrFooter();
    }

    getStageThreeHeaderDetails() {
        return {
            name: 'Processing',
            description: '',
        };
    }

    getStageThreeFooterDetails() {
        return {
            name: 'Handling your laundry with care',
            description:
                this.delivery && this.delivery.status === 'SCHEDULED'
                    ? "We'll notify you when it's on it's way back to you"
                    : "We'll notify you when your laundry is ready",
        };
    }

    deliveryDidNotStart() {
        return [orderDeliveryStatuses.SCHEDULED, orderDeliveryStatuses.INTENT_CREATED].includes(
            this.delivery.status,
        );
    }

    didOwnDeliveryStartWithoutETA() {
        return (
            this.isOwnDriverDelivery &&
            this.deliveryStarted() &&
            !this.deliveryRouteDeliveryDetails.eta
        );
    }

    getStageFourImageKey() {
        if (this.returnMethod === 'DELIVERY') {
            if (this.delivery) {
                return this.isOwnDriverDelivery
                    ? livelinkImageKeys.STD_DELIVERY_IN_PROGRESS
                    : livelinkImageKeys.ON_DEMAND_DELIVERY_IN_PROGRESS;
            }
        }
        return livelinkImageKeys.READY_FOR_CUSTOMER_PICKUP;
    }

    getStageFourHeaderDetails() {
        if (!this.returnMethod || this.returnMethod === 'IN_STORE_PICKUP') {
            return {
                name: 'Ready for pickup in-store',
                description: '',
            };
        }
        if (this.delivery) {
            const header = { ...this.getDefaultHeaderOrFooter() };
            if (this.deliveryDidNotStart() || this.didOwnDeliveryStartWithoutETA()) {
                header.name = formatDateTimeWindow(
                    this.delivery.deliveryWindow,
                    this.timeZone,
                    'hh:mma',
                );
                header.description = dateFormat(
                    Number(this.delivery.deliveryWindow[0]),
                    this.timeZone,
                    'ddd, MMMM Do',
                );
            } else if (this.deliveryStarted()) {
                header.name = 'Driver is headed your way';
            }
            return header;
        }
        return {};
    }

    getStageFourFooterDetails() {
        if (!this.returnMethod || this.returnMethod === 'IN_STORE_PICKUP') {
            return {
                name: 'You can now pickup your order',
                description: `${this.serviceOrder.store.address}, ${this.serviceOrder.store.city}, ${this.serviceOrder.store.state}`,
            };
        }
        if (this.delivery) {
            const footer = { ...this.getDefaultHeaderOrFooter() };
            if (this.deliveryDidNotStart() || this.didOwnDeliveryStartWithoutETA()) {
                footer.name = 'Delivery Scheduled';
                footer.description = `Latest arrival by ${dateFormatInRange(
                    Number(this.delivery.deliveryWindow[1]),
                    this.timeZone || 'America/Los_Angeles',
                    'hh:mma',
                    true,
                )}`;
            } else if (this.deliveryStarted()) {
                if (this.isOwnDriverDelivery) {
                    footer.name = `${this.deliveryDriverDetails.firstname} ${this.deliveryDriverDetails.lastname}`;
                    footer.description = `Estimated Arrival ${unixDateFormat(
                        this.deliveryRouteDeliveryDetails.eta,
                        this.timeZone,
                        'h:mma',
                    )}`;
                    footer.driverPhoneNumber = this.deliveryDriverDetails.phone;
                }
                if (this.isDoorDashDelivery) {
                    footer.name = this.doorDashDeliveryReturnDriverName;
                    footer.description = `Estimated Arrival ${dateFormat(
                        this.doorDashDeliveryReturnTime,
                        this.timeZone,
                        'h:mma',
                    )}`;
                    footer.driverPhoneNumber = this.doorDashDeliveryReturnDriverPhone;
                }
                footer.subtext = 'Your driver';
            }
            return footer;
        }
        return {};
    }

    getStageFiveImageKey() {
        return this.returnMethod === 'DELIVERY'
            ? livelinkImageKeys.DELIVERY_ORDER_COMPLETED
            : livelinkImageKeys.IN_STORE_PICKUP_COMPLETED;
    }

    getStageFiveHeaderDetails() {
        return {
            name: this.returnMethod === 'DELIVERY' ? 'Order Complete' : 'Picked up & complete',
            description: '',
        };
    }

    getStageFiveFooterDetails() {
        return this.returnMethod === 'DELIVERY'
            ? {
                  name: 'Your laundry has been delivered',
                  description: `Delivered ${this.formattedOrderCompletedTime}`,
              }
            : {
                  name: 'Thanks for doing your laundry with us!',
                  description: `Picked up in-store at ${this.formattedOrderCompletedTime}`,
              };
    }
}

module.exports = ServiceOrderStage;
