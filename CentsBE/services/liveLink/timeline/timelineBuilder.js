const StageFiveTimelineBuilder = require('./stageFiveTimelineBuilder');
const StageFourTimelineBuilder = require('./stageFourTimelineBuilder');
const StageThreeTimelineBuilder = require('./stageThreeTimelineBuilder');
const StageTwoTimelineBuilder = require('./stageTwoTimelineBuilder');

const CurrentStep = require('./currentStep');

class TimelineBuilder {
    constructor(serviceOrder) {
        this.serviceOrder = serviceOrder;
    }

    async build() {
        const CurrentTimeLineBuilder = this.currentTimeLineBuilder;
        return new CurrentTimeLineBuilder(this.serviceOrder.id).perform();
    }

    get currentTimeLineBuilder() {
        const currentStep = new CurrentStep(this.serviceOrder).getStep();
        switch (currentStep) {
            case 5:
                return StageFiveTimelineBuilder;
            case 4:
                return StageFourTimelineBuilder;
            case 3:
                return StageThreeTimelineBuilder;
            default:
                return StageTwoTimelineBuilder;
        }
    }
}

module.exports = exports = TimelineBuilder;
