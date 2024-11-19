require('../../../../testHelper');

const { expect } = require('../../../../support/chaiHelper');
const { mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { mapMachineProgramming } = require('../../../../../services/machines/devicesResponseMappers');

describe('services mapMachineProgramming function test', () => {
    describe('when necessary fields are not defined', () => {
        it('should set default nullable values to mapped result', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = {
                PennyID,
            };

            const result = mapMachineProgramming(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: null,
                    LMID: null,
                    MachineType: null,
                    MachineModel: null,
                    DeviceName: null,
                    DeviceLocation: null,
                    MachineVendPrices: {
                        BaseCyclePrices: null,
                        ModifierCyclePrices: null,
                    },
                    TopoffData: {
                        TopOff_price: null,
                        TopOff_Time: null,
                    },
                    TopoffData_fullCycle: {
                        TopOff_price: null,
                        TopOff_Time: null,
                    },
                });
        });
    });

    describe('when necessary fields are defined', () => {
        it('should return mapped result', async () => {
            const PennyID = '00:00:00:00'
            const machineFeatureMockConfig = mockMachineProgrammingWasherConfig({
                PennyID,
            });

            const result = mapMachineProgramming(machineFeatureMockConfig);

            expect(result)
                .to
                .deep
                .equal({
                    PennyID,
                    LaundryMachineID: machineFeatureMockConfig.LaundryMachineID,
                    LMID: machineFeatureMockConfig.LMID,
                    MachineType: machineFeatureMockConfig.MachineType,
                    MachineModel: machineFeatureMockConfig.MachineModel,
                    DeviceName: machineFeatureMockConfig.DeviceName,
                    DeviceLocation: machineFeatureMockConfig.DeviceLocation,
                    MachineVendPrices: {
                        BaseCyclePrices: machineFeatureMockConfig.MachineVendPrices.BaseCyclePrices,
                        ModifierCyclePrices: machineFeatureMockConfig.MachineVendPrices.ModifierCyclePrices,
                    },
                    TopoffData: {
                        TopOff_price: machineFeatureMockConfig.TopoffData.TopOff_price,
                        TopOff_Time: machineFeatureMockConfig.TopoffData.TopOff_Time,
                    },
                    TopoffData_fullCycle: {
                        TopOff_price: machineFeatureMockConfig.TopoffData_fullCycle.TopOff_price,
                        TopOff_Time: machineFeatureMockConfig.TopoffData_fullCycle.TopOff_Time,
                    },
                });
        });
    });
});