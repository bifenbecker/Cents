const getMachineDetailsByBarcodePipeline = require('../../../pipeline/liveLink/getMachineDetailsByBarcodePipeline');
const getBusinessThemeByMachineBarcodePipeline = require('../../../pipeline/liveLink/getBusinessThemeByMachineBarcodePipeline');
const getTurnDetailsWithOrderPipeline = require('../../../pipeline/liveLink/getTurnDetailsWithOrderPipeline');
const runSelfServeMachinePipeline = require('../../../pipeline/machines/runSelfServeMachinePipeline');
const { serviceTypes, origins } = require('../../../constants/constants');

const getMachineDetailsByBarcode = async (req, res, next) => {
    try {
        const payload = {
            barcode: req.params.barcode,
        };
        const result = await getMachineDetailsByBarcodePipeline(payload);

        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

const getBusinessThemeByMachineBarcode = async (req, res, next) => {
    try {
        const payload = {
            barcode: req.params.barcode,
        };
        const theme = await getBusinessThemeByMachineBarcodePipeline(payload);
        return res.status(200).json({ theme });
    } catch (error) {
        return next(error);
    }
};

const getTurnDetailsWithOrder = async (req, res, next) => {
    try {
        const payload = {
            turnId: req.params.turnId,
            constants: req.constants,
        };

        const result = await getTurnDetailsWithOrderPipeline(payload);

        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

const runMachine = async (req, res, next) => {
    try {
        const { params, body, currentCustomer, constants } = req;
        const payload = {
            machineId: params.machineId,
            creditAmount: constants.creditAmount,
            quantity: body.quantity,
            centsCustomerId: currentCustomer.id,
            centsCustomer: currentCustomer,
            serviceType: serviceTypes.SELF_SERVICE,
            origin: origins.LIVE_LINK,
        };

        const result = await runSelfServeMachinePipeline(payload);
        const { orderId, turnId } = result;

        return res.status(202).json({
            success: true,
            orderId,
            turnId,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getMachineDetailsByBarcode,
    getBusinessThemeByMachineBarcode,
    getTurnDetailsWithOrder,
    runMachine,
};
