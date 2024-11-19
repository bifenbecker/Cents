const jwt = require('jsonwebtoken');
const userModel = require('../../../models/user');

/**
 * Function to get the Productboard feedback link for the logged-in user.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {String} feedback url
 */
async function getFeedbackLink(req, res, next) {
    const { PRODUCTBOARD_BASE_URL, PRODUCTBOARD_KEY } = process.env;
    const { userId } = req.query;

    try {
        const user = await userModel
            .query()
            .leftJoinRelated('teamMember.business')
            .findOne('users.id', userId)
            .select(
                'firstname',
                'lastname',
                'email',
                'users.id as id',
                'teamMember:business.id as company_name',
                'teamMember:business.name as company_domain',
            );

        user.name = `${user.firstname} ${user.lastname}`;

        const token = await jwt.sign({ ...user }, PRODUCTBOARD_KEY, { algorithm: 'HS256' });

        res.json({
            success: true,
            url: `${PRODUCTBOARD_BASE_URL}?token=${token}`,
        });
        return;
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getFeedbackLink;
