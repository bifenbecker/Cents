const BaseServiceOrderTimeline = require('./baseTimeline');

class StageFiveTimelineBuilder extends BaseServiceOrderTimeline {
    setDeliveryProvider() {
        if (this.returnMethod === 'DELIVERY') {
            this.timeline.deliveryProvider = this.delivery.deliveryProvider;
        }
    }

    addStep() {
        this.timeline.step = 5;
    }
}

module.exports = StageFiveTimelineBuilder;
