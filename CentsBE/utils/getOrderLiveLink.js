const jwt = require('jsonwebtoken');

function getOrderLiveLink(req, res, next) {
    try {
        const { id } = req.params;
        const token = jwt.sign({ id }, process.env.JWT_SECRET_TOKEN_ORDER);
        const liveLink = process.env.LIVE_LINK;
        const url = `${liveLink}${token}`;

        res.status(200).json({
            success: true,
            url,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getOrderLiveLink;
