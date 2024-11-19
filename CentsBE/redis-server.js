const Redis = require('ioredis');
const LoggerHandler = require('./LoggerHandler/LoggerHandler');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', (error) => {
    if (error) {
        LoggerHandler('error', `Something went wrong ' + ${error}`);
    } else {
        LoggerHandler('info', 'redis Server started successfully');
    }
});

module.exports = redis;
