require('../../../../testHelper');

const { expect } = require('../../../../support/chaiHelper');
const { mockMachineFeatureConfig } = require('../../../../support/machineConfiguartionsHelper');
const { PENNY_MODE } = require('../../../../../constants/constants');
const { mapMachineFeature } = require('../../../../../services/machines/devicesResponseMappers');

describe('services mapMachineFeature function test', () => {
    describe('when LaundryMachineModel, LaundryMachineID, LMID are not defined', () => {
        it('should set default values to LaundryMachineModel', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = {
                LaundryMachineModel: undefined,
                LaundryMachineID: undefined,
                LMID: undefined,
                PennyID,
            };

            const result = mapMachineFeature(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: null,
                    LMID: null,
                    LaundryMachineType: PENNY_MODE.SERIAL,
                    LaundryMachineModel: {
                        Model: null,
                        Washer_enable: null,
                        CycleTime: null,
                    },
                });
        });
    });

    describe('when LaundryMachineModel, LaundryMachineID, LMID are not defined', () => {
        it('should return mapped object', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = mockMachineFeatureConfig({
                PennyID,
            });

            const result = mapMachineFeature(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: machineFeatureMockConfig.LaundryMachineID,
                    LMID: machineFeatureMockConfig.LMID,
                    LaundryMachineType: machineFeatureMockConfig.LaundryMachineType,
                    LaundryMachineModel: machineFeatureMockConfig.LaundryMachineModel,
                });
        });
    });
});