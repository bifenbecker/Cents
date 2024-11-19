require('../../../../../testHelper');
const { chai, expect } = require('../../../../../support/chaiHelper');
const WeightLogsBuilder = require('../../../../../../services/orders/builders/weightLog/base');

const previousWeightLog = {
    totalWeight: 'totalWeight',
    chargeableWeight: 'chargeableWeight',
    id: 'id',
    status: 'status',
    step: 'step',
}

const newWeightLog = {
    chargeableWeight: 'chargeableWeight',
    totalWeight: 'totalWeight',
    status: 'status',
}

const employee = {
    id: 'ID',
}

describe('test WeightLogsBuilder', () => {
    let weightLog, addDetailsSpy, compareWeightLogsSpy;

    beforeEach(async () => {
        weightLog = new WeightLogsBuilder(previousWeightLog, newWeightLog, employee);
        addDetailsSpy = chai.spy.on(weightLog, "addDetails");
        compareWeightLogsSpy = chai.spy.on(weightLog, "compareWeightLogs");
    });

    it('should build adjustmentLog', async () => {
        expect(weightLog.previousWeightLog).to.include(previousWeightLog);
        expect(weightLog.newWeightLog).to.include(newWeightLog);
        expect(weightLog.employee).to.include(employee);
    });

    it('should call methods when build called', async () => {
        const buildedWeightLog = weightLog.build();

        expect(buildedWeightLog).to.include(previousWeightLog);
        expect(addDetailsSpy).to.have.been.called();
        expect(compareWeightLogsSpy).to.have.been.called();
    });

    it('test build when previousWeightLog is empty', async () => {
        weightLog = new WeightLogsBuilder({}, newWeightLog, employee);
        const buildedWeightLog = weightLog.build();
        
        expect(weightLog.previousWeightLog).to.be.empty;
        expect(buildedWeightLog).to.include({
            chargeableWeight: previousWeightLog.chargeableWeight,
            totalWeight: previousWeightLog.totalWeight,
            status: previousWeightLog.status,
            teamMemberId: employee.id,
            step: 1
        });
    });

    it('test build when chargeableWeight changed', async () => {
        weightLog = new WeightLogsBuilder(
            previousWeightLog, {
                ...newWeightLog,
                chargeableWeight: 'newWeight',
            },
            employee,
        );
        const buildedWeightLog = weightLog.build();
        
        expect(buildedWeightLog).to.include({
            chargeableWeight: 'newWeight',
            totalWeight: newWeightLog.totalWeight,
            isAdjusted: true,
            adjustedBy: employee.id,
            status: previousWeightLog.status,
            step: previousWeightLog.step,
        });
    });

    it('test build when totalWeight changed and previousWeightLog has only id', async () => {
        weightLog = new WeightLogsBuilder({
                id: previousWeightLog.id,
            }, {
                ...newWeightLog,
                totalWeight: 'newWeight',
            }, employee,
        );
        const buildedWeightLog = weightLog.build();
        
        expect(buildedWeightLog).to.include({
            chargeableWeight: newWeightLog.chargeableWeight,
            totalWeight: 'newWeight',
            isAdjusted: true,
            adjustedBy: employee.id,
            status: newWeightLog.status,
            step: 1,
        });
    });

    it('should build adjustmentLog when employee is null', async () => {
        weightLog = new WeightLogsBuilder(previousWeightLog, newWeightLog, null);

        expect(weightLog.employee).to.be.empty;
        expect(weightLog.previousWeightLog).to.include(previousWeightLog);
        expect(weightLog.newWeightLog).to.include(newWeightLog);
    });
});
