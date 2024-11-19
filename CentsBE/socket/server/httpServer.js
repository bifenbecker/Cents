/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const http = require('http');

const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const app = express();
const httpServer = http.Server(app);

const routesHandler = require('../../routes');
const swaggerDocument = require('../../swagger.json');
const errorHandler = require('../../errorHandler');

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs-edit', express.static('node_modules/swagger-editor-dist'));
}

app.use('/api/v1', routesHandler);

app.use((error, req, res, next) => {
    console.log('error', error);
    const body = {
        error: 'Something went wrong!',
    };
    if (process.env.NODE_ENV === 'development') {
        errorHandler(error, res);
    } else {
        res.status(500).json(body);
        // eslint-disable-next-line no-console
        console.error(error);
    }
});

module.exports = httpServer;
