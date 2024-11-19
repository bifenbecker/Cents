const Pipeline = require('../pipeline');

const getDryCleaningCategoryTurnaroundTime = require('../../uow/liveLink/services/getDryCleaningCategoryTurnaroundTimeUow');
const getWashAndFoldCategoryTurnaroundTime = require('../../uow/liveLink/services/getWashAndFoldCategoryTurnaroundTimeUow');

/**
 * Retrieves the turnaround times for each high-level ServiceCategoryType
 *
 * This pipeline contains logic that is processed as follows:
 *
 * 1) Fetch turnaround time for services with DRY_CLEANING ServiceCategoryType
 * 2) Fetch turnaround time for the delivery Wash&Fold services
 *
 * @param {*} payload
 */
async function getTurnAroundTimeForCategoriesPipeline(payload) {
    try {
        const turnaroundTimePipeline = new Pipeline([
            getDryCleaningCategoryTurnaroundTime,
            getWashAndFoldCategoryTurnaroundTime,
        ]);

        return turnaroundTimePipeline.run(payload);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = getTurnAroundTimeForCategoriesPipeline;
