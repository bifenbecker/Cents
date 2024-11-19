const BaseServiceOrderTimeline = require('./baseTimeline');

class StageTwoTimelineBuilder extends BaseServiceOrderTimeline {
    setDeliveryProvider() {
        this.timeline.deliveryProvider = this.pickup ? this.pickup.deliveryProvider : '';
    }

    addStep() {
        this.timeline.step = 2;
    }
}

module.exports = exports = StageTwoTimelineBuilder;
