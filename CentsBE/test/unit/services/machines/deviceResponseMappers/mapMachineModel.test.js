require('../../../../testHelper');

const { expect } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig } = require('../../../../support/machineConfiguartionsHelper');
const { mapMachineModel } = require('../../../../../services/machines/devicesResponseMappers');

describe('services mapMachineModel function test', () => {
    describe('when necessary fields are not defined', () => {
        it('should set default nullable values to mapped result', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = {
                PennyID,
            };

            const result = mapMachineModel(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: null,
                    LMID: null,
                    LMManufacturer: null,
                    LMControlType: null,
                    LMControlTierModel: null,
                    LMSize: null,
                    LMControlSerial: null,
                    LMSerial: null,
                    LMTierType: null,
                });
        });
    });

    describe('when necessary fields are defined', () => {
        it('should return mapped result', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = mockMachineModelConfig({
                PennyID,
            });

            const result = mapMachineModel(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: machineFeatureMockConfig.LaundryMachineID,
                    LMID: machineFeatureMockConfig.LMID,
                    LMManufacturer: machineFeatureMockConfig.LMManufacturer,
                    LMControlType: machineFeatureMockConfig.LMControlType,
                    LMControlTierModel: machineFeatureMockConfig.LMControlTierModel,
                    LMSize: machineFeatureMockConfig.LMSize,
                    LMControlSerial: machineFeatureMockConfig.LMControlSerial,
                    LMSerial: machineFeatureMockConfig.LMSerial,
                    LMTierType: machineFeatureMockConfig.LMTierType,
                });
        });
    });
});