const { REDIS_URL } = process.env;
const Redis = require('ioredis');

function newRedis() {
    return new Redis(REDIS_URL);
}

// TODO: DRY-refactor
const queueOptions = {
    createClient(type) {
        switch (type) {
            case 'client':
                return newRedis();
            case 'subscriber':
                return newRedis();
            default:
                return newRedis();
        }
    },
};

const queueOptions1 = {
    createClient(type) {
        switch (type) {
            case 'client':
                return newRedis();
            case 'subscriber':
                return newRedis();
            default:
                return newRedis();
        }
    },
};

const queueOptions2 = {
    createClient(type) {
        switch (type) {
            case 'client':
                return newRedis();
            case 'subscriber':
                return newRedis();
            default:
                return newRedis();
        }
    },
};

const queueOptions3 = {
    createClient(type) {
        switch (type) {
            case 'client':
                return newRedis();
            case 'subscriber':
                return newRedis();
            default:
                return newRedis();
        }
    },
};

module.exports = {
    redisUrl: `${process.env.REDIS_URL}`,
    queueOptions,
    queueOptions1,
    queueOptions2,
    queueOptions3,
};
