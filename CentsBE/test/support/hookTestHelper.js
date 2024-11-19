const factory = require('../factories');
const { expect } = require('./chaiHelper');

const beforeUpdateHookTestHelper = async ({
    factoryName,
    factoryData,
    model,
    patchPropName,
    patchPropValue,
}) => {
    const currentFactory = await factory.create(factoryName, factoryData);
    const initialState = await model.query().findById(currentFactory.id).returning('*');
    const updatedState = await model
        .query()
        .patch({
            [patchPropName]: patchPropValue,
        })
        .findById(currentFactory.id)
        .returning('*');

    return (
        expect(Date.parse(updatedState.updatedAt)).to.not.be.NaN &&
        expect(initialState.updatedAt.getTime()).to.not.be.equal(updatedState.updatedAt.getTime())
    );
};

const beforeInsertHookTestHelper = async ({ factoryName, factoryData, model }) => {
    const currentFactory = await factory.create(factoryName, factoryData);
    const initialState = await model.query().findById(currentFactory.id).returning('*');

    return expect(Date.parse(initialState.createdAt)).to.not.be.NaN;
};

module.exports = exports = {
    beforeUpdateHookTestHelper,
    beforeInsertHookTestHelper,
};
