const { ValidationError, NotFoundError } = require('objection');

const {
    DBError,
    // ConstraintViolationError,
    UniqueViolationError,
    NotNullViolationError,
    ForeignKeyViolationError,
    CheckViolationError,
    DataError,
} = require('objection-db-errors');

const stripeErrorHandler = require('./utils/stripeErrorHandler');

module.exports = exports = function handleError(err, res) {
    if (err instanceof ValidationError) {
        switch (err.type) {
            case 'ModelValidation':
                res.status(400).json({
                    error: err.error,
                });
                break;
            case 'RelationExpression':
                res.status(400).json({
                    error: err.error,
                });
                break;
            case 'UnallowedRelation':
                res.status(400).json({
                    error: err.error,
                });
                break;
            case 'InvalidGraph':
                res.status(400).json({
                    error: err.error,
                });
                break;
            default:
                res.status(400).json({
                    error: err.error,
                });
                break;
        }
    } else if (err instanceof NotFoundError) {
        res.status(404).json({
            error: err.error,
        });
    } else if (err instanceof UniqueViolationError) {
        res.status(409).json({
            error: err.error,
        });
    } else if (err instanceof NotNullViolationError) {
        res.status(400).json({
            error: err.error,
        });
    } else if (err instanceof ForeignKeyViolationError) {
        res.status(409).json({
            error: err.error,
        });
    } else if (err instanceof CheckViolationError) {
        res.status(400).json({
            error: err.error,
        });
    } else if (err instanceof DataError) {
        res.status(400).json({
            error: err.error,
        });
    } else if (err instanceof DBError) {
        res.status(500).json({
            error: err.error,
        });
    } else {
        res.status(500).json({
            error: stripeErrorHandler(err),
        });
    }
};
