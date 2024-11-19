const mongoose = require('mongoose');
const mongodb = require('../../lib/mongodb');
const { expect } = require('./chaiHelper');

async function connectToMongodb() {
    // check is already connected
    if (mongoose.connection.readyState !== mongoose.STATES.connected) {
        await mongodb.connect();
    }
}

const hasCollection = (collectionName) => {
    const collections = Object.values(mongoose.connection.collections);
    return !!collections.find((collection) => collection.collectionName === collectionName);
};

const hasPath = (model, pathName) => {
    return expect(model.schema.paths[pathName]).to.exist;
};

module.exports = {
    connectToMongodb,
    hasCollection,
    hasPath,
};
