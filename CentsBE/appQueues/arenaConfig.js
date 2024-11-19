const Bull = require('bull');
const Arena = require('bull-arena');
const redisConfig = require('./config');
const QueueNames = Object.values(require('./index').queueNames);

const queues = QueueNames.map((val) => ({
    name: val,
    url: redisConfig.redisUrl,
    hostId: 'Cents_Jobs',
}));

module.exports = Arena(
    {
        Bull,
        queues,
    },
    {
        // Make the arena dashboard become available at {my-site.com}/arena.
        basePath: '/',
        disableListen: true,
    },
);
