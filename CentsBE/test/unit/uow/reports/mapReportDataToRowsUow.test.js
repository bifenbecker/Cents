require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');

const abstractCsvReport = require('../../../../uow/reports/abstractCsvReport');
const mapReportDataToRowsUow = require('../../../../uow/reports/mapReportDataToRowsUow');
const sinon = require('sinon');

describe('test mapReportDataToRowsUow', () => {
    it('should contain formatted columns', () => {
        // arrange
        const testReportName = 'reportName';
        const testTimeFrame = 'timeFrame';
        const testReportHeaders = [
            {
                title: 'Name',
                id: 'name',
            },
            {
                title: 'Value',
                id: 'value',
            },
        ];
        const testReportObjectType = 'objectType';
        const testReportData = { key: 'value' };
        const reportDefinition = sinon.createStubInstance(abstractCsvReport, {
            getReportName: testReportName,
            getReportTimeFrame: testTimeFrame,
            getReportHeaders: testReportHeaders,
            mapReportDataToRows: testReportData,
            getReportObjectType: testReportObjectType,
        });

        const payload = {
            reportDefinition,
            reportData: testReportData,
            options: { timeZone: 'America/Los_Angeles' },
        };

        // act
        const res = mapReportDataToRowsUow(payload);

        // assert
        expect(res).to.have.a.property('reportName', `${testReportName}_${testTimeFrame}.csv`);
        expect(res).to.have.a.property('reportHeaders', testReportHeaders);
        expect(res).to.have.a.property('finalReportData', testReportData);
        expect(res).to.have.a.property('reportObjectType', testReportObjectType);
    });
});
