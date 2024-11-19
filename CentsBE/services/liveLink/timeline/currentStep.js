const { statuses, orderDeliveryStatuses } = require('../../../constants/constants');

class CurrentStep {
    constructor(serviceOrder) {
        this.serviceOrder = serviceOrder;
        this.status = serviceOrder.status;
    }

    isIntakeComplete() {
        return this.serviceOrder.activityLog.find((activity) => {
            if (this.serviceOrder.orderType === 'RESIDENTIAL') {
                return ['READY_FOR_PROCESSING', 'HUB_PROCESSING_ORDER'].includes(activity.status);
            }
            return (
                activity.status === 'READY_FOR_PROCESSING' ||
                activity.status === 'DESIGNATED_FOR_PROCESSING_AT_HUB'
            );
        });
    }

    isStepTwo() {
        return (
            !this.isIntakeComplete() &&
            (([
                statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                statuses.IN_TRANSIT_TO_HUB,
                orderDeliveryStatuses.EN_ROUTE_TO_PICKUP,
                statuses.DROPPED_OFF_AT_HUB,
                statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
                statuses.CANCELLED,
            ].includes(this.status) &&
                this.serviceOrder.orderType === 'RESIDENTIAL') ||
                ([
                    statuses.SUBMITTED,
                    statuses.EN_ROUTE_TO_CUSTOMER,
                    statuses.DRIVER_PICKED_UP_FROM_CUSTOMER,
                    statuses.CANCELLED,
                    orderDeliveryStatuses.EN_ROUTE_TO_PICKUP,
                    statuses.READY_FOR_INTAKE,
                ].includes(this.status) &&
                    this.serviceOrder.orderType === 'ONLINE'))
        );
    }

    isStepThree() {
        return (
            this.isIntakeComplete() &&
            (([
                statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                statuses.IN_TRANSIT_TO_HUB,
                statuses.DROPPED_OFF_AT_HUB,
                statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
                statuses.READY_FOR_PROCESSING,
                statuses.PROCESSING,
                statuses.HUB_PROCESSING_ORDER,
                statuses.HUB_PROCESSING_COMPLETE,
                statuses.IN_TRANSIT_TO_STORE,
                statuses.DROPPED_OFF_AT_STORE,
                statuses.CANCELLED,
            ].includes(this.status) &&
                this.serviceOrder.orderType === 'SERVICE') ||
                ([
                    statuses.READY_FOR_PROCESSING,
                    statuses.DESIGNATED_FOR_PROCESSING_AT_HUB,
                    statuses.IN_TRANSIT_TO_HUB,
                    statuses.DROPPED_OFF_AT_HUB,
                    statuses.PROCESSING,
                    statuses.RECEIVED_AT_HUB_FOR_PROCESSING,
                    statuses.HUB_PROCESSING_ORDER,
                    statuses.HUB_PROCESSING_COMPLETE,
                    statuses.IN_TRANSIT_TO_STORE,
                    statuses.DROPPED_OFF_AT_STORE,
                    statuses.CANCELLED,
                ].includes(this.status) &&
                    this.serviceOrder.orderType === 'ONLINE') ||
                ([
                    statuses.READY_FOR_PROCESSING,
                    statuses.HUB_PROCESSING_ORDER,
                    statuses.HUB_PROCESSING_COMPLETE,
                    statuses.CANCELLED,
                ].includes(this.status) &&
                    this.serviceOrder.orderType === 'RESIDENTIAL'))
        );
    }

    isStepFour() {
        return (
            this.isIntakeComplete() &&
            (([
                statuses.READY_FOR_PICKUP,
                statuses.READY_FOR_DRIVER_PICKUP,
                statuses.EN_ROUTE_TO_CUSTOMER,
            ].includes(this.status) &&
                this.serviceOrder.orderType === 'ONLINE') ||
                ([
                    statuses.READY_FOR_PICKUP,
                    statuses.READY_FOR_DRIVER_PICKUP,
                    statuses.EN_ROUTE_TO_CUSTOMER,
                ].includes(this.status) &&
                    this.serviceOrder.orderType === 'SERVICE') ||
                ([statuses.IN_TRANSIT_TO_STORE].includes(this.status) &&
                    this.serviceOrder.orderType === 'RESIDENTIAL'))
        );
    }

    isStepFive() {
        return (
            this.status === statuses.COMPLETED ||
            (this.status === statuses.DROPPED_OFF_AT_STORE &&
                this.serviceOrder.orderType === 'RESIDENTIAL')
        );
    }

    getStep() {
        if (this.isStepFive()) {
            return 5;
        }

        if (this.isStepFour()) {
            return 4;
        }

        if (this.isStepThree()) {
            return 3;
        }

        if (this.isStepTwo()) {
            return 2;
        }
        return 1;
    }
}
module.exports = exports = CurrentStep;
