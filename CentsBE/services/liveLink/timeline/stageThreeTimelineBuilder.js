const BaseServiceOrderTimeline = require('./baseTimeline');

class StageThreeTimelineBuilder extends BaseServiceOrderTimeline {
    setDeliveryProvider() {
        this.timeline.deliveryProvider = this.pickup ? this.pickup.deliveryProvider : '';
    }

    addStep() {
        this.timeline.step = 3;
    }
}

module.exports = exports = StageThreeTimelineBuilder;
