const BaseOrderStage = require('./baseOrderStage');

const {
    statuses,
    routeDeliveryStatuses,
    livelinkImageKeys,
} = require('../../../../constants/constants');
const { dateFormat, dateFormatInRange } = require('../../../../helpers/dateFormatHelper');

class ResidentialOrderStage extends BaseOrderStage {
    // Stage 2:

    getStageTwoImageKey() {
        switch (this.serviceOrder.status) {
            case this.serviceOrder.status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB:
                return livelinkImageKeys.STD_PICKUP_SCHEDULED;
            // Previously STD_PICKUP_INITIATED for IN_TRANSIT_TO_HUB
            case this.serviceOrder.status === statuses.IN_TRANSIT_TO_HUB:
            case this.serviceOrder.status === statuses.DROPPED_OFF_AT_HUB:
            case this.serviceOrder.status === statuses.RECEIVED_AT_HUB_FOR_PROCESSING:
                return livelinkImageKeys.STD_PICKUP_COMPLETED;
            default:
                return '';
        }
    }

    getStageTwoHeaderDetails() {
        const header = { ...this.getDefaultHeaderOrFooter() };
        // Header Name.
        if (this.serviceOrder.status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB) {
            header.name = 'Order Submitted';
        } else if (
            [
                statuses.IN_TRANSIT_TO_HUB,
                statuses.DROPPED_OFF_AT_HUB,
                statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
            ].includes(this.serviceOrder.status)
        ) {
            header.name = 'Picked up';
        }
        // No Header Description.
        return header;
    }

    getStageTwoFooterDetails() {
        const footer = { ...this.getDefaultHeaderOrFooter() };

        // Footer Name.
        if (this.serviceOrder.status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB) {
            footer.name = "Your order's in!";
        } else if (
            [
                statuses.IN_TRANSIT_TO_HUB,
                statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
                statuses.DROPPED_OFF_AT_HUB,
            ].includes(this.serviceOrder.status)
        ) {
            footer.name = 'Laundry is en route for processing';
        }

        // Footer Description
        if (this.serviceOrder.status === statuses.DESIGNATED_FOR_PROCESSING_AT_HUB) {
            footer.description = `${dateFormat(
                this.serviceOrder.createdAt,
                this.timeZone,
                'hh:mma, ddd, MMMM Do',
            )}`;
        } else if (
            this.serviceOrder.status === statuses.IN_TRANSIT_TO_HUB &&
            this.storeRouteDelivery.status === routeDeliveryStatuses.ASSIGNED
        ) {
            footer.description = `Latest arrival by ${dateFormatInRange(
                this.storeRouteDelivery.route.timing.endTime,
                this.timeZone,
                'hh:mma',
                true,
            )}`;
        }
        return footer;
    }

    // Stage 3:

    getStageThreeHeaderDetails() {
        return { name: 'Received & Processing', description: '' };
    }

    getStageThreeFooterDetails() {
        return {
            name: 'Handling your laundry with care',
            description: "We'll notify you when it's on it's way back to you",
        };
    }

    // Stage 4:
    // details will remain the same as 3rd since we are not showing driver details and ETA for now.

    getStageFourImageKey() {
        //  // Previous Code:
        // return livelinkImageKeys.STD_DELIVERY_IN_PROGRESS;
        this.getStageThreeImageKey();
    }

    getStageFourHeaderDetails() {
        //  // Previous Code:
        // const header = {};
        // header.name = `${unixDateFormat(this.storeRouteDelivery.eta, this.timeZone, 'hh:mma')}`;
        // header.description = `${unixDateFormat(
        //     this.storeRouteDelivery.eta,
        //     this.timeZone,
        //     'ddd, MMMM Do',
        // )}`;
        // return header;
        return this.getStageThreeHeaderDetails();
    }

    getStageFourFooterDetails() {
        //  // Previous Code:
        // const footer = {};
        // footer.name = `${this.storeRouteDeliveryDriver.firstname} ${this.storeRouteDeliveryDriver.lastname} is heading your way`;
        // footer.description = `Latest arrival by ${dateFormatInRange(
        //     this.storeRouteDelivery.route.timing.endTime,
        //     this.timeZone,
        //     'hh:mma',
        //     true,
        // )}`;
        // return footer;
        return this.getStageThreeFooterDetails();
    }

    // Stage 5:

    getStageFiveImageKey() {
        return livelinkImageKeys.DELIVERY_ORDER_COMPLETED;
    }

    getStageFiveHeaderDetails() {
        return { name: 'Order Complete', description: '' };
    }

    getStageFiveFooterDetails() {
        return {
            name: 'Your laundry has been delivered',
            description: `Delivered ${this.formattedOrderCompletedTime}`,
        };
    }
}

module.exports = ResidentialOrderStage;
