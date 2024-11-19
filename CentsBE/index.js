require('dotenv').config({});
require('./lib/newrelicIntegration');

const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const MessageBroker = require('./message_broker/messageBroker');

const app = express();

const routesHandler = require('./routes');
const LoggerHandler = require('./LoggerHandler/LoggerHandler');
const httpLogger = require('./lib/httpLogger');
const mongodb = require('./lib/mongodb');

const swaggerDocument = require('./swagger-output.json');
const errorHandler = require('./errorHandler');
const stripErrorHandler = require('./utils/stripeErrorHandler');

const arenaMiddleware = require('./appQueues/arenaConfig');
require('./config/eventListeners');
const { serverAdapter } = require('./appQueues/bullBoardConfig');

// region CONSTANTS
const PORT = process.env.PORT || 3001;
// end region

app.use(httpLogger);

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);

app.use('/api/v1/webhooks/stripe', bodyParser.raw({ type: '*/*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs-edit', express.static('node_modules/swagger-editor-dist'));
}

app.use('/api/health', (req, res) => {
    res.send('healthy');
});
app.use('/api/v1', routesHandler);

// Bull dashboard
serverAdapter.setBasePath('/bull-board');

app.use(
    '/bull-board',
    basicAuth({
        challenge: true,
        users: {
            devadmin: process.env.DEV_ADMIN_PASSWORD,
        },
        realm: 'TRYCENTS',
    }),
    serverAdapter.getRouter(),
);

// Arena middleware
app.use(
    '/arena',
    basicAuth({
        challenge: true,
        users: {
            devadmin: process.env.DEV_ADMIN_PASSWORD,
        },
        realm: 'TRYCENTS',
    }),
    arenaMiddleware,
);

const server = app.listen(PORT, async (error) => {
    if (error) {
        LoggerHandler('error', error);
    } else {
        await mongodb.connect();
        const { RABBITMQ_URL } = process.env;
        if (RABBITMQ_URL) {
            await MessageBroker.GetInstance();
            // await MessageBroker.publish(JSON.stringify({ message: 'Demo Message' }));
            await MessageBroker.subscribe();
        }
        LoggerHandler('info', `HTTP Server started successfully on port: ${PORT}`);
    }
});

server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT) * 1000; // This must be longer than the ELB idle connection timeout.
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT) * 1000; // This must be longer than the keep alive timeout

app.use((error, req, res, next) => {
    LoggerHandler('error', error, req);
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Invalid token.',
        });
    } else if (process.env.NODE_ENV === 'development') {
        errorHandler(error, res);
    } else {
        const message = stripErrorHandler(error);
        res.status(500).json({
            error: error.message || message,
        });
    }
});

module.exports = app;
