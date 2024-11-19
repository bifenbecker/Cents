const { ExpressAdapter } = require('@bull-board/express');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { createBullBoard } = require('@bull-board/api');

const { queues } = require('./index');

const serverAdapter = new ExpressAdapter();
const queueAdapters = Object.values(queues).map((queue) => new BullAdapter(queue));

createBullBoard({
    queues: queueAdapters,
    serverAdapter,
});

module.exports = {
    serverAdapter,
};
