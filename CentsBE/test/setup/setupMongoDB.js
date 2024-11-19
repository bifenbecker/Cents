require('../testHelper');
const { connectToMongodb } = require('../support/mongodbHelper');

before(async () => {
    await connectToMongodb();
});
