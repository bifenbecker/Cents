const { transaction } = require('objection');
const Model = require('../models');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

class Pipeline {
    /**
     * @param stages
     * @param {function} errorHandler - callback which passes error from UOW to controller where pipeline where created
     */
    constructor(stages, errorHandler = null) {
        this.transaction = null;
        this.stages = stages;
        this.errorHandler = errorHandler;
    }

    /**
     * Starts the unit of work for our database
     */
    async startTransaction() {
        this.transaction = await transaction.start(Model.knex());
    }

    /**
     * Commit the transaction to the database
     */
    async commitTransaction() {
        await this.transaction.commit();
    }

    /**
     * Rollback the transacion
     */
    async rollbackTransaction() {
        await this.transaction.rollback();
    }

    /**
     * Adds a new stage. Stage can be a function or some literal value. In case
     * of literal values. That specified value will be passed to the next stage and the
     * output from last stage gets ignored
     *
     * @param stage
     * @returns {Pipeline}
     */
    async pipe(stage) {
        this.stages.push(stage);

        return this;
    }

    /**
     * Processes the pipeline with passed arguments
     *
     * @param payload
     * @returns {*}
     */
    async process(payload) {
        try {
            if (this.stages.length === 0) {
                return payload;
            }

            let stageOutput = payload;
            stageOutput.transaction = this.transaction;

            this.stages.forEach((stage) => {
                // Output from the last stage was promise
                if (stageOutput && typeof stageOutput.then === 'function') {
                    // Call the next stage only when the promise is fulfilled
                    stageOutput = stageOutput.then((...params) =>
                        stage.apply(this, [...params, this.errorHandler]),
                    );
                } else {
                    // Otherwise, call the next stage with the last stage output
                    if (typeof stage === 'function') {
                        stageOutput = stage(stageOutput, this.errorHandler);
                    } else {
                        stageOutput = stage;
                    }
                }
            });
            return stageOutput;
        } catch (error) {
            throw Error(error.message);
        }
    }

    /**
     * Runs the pipeline processing with the passed payload
     *
     * @param payload
     * @returns {*}
     */
    async run(payload) {
        try {
            await this.startTransaction();
            const output = await this.process(payload);
            await this.commitTransaction();
            return output;
        } catch (error) {
            LoggerHandler('error', error, { payload });
            await this.rollbackTransaction();
            throw error;
        }
    }
}

module.exports = exports = Pipeline;
