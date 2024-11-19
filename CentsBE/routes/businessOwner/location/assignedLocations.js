const jwt = require('jsonwebtoken');
const getBusiness = require('../../../utils/getBusiness');
const getAssignedLocationsPipeline = require('../../../pipeline/locations/assignedLocationsPipeline');
/**
 * Funtion to get the assigned locations of the business-owner logged in.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} assigned locations
 */
async function getAssignedLocations(req, res, next) {
    try {
        const decodedToken = jwt.verify(req.headers.authtoken, process.env.JWT_SECRET_TOKEN);
        const business = await getBusiness(req);
        const response = await getAssignedLocationsPipeline({
            ...req,
            teamMemberId: decodedToken.teamMemberId,
            businessId: business.id,
        });
        res.json({
            success: true,
            ...response,
        });
        return;
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getAssignedLocations;
