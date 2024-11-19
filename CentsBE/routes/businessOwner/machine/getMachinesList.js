const getMachinesListPipeline = require('../../../pipeline/machines/getMachinesListPipeline');

const listMachines = async (req, res, next) => {
    try {
        const payload = {
            ...req.query,
        };
        const result = await getMachinesListPipeline(payload);
        return res.json({
            ...result,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    listMachines,
};
