const BaseServiceOrderTimeline = require('./baseTimeline');

class StageFourTimelineBuilder extends BaseServiceOrderTimeline {
    setDeliveryProvider() {
        if (this.returnMethod === 'DELIVERY' || this.serviceOrder.orderType === 'RESIDENTIAL') {
            if (this.delivery) {
                this.timeline.deliveryProvider = this.delivery.deliveryProvider;
            }
        }
    }

    addStep() {
        this.timeline.step = 4;
    }
}

module.exports = exports = StageFourTimelineBuilder;
