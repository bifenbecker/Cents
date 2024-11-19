const mapMachineProgramming = require('./mapMachineProgramming');
const mapMachineModel = require('./mapMachineModel');
const mapMachineFeature = require('./mapMachineFeature');

const mapAllConfigurations = (configurations) => {
    const machineFeature = mapMachineFeature(configurations);
    const machineModel = mapMachineModel(configurations);
    const machineProgramming = mapMachineProgramming(configurations);

    return {
        machineFeature,
        machineModel,
        machineProgramming,
    };
};

module.exports = mapAllConfigurations;
