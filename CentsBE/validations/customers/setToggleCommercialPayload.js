const setToggleCommercialPayload = (req, res, next) => {
    try {
        const { isCommercial } = req.body;

        if (!isCommercial) {
            req.body.commercialTierId = null;
            req.body.isInvoicingEnabled = false;
        }

        next();
    } catch (error) {
        throw Error(error);
    }
};

module.exports = exports = setToggleCommercialPayload;
